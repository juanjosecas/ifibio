/* Shared utilities for the IFIBIO Scientific Landscape dashboard pages. */
const BASEURL = (window.SITE_BASEURL || '').replace(/\/$/, '');
const DATA = {
  summary: `${BASEURL}/ml_pubmed_ifibio/analysis_summary.json`,
  papers: `${BASEURL}/ml_pubmed_ifibio/integrated_paper_ml_dataset.csv`,
  network: `${BASEURL}/ml_pubmed_ifibio/coauthor_network.gexf`,
  mesh: `${BASEURL}/ml_pubmed_ifibio/mesh_network.gexf`,
  keyword: `${BASEURL}/ml_pubmed_ifibio/keyword_network.gexf`,
  paperSimilarity: `${BASEURL}/ml_pubmed_ifibio/paper_nlp_network.gexf`,
  affiliationCatalog: `${BASEURL}/ml_pubmed_ifibio/filiaciones/catalogo_filiaciones.csv`,
  affiliationEdges: `${BASEURL}/ml_pubmed_ifibio/filiaciones/red_filiaciones_aristas.csv`,
  affiliationCooccurrence: `${BASEURL}/ml_pubmed_ifibio/affiliation_affiliation_cooccurrence.csv`,
};

const plotConfig = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] };
const plotLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: '#cbd5e1', family: 'Inter, system-ui, sans-serif', size: 12 },
  margin: { l: 45, r: 20, t: 20, b: 45 },
  xaxis: { gridcolor: 'rgba(255,255,255,.06)', zerolinecolor: 'rgba(255,255,255,.08)' },
  yaxis: { gridcolor: 'rgba(255,255,255,.06)', zerolinecolor: 'rgba(255,255,255,.08)' },
  hoverlabel: { bgcolor: '#0f172a', bordercolor: 'rgba(255,255,255,.12)', font: { color: '#f8fafc' } },
};

const $ = id => document.getElementById(id);
const num = v => { if (v === null || v === undefined || v === '') return null; const s = String(v).trim(); if (s === '') return null; const n = Number(s); return Number.isFinite(n) ? n : null };
const esc = (s = '') => String(s).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
function groupCount(rows, key) { return rows.reduce((a, r) => { const k = r[key]; if (k !== '' && k != null) a[k] = (a[k] || 0) + 1; return a }, {}) }
function sortedEntries(o, n = true) { return Object.entries(o).sort((a, b) => n ? Number(a[0]) - Number(b[0]) : b[1] - a[1]) }

async function loadJSON(path) {
  let r;
  try { r = await fetch(path, { cache: 'no-store' }) } catch (error) { throw new Error(error?.message || 'Data load error') }
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

async function loadCSV(path) {
  let t;
  try {
    const r = await fetch(path, { cache: 'no-store' });
    if (!r.ok) throw new Error(`${path}: ${r.status}`);
    t = await r.text();
  } catch (error) { throw new Error(error?.message || 'Data load error') }
  const parsed = Papa.parse(t, { header: true, skipEmptyLines: true, dynamicTyping: false });
  if (parsed.errors.length) console.warn('CSV parser warnings', parsed.errors.slice(0, 3));
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
    Paper_Betweenness: num(r.Paper_Betweenness),
    Paper_Degree: num(r.Paper_Degree),
    Paper_WeightedDegree: num(r.Paper_WeightedDegree),
    Paper_Clustering: num(r.Paper_Clustering),
    Mean_Author_Publications: num(r.Mean_Author_Publications),
    Max_Author_Publications: num(r.Max_Author_Publications),
    Mean_Author_Degree: num(r.Mean_Author_Degree),
    Max_Author_Degree: num(r.Max_Author_Degree),
    Years_From_First: num(r.Years_From_First),
    Social_Cluster: num(r.Social_Cluster),
    N_Social_Clusters: num(r.N_Social_Clusters),
  })).filter(r => r.PMID && r.Title);
}

function parseGEXF(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('Invalid GEXF');
  const nm = {}, em = {};
  xml.querySelectorAll('attributes[class="node"] attribute').forEach(a => nm[a.getAttribute('id')] = a.getAttribute('title') || a.getAttribute('id'));
  xml.querySelectorAll('attributes[class="edge"] attribute').forEach(a => em[a.getAttribute('id')] = a.getAttribute('title') || a.getAttribute('id'));
  const nodes = [...xml.querySelectorAll('nodes > node')].map(n => {
    const d = { id: n.getAttribute('id'), label: n.getAttribute('label') || n.getAttribute('id') };
    n.querySelectorAll('attvalue').forEach(av => d[nm[av.getAttribute('for')] || av.getAttribute('for')] = av.getAttribute('value'));
    return { data: d };
  });
  const degree = Object.fromEntries(nodes.map(n => [n.data.id, 0])), weighted = Object.fromEntries(nodes.map(n => [n.data.id, 0]));
  const edges = [...xml.querySelectorAll('edges > edge')].map((e, i) => {
    const source = e.getAttribute('source'), target = e.getAttribute('target');
    const d = { id: e.getAttribute('id') || `e${i}`, source, target, weight: num(e.getAttribute('weight')) || 1 };
    e.querySelectorAll('attvalue').forEach(av => d[em[av.getAttribute('for')] || av.getAttribute('for')] = av.getAttribute('value'));
    if (degree[source] != null) { degree[source]++; weighted[source] += d.weight }
    if (degree[target] != null) { degree[target]++; weighted[target] += d.weight }
    return { data: d };
  });
  nodes.forEach(n => { n.data.degree = degree[n.data.id] || 0; n.data.weightedDegree = weighted[n.data.id] || 0 });
  return { nodes, edges, nodeAttributes: nm, edgeAttributes: em };
}

