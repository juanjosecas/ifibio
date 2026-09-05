const DATA = {
  summary: 'ml_pubmed_ifibio/analysis_summary.json',
  papers: 'ml_pubmed_ifibio/integrated_paper_ml_dataset.csv',
  network: 'ml_pubmed_ifibio/coauthor_network.gexf'
};

const state = { papers: [], filtered: [], summary: null, cy: null, networkLoaded: false };
const plotConfig = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] };
const plotLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: '#cbd5e1', family: 'Inter, system-ui, sans-serif', size: 12 },
  margin: { l: 45, r: 20, t: 20, b: 45 },
  xaxis: { gridcolor: 'rgba(255,255,255,.06)', zerolinecolor: 'rgba(255,255,255,.08)' },
  yaxis: { gridcolor: 'rgba(255,255,255,.06)', zerolinecolor: 'rgba(255,255,255,.08)' },
  hoverlabel: { bgcolor: '#0f172a', bordercolor: 'rgba(255,255,255,.12)', font: { color: '#f8fafc' } }
};

function $(id) { return document.getElementById(id); }
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
function esc(s='') { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function groupCount(rows, key) {
  return rows.reduce((acc, row) => { const k = row[key]; if (k !== '' && k != null) acc[k] = (acc[k] || 0) + 1; return acc; }, {});
}
function sortedEntries(obj, numeric=true) {
  return Object.entries(obj).sort((a,b) => numeric ? Number(a[0]) - Number(b[0]) : b[1] - a[1]);
}

async function loadJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

async function loadCSV(path) {
  const text = await fetch(path).then(r => { if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.text(); });
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: false });
  if (parsed.errors.length) console.warn('CSV parser warnings', parsed.errors.slice(0,3));
  return parsed.data;
}

function normalizePapers(rows) {
  return rows.map(r => ({
    ...r,
    PMID: String(r.PMID || ''),
    Year: num(r.Year),
    Abstract_Cluster: num(r.Abstract_Cluster),
    Integrated_Cluster: num(r.Integrated_Cluster),
    NLP_Community: num(r.NLP_Community),
    N_Authors: num(r.N_Authors),
    N_IFIBIO_Authors: num(r.N_IFIBIO_Authors),
    Fraction_IFIBIO: num(r.Fraction_IFIBIO),
    N_Affiliations: num(r.N_Affiliations),
    N_MeSH: num(r.N_MeSH),
    N_Keywords: num(r.N_Keywords),
    Abstract_Words: num(r.Abstract_Words),
    UMAP1: num(r.UMAP1),
    UMAP2: num(r.UMAP2),
    Paper_PageRank: num(r.Paper_PageRank),
    Paper_Betweenness: num(r.Paper_Betweenness)
  })).filter(r => r.PMID && r.Title);
}

function renderKPIs() {
  const s = state.summary || {};
  $('kpi-papers').textContent = s.n_rows ?? state.papers.length;
  $('kpi-authors').textContent = s.n_unique_authors ?? '—';
  $('kpi-years').textContent = s.n_years ?? new Set(state.papers.map(d => d.Year).filter(Boolean)).size;
  $('kpi-clusters').textContent = s.n_clusters ?? new Set(state.papers.map(d => d.Integrated_Cluster).filter(v => v != null)).size;
  $('top-journal').textContent = s.top_journal || '—';
  $('top-keyword').textContent = s.top_keyword || '—';
  $('top-mesh').textContent = s.top_mesh || '—';
}

function renderOverview() {
  const years = sortedEntries(groupCount(state.papers, 'Year'));
  Plotly.newPlot('year-chart', [{
    x: years.map(d => Number(d[0])), y: years.map(d => d[1]), type: 'scatter', mode: 'lines+markers',
    line: { width: 3, color: '#7dd3fc' }, marker: { size: 7, color: '#a78bfa' },
    hovertemplate: '<b>%{x}</b><br>%{y} publications<extra></extra>'
  }], { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: 'Year', dtick: 1 }, yaxis: { ...plotLayout.yaxis, title: 'Publications' } }, plotConfig);

  const clusters = Object.entries(groupCount(state.papers, 'Integrated_Cluster')).filter(d => d[0] !== '').sort((a,b) => b[1]-a[1]);
  Plotly.newPlot('cluster-chart', [{
    x: clusters.map(d => `Cluster ${d[0]}`), y: clusters.map(d => d[1]), type: 'bar',
    marker: { color: clusters.map((_,i) => i), colorscale: 'Viridis', line: { width: 0 } },
    hovertemplate: '<b>%{x}</b><br>%{y} papers<extra></extra>'
  }], { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: '' }, yaxis: { ...plotLayout.yaxis, title: 'Papers' } }, plotConfig);

  const cats = { 'No IFIBIO author': 0, 'Mixed team': 0, 'All IFIBIO': 0 };
  state.papers.forEach(p => {
    const f = p.Fraction_IFIBIO;
    if (f == null || f <= 0) cats['No IFIBIO author']++;
    else if (f >= .999) cats['All IFIBIO']++;
    else cats['Mixed team']++;
  });
  Plotly.newPlot('ifibio-chart', [{
    labels: Object.keys(cats), values: Object.values(cats), type: 'pie', hole: .7,
    marker: { colors: ['#334155','#7dd3fc','#6ee7b7'] }, textinfo: 'none',
    hovertemplate: '<b>%{label}</b><br>%{value} papers · %{percent}<extra></extra>'
  }], { ...plotLayout, margin: { l: 8, r: 8, t: 8, b: 8 }, showlegend: true, legend: { orientation: 'h', y: -.08, x: .5, xanchor: 'center', font: { size: 10 } } }, plotConfig);
}

