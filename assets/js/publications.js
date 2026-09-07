/* Publications page: searchable/filterable corpus table + UMAP projection + paper dialog. */
(function () {
  const state = { papers: [], filtered: [] };

  function populateFilters() {
    [...new Set(state.papers.map(d => d.Year).filter(Boolean))].sort((a, b) => b - a)
      .forEach(y => $('year-filter').insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`));
    [...new Set(state.papers.map(d => d.Integrated_Cluster).filter(v => v != null))].sort((a, b) => a - b)
      .forEach(c => $('cluster-filter').insertAdjacentHTML('beforeend', `<option value="${c}">Cluster ${c}</option>`));
  }

  function renderPaperTable() {
    const rows = state.filtered.slice().sort((a, b) => (b.Year || 0) - (a.Year || 0)).slice(0, 120);
    $('paper-count').textContent = `${state.filtered.length} papers${state.filtered.length > 120 ? ' · showing first 120' : ''}`;
    $('paper-table').innerHTML = rows.map(p => `<tr data-pmid="${esc(p.PMID)}"><td>${p.Year ?? '—'}</td><td>${esc(p.Title)}</td><td>${p.Integrated_Cluster ?? '—'}</td><td>${p.N_IFIBIO_Authors ?? '—'} / ${p.N_Authors ?? '—'}</td><td>${esc(p.PMID)}</td></tr>`).join('');
    $('paper-table').querySelectorAll('tr').forEach(tr => tr.addEventListener('click', () => openPaper(state.papers, tr.dataset.pmid)));
  }

  function applyPaperFilters() {
    const q = $('paper-search').value.trim().toLowerCase(), year = $('year-filter').value, cluster = $('cluster-filter').value;
    state.filtered = state.papers.filter(p => (!q || p.Title.toLowerCase().includes(q) || p.PMID.includes(q)) && (year === 'all' || String(p.Year) === year) && (cluster === 'all' || String(p.Integrated_Cluster) === cluster));
    renderPaperTable();
    renderUMAP('umap-chart', state.filtered, { onClick: pmid => openPaper(state.papers, pmid) });
  }

  async function init() {
    const status = $('data-status');
    try {
      if (status) status.textContent = 'Loading corpus…';
      state.papers = normalizePapers(await loadCSV(DATA.papers));
      state.filtered = [...state.papers];
      populateFilters();
      renderPaperTable();
      renderUMAP('umap-chart', state.filtered, { onClick: pmid => openPaper(state.papers, pmid) });
      bindPaperDialog();
      $('paper-search').addEventListener('input', applyPaperFilters);
      $('year-filter').addEventListener('change', applyPaperFilters);
      $('cluster-filter').addEventListener('change', applyPaperFilters);
      if (status) status.textContent = `${state.papers.length} papers loaded`;
    } catch (err) {
      console.error(err);
      if (status) { status.textContent = 'Data error'; status.title = err?.message || '' }
    }
  }

  init();
})();