async function fetchGEXF(path) {
  let r;
  try { r = await fetch(path, { cache: 'no-store' }) } catch (error) { throw new Error(error?.message || 'Data load error') }
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return parseGEXF(await r.text());
}

function normalizedKey(k) { return String(k).toLowerCase().replace(/[^a-z0-9]/g, '') }
function findMetricKey(nodes, cands) {
  if (!nodes.length) return null;
  const keys = Object.keys(nodes[0].data);
  for (const c of cands) { const hit = keys.find(k => normalizedKey(k) === normalizedKey(c)); if (hit && nodes.some(n => num(n.data[hit]) != null)) return hit }
  return null;
}
function parseList(v) {
  if (v == null) return [];
  let s = String(v).trim();
  if (!s) return [];
  try { const x = JSON.parse(s.replace(/'/g, '"')); if (Array.isArray(x)) return x.map(String) } catch {}
  return s.replace(/[\[\](){}]/g, '').split(/[;,|]/).map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
}

/* Generic UMAP scatter renderer shared by the publications and landscape pages. */
function renderUMAP(target, rows, opts = {}) {
  const el = $(target);
  if (!el) return;
  const valid = rows.filter(p => p.UMAP1 != null && p.UMAP2 != null);
  const clusters = [...new Set(valid.map(p => p.Integrated_Cluster))].sort((a, b) => (a ?? 999) - (b ?? 999));
  const traces = clusters.map((cluster, idx) => {
    const pts = valid.filter(p => p.Integrated_Cluster === cluster);
    return {
      x: pts.map(p => p.UMAP1), y: pts.map(p => p.UMAP2), type: 'scattergl', mode: 'markers',
      name: cluster == null ? 'Unassigned' : `Cluster ${cluster}`,
      ids: pts.map(p => p.PMID), customdata: pts.map(p => [p.Title, p.Year, p.PMID]),
      marker: { size: 9, opacity: .78, color: `hsl(${(idx * 47 + 190) % 360} 72% 66%)`, line: { width: .5, color: '#08101f' } },
      hovertemplate: '<b>%{customdata[0]}</b><br>%{customdata[1]} · PMID %{customdata[2]}<extra></extra>',
    };
  });
  Plotly.react(target, traces, {
    ...plotLayout,
    xaxis: { ...plotLayout.xaxis, title: 'UMAP 1', showticklabels: false },
    yaxis: { ...plotLayout.yaxis, title: 'UMAP 2', showticklabels: false },
    legend: { orientation: 'h', y: -.08 },
  }, plotConfig);
  if (opts.onClick && !el.dataset.clickBound) {
    el.on('plotly_click', e => { const id = e?.points?.[0]?.id; if (id) opts.onClick(String(id)) });
    el.dataset.clickBound = '1';
  }
}

/* Paper detail dialog, shared by pages that expose a "#paper-dialog" element. */
function openPaper(papers, pmid) {
  const dialog = $('paper-dialog');
  if (!dialog) return;
  const p = papers.find(x => x.PMID === String(pmid));
  if (!p) return;
  $('paper-dialog-content').innerHTML = `<span class="section-tag">PUBLICATION</span><h2 class="paper-dialog-title">${esc(p.Title)}</h2><div class="paper-meta"><span>${p.Year ?? 'Unknown year'}</span><span>PMID ${esc(p.PMID)}</span><span>Cluster ${p.Integrated_Cluster ?? '—'}</span></div><div class="paper-grid"><div><span>Authors</span><strong>${p.N_Authors ?? '—'}</strong></div><div><span>IFIBIO authors</span><strong>${p.N_IFIBIO_Authors ?? '—'}</strong></div><div><span>Affiliations</span><strong>${p.N_Affiliations ?? '—'}</strong></div><div><span>MeSH terms</span><strong>${p.N_MeSH ?? '—'}</strong></div><div><span>Keywords</span><strong>${p.N_Keywords ?? '—'}</strong></div><div><span>Abstract words</span><strong>${p.Abstract_Words ?? '—'}</strong></div></div>`;
  dialog.showModal();
}
function bindPaperDialog() {
  const dialog = $('paper-dialog');
  if (!dialog) return;
  $('close-dialog')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close() });
}
