/* Overview page: KPIs + publications-over-time + cluster chart + IFIBIO participation. */
(async function () {
  const status = $('data-status');
  try {
    if (status) status.textContent = 'Loading corpus…';
    const [summary, rawPapers] = await Promise.all([loadJSON(DATA.summary), loadCSV(DATA.papers)]);
    const papers = normalizePapers(rawPapers);

    const s = summary || {};
    $('kpi-papers').textContent = s.n_rows ?? papers.length;
    $('kpi-authors').textContent = s.n_unique_authors ?? '—';
    $('kpi-years').textContent = s.n_years ?? new Set(papers.map(d => d.Year).filter(Boolean)).size;
    $('kpi-clusters').textContent = s.n_clusters ?? new Set(papers.map(d => d.Integrated_Cluster).filter(v => v != null)).size;
    $('top-journal').textContent = s.top_journal || '—';
    $('top-keyword').textContent = s.top_keyword || '—';
    $('top-mesh').textContent = s.top_mesh || '—';

    const years = sortedEntries(groupCount(papers, 'Year'));
    Plotly.newPlot('year-chart', [{
      x: years.map(d => +d[0]), y: years.map(d => d[1]), type: 'scatter', mode: 'lines+markers',
      line: { width: 3, color: '#7dd3fc' }, marker: { size: 7, color: '#a78bfa' },
      hovertemplate: '<b>%{x}</b><br>%{y} publications<extra></extra>',
    }], { ...plotLayout, xaxis: { ...plotLayout.xaxis, title: 'Year', dtick: 1 }, yaxis: { ...plotLayout.yaxis, title: 'Publications' } }, plotConfig);

    const clusters = Object.entries(groupCount(papers, 'Integrated_Cluster')).filter(d => d[0] !== '').sort((a, b) => b[1] - a[1]);
    Plotly.newPlot('cluster-chart', [{
      x: clusters.map(d => `Cluster ${d[0]}`), y: clusters.map(d => d[1]), type: 'bar',
      marker: { color: clusters.map((_, i) => i), colorscale: 'Viridis', line: { width: 0 } },
      hovertemplate: '<b>%{x}</b><br>%{y} papers<extra></extra>',
    }], { ...plotLayout, yaxis: { ...plotLayout.yaxis, title: 'Papers' } }, plotConfig);

    const c = { 'No IFIBIO author': 0, 'Mixed team': 0, 'All IFIBIO': 0 };
    papers.forEach(p => { const f = p.Fraction_IFIBIO; if (f == null || f <= 0) c['No IFIBIO author']++; else if (f >= .999) c['All IFIBIO']++; else c['Mixed team']++ });
    Plotly.newPlot('ifibio-chart', [{
      labels: Object.keys(c), values: Object.values(c), type: 'pie', hole: .7,
      marker: { colors: ['#334155', '#7dd3fc', '#6ee7b7'] }, textinfo: 'none',
      hovertemplate: '<b>%{label}</b><br>%{value} papers · %{percent}<extra></extra>',
    }], { ...plotLayout, margin: { l: 8, r: 8, t: 8, b: 8 }, legend: { orientation: 'h', y: -.08, x: .5, xanchor: 'center', font: { size: 10 } } }, plotConfig);

    if (status) status.textContent = `${papers.length} papers loaded`;
  } catch (err) {
    console.error(err);
    if (status) { status.textContent = 'Data error'; status.title = err?.message || '' }
  }
})();