function populateFilters() {
  const years = [...new Set(state.papers.map(d => d.Year).filter(Boolean))].sort((a,b) => b-a);
  $('year-filter').insertAdjacentHTML('beforeend', years.map(y => `<option value="${y}">${y}</option>`).join(''));
  const clusters = [...new Set(state.papers.map(d => d.Integrated_Cluster).filter(v => v != null))].sort((a,b) => a-b);
  $('cluster-filter').insertAdjacentHTML('beforeend', clusters.map(c => `<option value="${c}">Cluster ${c}</option>`).join(''));
}

function applyPaperFilters() {
  const q = $('paper-search').value.trim().toLowerCase();
  const year = $('year-filter').value;
  const cluster = $('cluster-filter').value;
  state.filtered = state.papers.filter(p => {
    const textMatch = !q || p.Title.toLowerCase().includes(q) || p.PMID.includes(q);
    const yearMatch = year === 'all' || String(p.Year) === year;
    const clusterMatch = cluster === 'all' || String(p.Integrated_Cluster) === cluster;
    return textMatch && yearMatch && clusterMatch;
  });
  renderPaperTable();
  renderUMAP('umap-chart', state.filtered);
}

function renderPaperTable() {
  const rows = state.filtered.slice().sort((a,b) => (b.Year || 0) - (a.Year || 0)).slice(0,120);
  $('paper-count').textContent = `${state.filtered.length} papers${state.filtered.length > 120 ? ' · showing first 120' : ''}`;
  $('paper-table').innerHTML = rows.map(p => `
    <tr data-pmid="${esc(p.PMID)}">
      <td>${p.Year ?? '—'}</td>
      <td>${esc(p.Title)}</td>
      <td>${p.Integrated_Cluster == null ? '—' : p.Integrated_Cluster}</td>
      <td>${p.N_IFIBIO_Authors ?? '—'} / ${p.N_Authors ?? '—'}</td>
      <td>${esc(p.PMID)}</td>
    </tr>`).join('');
  $('paper-table').querySelectorAll('tr').forEach(tr => tr.addEventListener('click', () => openPaper(tr.dataset.pmid)));
}

function renderUMAP(target, rows) {
  const valid = rows.filter(p => p.UMAP1 != null && p.UMAP2 != null);
  const clusters = [...new Set(valid.map(p => p.Integrated_Cluster))].sort((a,b) => (a ?? 999)-(b ?? 999));
  const traces = clusters.map((cluster, idx) => {
    const pts = valid.filter(p => p.Integrated_Cluster === cluster);
    return {
      x: pts.map(p => p.UMAP1), y: pts.map(p => p.UMAP2), type: 'scattergl', mode: 'markers',
      name: cluster == null ? 'Unassigned' : `Cluster ${cluster}`,
      ids: pts.map(p => p.PMID), customdata: pts.map(p => [p.Title, p.Year, p.PMID]),
      marker: { size: 9, opacity: .78, color: `hsl(${(idx*47+190)%360} 72% 66%)`, line: { width: .5, color: '#08101f' } },
      hovertemplate: '<b>%{customdata[0]}</b><br>%{customdata[1]} · PMID %{customdata[2]}<extra></extra>'
    };
  });
  Plotly.react(target, traces, { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: 'UMAP 1', showticklabels: false }, yaxis: { ...plotLayout.yaxis, title: 'UMAP 2', showticklabels: false }, legend: { orientation: 'h', y: -0.08 } }, plotConfig);
  const el = $(target);
  if (!el.dataset.clickBound) {
    el.on('plotly_click', evt => { const id = evt?.points?.[0]?.id; if (id) openPaper(String(id)); });
    el.dataset.clickBound = '1';
  }
}

