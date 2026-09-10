/* Biological landscape: lightweight views over precomputed IFIBIO biological outputs. */
(function () {
  const BIO = {
    diseases: `${BASEURL}/ifibio_disease_catalog.csv`,
    diseaseProfile: `${BASEURL}/ifibio_disease_gene_profile.csv`,
    geneProfile: `${BASEURL}/ifibio_gene_disease_profile.csv`,
    geneDisease: `${BASEURL}/ifibio_gene_disease_comention.csv`,
    pathways: `${BASEURL}/ifibio_pathway_ranking.csv`,
    enrichment: `${BASEURL}/ifibio_gprofiler_enrichment_corrected.csv`,
  };

  const palette = {
    gene: '#2563eb', disease: '#be123c', accent: '#0f766e', gold: '#b45309',
    paleGene: '#dbeafe', paleDisease: '#ffe4e6', edge: '#94a3b8', text: '#334155'
  };

  const truncate = (s, n = 50) => {
    s = String(s || '');
    return s.length > n ? `${s.slice(0, n - 1)}…` : s;
  };

  function baseLayout(extra = {}) {
    return {
      ...plotLayout,
      margin: { l: 70, r: 24, t: 20, b: 55 },
      hovermode: 'closest',
      ...extra,
    };
  }

  function renderDiseaseBar(rows) {
    const top = rows
      .map(r => ({ name: r.NormalizedName, papers: num(r.Papers), mentions: num(r.Mentions) }))
      .filter(r => r.name && r.papers != null)
      .sort((a, b) => b.papers - a.papers || (b.mentions || 0) - (a.mentions || 0))
      .slice(0, 18)
      .reverse();

    Plotly.newPlot('bio-disease-bar', [{
      type: 'bar', orientation: 'h',
      x: top.map(d => d.papers), y: top.map(d => d.name),
      customdata: top.map(d => d.mentions),
      marker: { color: top.map(d => d.papers), colorscale: 'Tealgrn', showscale: false },
      hovertemplate: '<b>%{y}</b><br>%{x} papers<br>%{customdata} mentions<extra></extra>'
    }], baseLayout({
      xaxis: { ...plotLayout.xaxis, title: 'Papers' },
      yaxis: { ...plotLayout.yaxis, automargin: true },
      height: 530,
    }), plotConfig);
  }

  function renderDiseaseBubble(rows) {
    const pts = rows
      .map(r => ({ disease: r.Disease, genes: num(r.Genes), papers: num(r.Supporting_papers), associations: num(r.Associations) }))
      .filter(r => r.disease && r.genes != null && r.papers != null)
      .sort((a, b) => b.papers - a.papers)
      .slice(0, 45);
    const maxA = Math.max(1, ...pts.map(d => d.associations || 1));

    Plotly.newPlot('bio-disease-bubble', [{
      type: 'scatter', mode: 'markers',
      x: pts.map(d => d.genes), y: pts.map(d => d.papers),
      text: pts.map(d => d.disease),
      customdata: pts.map(d => d.associations),
      marker: {
        size: pts.map(d => 10 + 26 * Math.sqrt((d.associations || 1) / maxA)),
        color: pts.map(d => d.genes), colorscale: 'Plasma', opacity: .78,
        line: { width: .7, color: '#ffffff' }, showscale: false
      },
      hovertemplate: '<b>%{text}</b><br>%{x} genes<br>%{y} supporting-paper counts<br>%{customdata} gene–disease pairs<extra></extra>'
    }], baseLayout({
      xaxis: { ...plotLayout.xaxis, title: 'Distinct genes' },
      yaxis: { ...plotLayout.yaxis, title: 'Supporting-paper counts' },
      height: 530,
    }), plotConfig);
  }

  function renderGeneHubs(rows) {
    const top = rows
      .map(r => ({ gene: r.Gene, diseases: num(r.Diseases), papers: num(r.Supporting_papers) }))
      .filter(r => r.gene && r.diseases != null)
      .sort((a, b) => b.diseases - a.diseases || (b.papers || 0) - (a.papers || 0))
      .slice(0, 18)
      .reverse();

    Plotly.newPlot('bio-gene-hubs', [{
      type: 'bar', orientation: 'h',
      x: top.map(d => d.diseases), y: top.map(d => d.gene),
      customdata: top.map(d => d.papers),
      marker: { color: top.map(d => d.papers || 0), colorscale: 'Blues', showscale: false },
      hovertemplate: '<b>%{y}</b><br>%{x} diseases<br>%{customdata} supporting-paper counts<extra></extra>'
    }], baseLayout({
      xaxis: { ...plotLayout.xaxis, title: 'Distinct diseases' },
      yaxis: { ...plotLayout.yaxis, automargin: true },
      height: 500,
    }), plotConfig);
  }

  function renderEdgeSupport(rows) {
    const counts = {};
    rows.forEach(r => {
      const p = num(r.Papers);
      if (p != null) counts[p] = (counts[p] || 0) + 1;
    });
    const x = Object.keys(counts).map(Number).sort((a, b) => a - b);
    Plotly.newPlot('bio-edge-support', [{
      type: 'bar', x, y: x.map(k => counts[k]),
      marker: { color: x, colorscale: 'Reds', showscale: false },
      hovertemplate: '%{x} supporting paper(s)<br>%{y} gene–disease pairs<extra></extra>'
    }], baseLayout({
      xaxis: { ...plotLayout.xaxis, title: 'Papers supporting a co-mention pair', dtick: 1 },
      yaxis: { ...plotLayout.yaxis, title: 'Gene–disease pairs' },
      height: 500,
    }), plotConfig);
  }

  function buildGeneDiseaseNetwork(rows) {
    const recurrent = rows
      .map(r => ({
        geneId: String(r.GeneID || ''), gene: r.Gene,
        diseaseId: String(r.DiseaseID || ''), disease: r.Disease,
        papers: num(r.Papers) || 0, pmids: parseList(r.PMIDs)
      }))
      .filter(r => r.gene && r.disease && r.papers >= 2)
      .sort((a, b) => b.papers - a.papers)
      .slice(0, 90);

    const geneWeights = {}, diseaseWeights = {};
    recurrent.forEach(r => {
      geneWeights[r.geneId] = (geneWeights[r.geneId] || 0) + r.papers;
      diseaseWeights[r.diseaseId] = (diseaseWeights[r.diseaseId] || 0) + r.papers;
    });
    const genes = [...new Map(recurrent.map(r => [r.geneId, r.gene])).entries()]
      .sort((a, b) => (geneWeights[b[0]] || 0) - (geneWeights[a[0]] || 0));
    const diseases = [...new Map(recurrent.map(r => [r.diseaseId, r.disease])).entries()]
      .sort((a, b) => (diseaseWeights[b[0]] || 0) - (diseaseWeights[a[0]] || 0));

    const spacing = 58;
    const maxRows = Math.max(genes.length, diseases.length);
    const yOffset = list => ((maxRows - list.length) * spacing) / 2;
    const elements = [];

    genes.forEach(([id, label], i) => elements.push({
      data: { id: `g:${id}`, label, type: 'gene', weight: geneWeights[id] || 1 },
      position: { x: 120, y: 40 + yOffset(genes) + i * spacing }
    }));
    diseases.forEach(([id, label], i) => elements.push({
      data: { id: `d:${id}`, label, type: 'disease', weight: diseaseWeights[id] || 1 },
      position: { x: 900, y: 40 + yOffset(diseases) + i * spacing }
    }));
    recurrent.forEach((r, i) => elements.push({ data: {
      id: `gd:${i}`, source: `g:${r.geneId}`, target: `d:${r.diseaseId}`,
      papers: r.papers, pmids: r.pmids.join(', '), gene: r.gene, disease: r.disease
    }}));

    const cy = cytoscape({
      container: $('bio-gd-network'), elements,
      minZoom: .25, maxZoom: 2.5,
      style: [
        { selector: 'node', style: {
          'label': 'data(label)', 'font-family': 'Inter, system-ui, sans-serif', 'font-size': 9,
          'text-wrap': 'wrap', 'text-max-width': 120, 'text-valign': 'center',
          'border-width': 1.5, 'border-color': '#ffffff',
          'width': 'mapData(weight, 1, 80, 24, 54)', 'height': 'mapData(weight, 1, 80, 24, 54)'
        }},
        { selector: 'node[type="gene"]', style: {
          'shape': 'ellipse', 'background-color': palette.gene, 'color': '#0f172a',
          'text-halign': 'right', 'text-margin-x': -10
        }},
        { selector: 'node[type="disease"]', style: {
          'shape': 'round-rectangle', 'background-color': palette.disease, 'color': '#0f172a',
          'text-halign': 'left', 'text-margin-x': 10, 'width': 'mapData(weight, 1, 80, 30, 62)'
        }},
        { selector: 'edge', style: {
          'curve-style': 'bezier', 'line-color': palette.edge, 'opacity': .32,
          'width': 'mapData(papers, 2, 13, 1, 7)'
        }},
        { selector: ':selected', style: { 'border-width': 4, 'border-color': '#f59e0b' } },
        { selector: '.dim', style: { 'opacity': .08 } },
        { selector: '.focus', style: { 'opacity': 1, 'z-index': 10 } }
      ],
      layout: { name: 'preset', fit: true, padding: 48 },
    });

    const detail = $('bio-network-detail');
    cy.on('tap', 'node', e => {
      const node = e.target;
      const neighborhood = node.closedNeighborhood();
      cy.elements().addClass('dim');
      neighborhood.removeClass('dim').addClass('focus');
      const kind = node.data('type') === 'gene' ? 'Gene' : 'Disease';
      const neighbors = node.neighborhood('node').map(n => n.data('label'));
      detail.innerHTML = `<strong>${kind}: ${esc(node.data('label'))}</strong> · ${neighbors.length} visible recurrent connection(s): ${neighbors.map(x => esc(x)).join(', ')}`;
    });
    cy.on('tap', 'edge', e => {
      const d = e.target.data();
      detail.innerHTML = `<strong>${esc(d.gene)} ↔ ${esc(d.disease)}</strong> · ${d.papers} supporting paper(s) · PMID: ${esc(d.pmids || '—')}`;
    });
    cy.on('tap', e => {
      if (e.target === cy) {
        cy.elements().removeClass('dim focus');
        detail.textContent = 'Click a gene, disease or edge to inspect the visible recurrent co-mention structure.';
      }
    });
  }

  function renderPathways(rows) {
    const clean = rows
      .map(r => ({ source: r.PathwaySource, id: r.PathwayID, name: r.PathwayName, genes: num(r.N_genes) }))
      .filter(r => r.name && r.genes != null)
      .sort((a, b) => b.genes - a.genes);
    const top = clean.slice(0, 18).reverse();

    Plotly.newPlot('bio-pathway-bar', [{
      type: 'bar', orientation: 'h',
      x: top.map(d => d.genes), y: top.map(d => truncate(d.name, 58)),
      text: top.map(d => d.source), customdata: top.map(d => [d.id, d.name]),
      marker: { color: top.map(d => d.genes), colorscale: 'Viridis', showscale: false },
      hovertemplate: '<b>%{customdata[1]}</b><br>%{x} mapped genes<br>%{text} · %{customdata[0]}<extra></extra>'
    }], baseLayout({
      xaxis: { ...plotLayout.xaxis, title: 'Mapped genes' },
      yaxis: { ...plotLayout.yaxis, automargin: true },
      height: 560,
    }), plotConfig);

    const sourceCounts = {};
    clean.slice(0, 150).forEach(d => sourceCounts[d.source] = (sourceCounts[d.source] || 0) + 1);
    const entries = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
    Plotly.newPlot('bio-pathway-source', [{
      type: 'pie', hole: .58,
      labels: entries.map(d => d[0]), values: entries.map(d => d[1]),
      textinfo: 'label+percent', textposition: 'outside', automargin: true,
      hovertemplate: '<b>%{label}</b><br>%{value} of top 150 mapped pathways<extra></extra>'
    }], baseLayout({
      showlegend: false, height: 560, margin: { l: 35, r: 35, t: 20, b: 30 }
    }), plotConfig);
  }

  function renderEnrichment(rows) {
    const clean = rows
      .map(r => ({
        source: r.source, name: r.name,
        p: num(r.p_value), sig: String(r.significant).toLowerCase() === 'true',
        termSize: num(r.term_size), hits: num(r.intersection_size), ratio: num(r.GeneRatio),
        fold: num(r.FoldEnrichment), mlp: num(r.minus_log10_p)
      }))
      .filter(r => r.sig && r.fold != null && r.ratio != null && r.mlp != null && r.termSize >= 10 && r.termSize <= 1500)
      .sort((a, b) => b.mlp - a.mlp)
      .slice(0, 70);

    const sources = [...new Set(clean.map(d => d.source))];
    const traces = sources.map(source => {
      const pts = clean.filter(d => d.source === source);
      return {
        type: 'scatter', mode: 'markers', name: source,
        x: pts.map(d => d.fold), y: pts.map(d => d.ratio),
        text: pts.map(d => d.name), customdata: pts.map(d => [d.mlp, d.hits, d.termSize]),
        marker: {
          size: pts.map(d => 7 + 1.5 * Math.sqrt(d.hits || 1)),
          color: pts.map(d => d.mlp), colorscale: 'Turbo', cmin: 0,
          cmax: Math.max(...clean.map(x => x.mlp)), opacity: .78,
          line: { color: '#ffffff', width: .6 }, showscale: source === sources[0],
          colorbar: source === sources[0] ? { title: '−log10(FDR)', thickness: 12 } : undefined
        },
        hovertemplate: '<b>%{text}</b><br>Fold enrichment %{x:.2f}<br>Gene ratio %{y:.3f}<br>−log10(FDR) %{customdata[0]:.1f}<br>%{customdata[1]} genes · term size %{customdata[2]}<extra></extra>'
      };
    });

    Plotly.newPlot('bio-enrichment', traces, baseLayout({
      xaxis: { ...plotLayout.xaxis, title: 'Fold enrichment', rangemode: 'tozero' },
      yaxis: { ...plotLayout.yaxis, title: 'Gene ratio (query coverage)', rangemode: 'tozero' },
      legend: { orientation: 'h', y: -0.16 },
      height: 620,
    }), plotConfig);
  }

  async function init() {
    const status = $('bio-data-status');
    try {
      const [diseases, diseaseProfile, geneProfile, geneDisease, pathways, enrichment] = await Promise.all([
        loadCSV(BIO.diseases), loadCSV(BIO.diseaseProfile), loadCSV(BIO.geneProfile),
        loadCSV(BIO.geneDisease), loadCSV(BIO.pathways), loadCSV(BIO.enrichment)
      ]);
      renderDiseaseBar(diseases);
      renderDiseaseBubble(diseaseProfile);
      renderGeneHubs(geneProfile);
      renderEdgeSupport(geneDisease);
      buildGeneDiseaseNetwork(geneDisease);
      renderPathways(pathways);
      renderEnrichment(enrichment);
      if (status) { status.textContent = 'Biological data loaded'; status.className = 'label label-green'; }
    } catch (error) {
      console.error(error);
      if (status) { status.textContent = 'Biological data unavailable'; status.className = 'label label-red'; }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
