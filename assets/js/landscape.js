/* Landscape page: descriptive distributions + full-corpus UMAP by integrated cluster. */
(async function () {
  const status = $('data-status');
  try {
    if (status) status.textContent = 'Loading corpus…';
    const papers = normalizePapers(await loadCSV(DATA.papers));

    const f = papers.map(p => p.Fraction_IFIBIO).filter(v => v != null);
    Plotly.newPlot('fraction-chart', [{ x: f, type: 'histogram', nbinsx: 12, marker: { color: '#7dd3fc' }, hovertemplate: 'Fraction %{x:.2f}<br>%{y} papers<extra></extra>' }],
      { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: 'Fraction of IFIBIO authors' }, yaxis: { ...plotLayout.yaxis, title: 'Papers' } }, plotConfig);

    const a = papers.map(p => p.N_Authors).filter(v => v != null && v <= 40);
    Plotly.newPlot('authors-chart', [{ x: a, type: 'histogram', nbinsx: 25, marker: { color: '#a78bfa' }, hovertemplate: '%{x} authors<br>%{y} papers<extra></extra>' }],
      { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: 'Authors per paper' }, yaxis: { ...plotLayout.yaxis, title: 'Papers' } }, plotConfig);

    const m = papers.map(p => p.N_MeSH).filter(v => v != null);
    Plotly.newPlot('mesh-count-chart', [{ x: m, type: 'histogram', marker: { color: '#6ee7b7' } }],
      { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: 'MeSH terms' }, yaxis: { ...plotLayout.yaxis, title: 'Papers' } }, plotConfig);

    const k = papers.map(p => p.N_Keywords).filter(v => v != null);
    Plotly.newPlot('keyword-count-chart', [{ x: k, type: 'histogram', marker: { color: '#fbbf24' } }],
      { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: 'Keywords' }, yaxis: { ...plotLayout.yaxis, title: 'Papers' } }, plotConfig);

    renderUMAP('landscape-chart', papers);

    // Additional views straight from integrated_paper_ml_dataset.csv (additive, doesn't touch the charts above).
    const centrality = papers.filter(p => p.Paper_PageRank != null && p.Paper_Betweenness != null);
    Plotly.newPlot('centrality-chart', [{
      x: centrality.map(p => p.Paper_Betweenness), y: centrality.map(p => p.Paper_PageRank), type: 'scattergl', mode: 'markers',
      text: centrality.map(p => p.Title), customdata: centrality.map(p => [p.Integrated_Cluster, p.Paper_Degree]),
      marker: { size: 8, opacity: .75, color: centrality.map(p => p.Integrated_Cluster ?? -1), colorscale: 'Viridis', line: { width: .5, color: '#08101f' } },
      hovertemplate: '<b>%{text}</b><br>Betweenness %{x:.3f} · PageRank %{y:.4f}<br>Cluster %{customdata[0]} · Degree %{customdata[1]}<extra></extra>',
    }], { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: 'Betweenness (bridges topics)' }, yaxis: { ...plotLayout.yaxis, title: 'PageRank (structural prominence)' } }, plotConfig);

    const team = papers.filter(p => p.Mean_Author_Publications != null && p.N_Authors != null);
    Plotly.newPlot('team-experience-chart', [{
      x: team.map(p => p.N_Authors), y: team.map(p => p.Mean_Author_Publications), type: 'scattergl', mode: 'markers',
      text: team.map(p => p.Title),
      marker: { size: 8, opacity: .75, color: team.map(p => p.Fraction_IFIBIO ?? 0), colorscale: 'Bluered', cmin: 0, cmax: 1, colorbar: { title: 'IFIBIO fraction', thickness: 12, len: .6 }, line: { width: .5, color: '#08101f' } },
      hovertemplate: '<b>%{text}</b><br>%{x} authors · avg %{y:.1f} prior pubs/author<extra></extra>',
    }], { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: 'Authors on the paper' }, yaxis: { ...plotLayout.yaxis, title: 'Mean prior publications per author' } }, plotConfig);

    const social = Object.entries(groupCount(papers, 'Social_Cluster')).filter(d => d[0] !== '').sort((a, b) => b[1] - a[1]);
    Plotly.newPlot('social-cluster-chart', [{
      x: social.map(d => `Cluster ${d[0]}`), y: social.map(d => d[1]), type: 'bar',
      marker: { color: social.map((_, i) => i), colorscale: 'Plasma', line: { width: 0 } },
      hovertemplate: '<b>%{x}</b><br>%{y} papers<extra></extra>',
    }], { ...plotLayout, yaxis: { ...plotLayout.yaxis, title: 'Papers' } }, plotConfig);

    const yff = papers.map(p => p.Years_From_First).filter(v => v != null && v >= 0);
    Plotly.newPlot('years-from-first-chart', [{ x: yff, type: 'histogram', marker: { color: '#f472b6' }, hovertemplate: '%{x} years<br>%{y} papers<extra></extra>' }],
      { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: 'Years since the dataset\'s first publication' }, yaxis: { ...plotLayout.yaxis, title: 'Papers' } }, plotConfig);

    if (status) status.textContent = `${papers.length} papers loaded`;
  } catch (err) {
    console.error(err);
    if (status) { status.textContent = 'Data error'; status.title = err?.message || '' }
  }
})();