function openPaper(pmid) {
  const p = state.papers.find(x => x.PMID === String(pmid));
  if (!p) return;
  $('paper-dialog-content').innerHTML = `
    <span class="section-tag">PUBLICATION</span>
    <h2 class="paper-dialog-title">${esc(p.Title)}</h2>
    <div class="paper-meta"><span>${p.Year ?? 'Unknown year'}</span><span>PMID ${esc(p.PMID)}</span><span>Cluster ${p.Integrated_Cluster ?? '—'}</span></div>
    <div class="paper-grid">
      <div><span>Authors</span><strong>${p.N_Authors ?? '—'}</strong></div>
      <div><span>IFIBIO authors</span><strong>${p.N_IFIBIO_Authors ?? '—'}</strong></div>
      <div><span>Affiliations</span><strong>${p.N_Affiliations ?? '—'}</strong></div>
      <div><span>MeSH terms</span><strong>${p.N_MeSH ?? '—'}</strong></div>
      <div><span>Keywords</span><strong>${p.N_Keywords ?? '—'}</strong></div>
      <div><span>Abstract words</span><strong>${p.Abstract_Words ?? '—'}</strong></div>
    </div>`;
  $('paper-dialog').showModal();
}

function renderLandscape() {
  const fractions = state.papers.map(p => p.Fraction_IFIBIO).filter(v => v != null);
  Plotly.newPlot('fraction-chart', [{ x: fractions, type: 'histogram', nbinsx: 12, marker: { color: '#7dd3fc' }, hovertemplate: 'Fraction %{x:.2f}<br>%{y} papers<extra></extra>' }],
    { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: 'Fraction of IFIBIO authors' }, yaxis: { ...plotLayout.yaxis, title: 'Papers' } }, plotConfig);
  const authors = state.papers.map(p => p.N_Authors).filter(v => v != null && v <= 40);
  Plotly.newPlot('authors-chart', [{ x: authors, type: 'histogram', nbinsx: 25, marker: { color: '#a78bfa' }, hovertemplate: '%{x} authors<br>%{y} papers<extra></extra>' }],
    { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: 'Authors per paper' }, yaxis: { ...plotLayout.yaxis, title: 'Papers' } }, plotConfig);
  renderUMAP('landscape-chart', state.papers);
}

function parseGEXF(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('Invalid GEXF');
  const attrMap = {};
  xml.querySelectorAll('attributes[class="node"] attribute').forEach(a => attrMap[a.getAttribute('id')] = a.getAttribute('title') || a.getAttribute('id'));
  const nodes = [...xml.querySelectorAll('nodes > node')].map(n => {
    const data = { id: n.getAttribute('id'), label: n.getAttribute('label') || n.getAttribute('id') };
    n.querySelectorAll('attvalue').forEach(av => data[attrMap[av.getAttribute('for')] || av.getAttribute('for')] = av.getAttribute('value'));
    return { data };
  });
  const degree = Object.fromEntries(nodes.map(n => [n.data.id, 0]));
  const edges = [...xml.querySelectorAll('edges > edge')].map((e,i) => {
    const source = e.getAttribute('source'), target = e.getAttribute('target');
    if (degree[source] != null) degree[source]++; if (degree[target] != null) degree[target]++;
    return { data: { id: e.getAttribute('id') || `e${i}`, source, target, weight: num(e.getAttribute('weight')) || 1 } };
  });
  nodes.forEach(n => n.data.degree = degree[n.data.id] || 0);
  return { nodes, edges };
}

async function loadNetwork() {
  if (state.networkLoaded) return;
  const response = await fetch(DATA.network);
  if (!response.ok) throw new Error(`Network: ${response.status}`);
  const { nodes, edges } = parseGEXF(await response.text());
  state.cy = cytoscape({
    container: $('cy'), elements: [...nodes, ...edges],
    style: [
      { selector: 'node', style: { 'background-color': '#7dd3fc', 'width': 'mapData(degree, 0, 80, 7, 35)', 'height': 'mapData(degree, 0, 80, 7, 35)', 'border-width': 1, 'border-color': '#08101f', 'label': '', 'transition-property': 'opacity, background-color, width, height', 'transition-duration': '180ms' } },
      { selector: 'edge', style: { 'line-color': '#334155', 'opacity': .24, 'width': 'mapData(weight, 1, 10, .3, 3)', 'curve-style': 'haystack' } },
      { selector: 'node:selected', style: { 'background-color': '#6ee7b7', 'border-color': '#f8fafc', 'border-width': 2, 'label': 'data(label)', 'font-size': 10, 'color': '#f8fafc', 'text-background-color': '#08101f', 'text-background-opacity': .9, 'text-background-padding': 4, 'text-valign': 'bottom', 'text-margin-y': 8 } },
      { selector: '.dim', style: { 'opacity': .08 } },
      { selector: '.neighbor', style: { 'background-color': '#a78bfa', 'opacity': 1 } }
    ],
    layout: { name: 'cose', animate: false, fit: true, padding: 30, randomize: true, nodeRepulsion: 9000, idealEdgeLength: 65 }
  });
  state.cy.on('tap', 'node', evt => inspectAuthor(evt.target));
  state.cy.on('tap', evt => { if (evt.target === state.cy) clearNetworkFocus(); });
  state.networkLoaded = true;
}

