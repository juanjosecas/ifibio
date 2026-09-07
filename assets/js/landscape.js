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
    if (status) status.textContent = `${papers.length} papers loaded`;
  } catch (err) {
    console.error(err);
    if (status) { status.textContent = 'Data error'; status.title = err?.message || '' }
  }
})();