function inspectAuthor(node) {
  const cy = state.cy;
  cy.elements().removeClass('dim neighbor');
  cy.elements().addClass('dim');
  const neighborhood = node.closedNeighborhood();
  neighborhood.removeClass('dim');
  node.neighborhood('node').addClass('neighbor');
  const neighbors = node.neighborhood('node');
  const edges = node.connectedEdges();
  const top = neighbors.toArray().sort((a,b) => b.data('degree') - a.data('degree')).slice(0,6).map(n => esc(n.data('label'))).join(', ') || '—';
  $('network-inspector').innerHTML = `
    <span class="section-tag">RESEARCHER</span><h3>${esc(node.data('label'))}</h3>
    <div class="inspector-stat"><span>Collaborators</span><strong>${neighbors.length}</strong></div>
    <div class="inspector-stat"><span>Network degree</span><strong>${node.data('degree')}</strong></div>
    <div class="inspector-stat"><span>Collaboration edges</span><strong>${edges.length}</strong></div>
    <p><strong>Connected researchers</strong><br>${top}</p>`;
}
function clearNetworkFocus(){ if (!state.cy) return; state.cy.elements().removeClass('dim neighbor'); }
function applyNetworkLayout() { if (!state.cy) return; state.cy.layout({ name: $('network-layout').value, animate: true, animationDuration: 450, fit: true, padding: 30 }).run(); }
function findAuthor() {
  if (!state.cy) return;
  const q = $('author-search').value.trim().toLowerCase();
  clearNetworkFocus(); if (!q) return;
  const node = state.cy.nodes().filter(n => String(n.data('label')).toLowerCase().includes(q))[0];
  if (node) { node.select(); inspectAuthor(node); state.cy.animate({ center: { eles: node }, zoom: 1.8 }, { duration: 400 }); }
}

function setupNavigation() {
  const titles = { overview: 'Scientific activity at a glance', publications: 'Explore the publication corpus', network: 'Who collaborates with whom?', landscape: 'Map the scientific portfolio', methods: 'Methods & architecture' };
  document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', async () => {
    document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    $(`view-${view}`).classList.add('active');
    $('page-title').textContent = titles[view] || 'IFIBIO Scientific Landscape';
    if (view === 'network') {
      try { await loadNetwork(); setTimeout(() => { state.cy.resize(); state.cy.fit(undefined, 30); }, 50); }
      catch (e) { $('network-inspector').innerHTML = `<span class="section-tag">NETWORK</span><h3>Could not load network</h3><p>${esc(e.message)}</p>`; }
    }
    if (view === 'publications') setTimeout(() => Plotly.Plots.resize($('umap-chart')), 20);
    if (view === 'landscape') setTimeout(() => ['fraction-chart','authors-chart','landscape-chart'].forEach(id => Plotly.Plots.resize($(id))), 20);
  }));
}

async function init() {
  setupNavigation();
  $('close-dialog').addEventListener('click', () => $('paper-dialog').close());
  $('paper-dialog').addEventListener('click', e => { if (e.target === $('paper-dialog')) $('paper-dialog').close(); });
  $('paper-search').addEventListener('input', applyPaperFilters);
  $('year-filter').addEventListener('change', applyPaperFilters);
  $('cluster-filter').addEventListener('change', applyPaperFilters);
  $('network-layout').addEventListener('change', applyNetworkLayout);
  $('fit-network').addEventListener('click', () => state.cy?.fit(undefined, 30));
  $('author-search').addEventListener('input', findAuthor);

  try {
    const [summary, papers] = await Promise.all([loadJSON(DATA.summary), loadCSV(DATA.papers)]);
    state.summary = summary;
    state.papers = normalizePapers(papers);
    state.filtered = [...state.papers];
    renderKPIs();
    renderOverview();
    populateFilters();
    renderPaperTable();
    renderUMAP('umap-chart', state.filtered);
    renderLandscape();
    $('data-status').textContent = `${state.papers.length} papers loaded`;
  } catch (e) {
    console.error(e);
    $('data-status').textContent = 'Data load error';
    $('data-status').title = e.message;
  }
}

init();
