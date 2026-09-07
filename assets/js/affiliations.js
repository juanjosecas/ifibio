/* Affiliations network: raw affiliation strings linked when the same author declares both on one paper. */
(function () {
  const state = { cy: null, catalog: new Map() };

  function shortText(t, n = 70) { const s = String(t || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s }

  function populateAffiliationSelect(nodeIds) {
    const rows = nodeIds.map(id => state.catalog.get(id)).filter(Boolean).sort((a, b) => (b.n_papers || 0) - (a.n_papers || 0));
    $('affiliation-select').insertAdjacentHTML('beforeend', rows.map(r => `<option value="${esc(r.id)}">${esc(shortText(r.texto, 90))} (${r.n_papers} papers)</option>`).join(''));
  }

  function inspectAffiliation(id) {
    const node = state.cy.getElementById(String(id));
    if (!node || !node.length) return;
    state.cy.elements().removeClass('dim selected-neighborhood selected-node');
    state.cy.elements().addClass('dim');
    node.removeClass('dim').addClass('selected-node');
    node.closedNeighborhood().removeClass('dim').addClass('selected-neighborhood');
    $('affiliation-select').value = node.id();

    const related = node.connectedEdges().map(e => {
      const other = e.source().id() === node.id() ? e.target() : e.source();
      return { node: other, weight: Number(e.data('weight') || 0) };
    }).sort((a, b) => b.weight - a.weight).slice(0, 15);

    $('affiliation-inspector').innerHTML = `<span class="section-tag">Affiliation</span><h3>${esc(node.data('texto'))}</h3>
      <div class="inspector-stat"><span>Papers mentioning it</span><strong>${node.data('n_papers') ?? '—'}</strong></div>
      <div class="inspector-stat"><span>Distinct authors</span><strong>${node.data('n_autores') ?? '—'}</strong></div>
      <div class="inspector-stat"><span>Linked affiliations</span><strong>${related.length}</strong></div>
      <div class="term-related">${related.map(x => `<button class="chip chip-button" data-id="${esc(x.node.id())}">${esc(shortText(x.node.data('texto'), 46))} · ${x.weight}</button>`).join('') || '<span class="hint">No co-declared affiliations for this entry.</span>'}</div>
      <div class="availability-note">A link only means the same author listed both affiliation texts on the same paper — it does not imply a formal institutional agreement, and near-duplicate wording of the same institution is not merged (see the note above).</div>`;
    $('affiliation-inspector').querySelectorAll('.chip-button').forEach(b => b.addEventListener('click', () => inspectAffiliation(b.dataset.id)));
  }

  async function init() {
    const status = $('data-status');
    try {
      if (status) status.textContent = 'Loading affiliations…';
      const [catalogRows, edgeRows] = await Promise.all([loadCSV(DATA.affiliationCatalog), loadCSV(DATA.affiliationEdges)]);
      catalogRows.forEach(r => state.catalog.set(r.id, { id: r.id, texto: r.texto, n_papers: num(r.n_papers) || 0, n_autores: num(r.n_autores) || 0 }));

      const topByPapers = catalogRows.slice().map(r => ({ ...r, n_papers: num(r.n_papers) || 0 })).sort((a, b) => b.n_papers - a.n_papers).slice(0, 20);
      Plotly.newPlot('affiliation-bar', [{
        x: topByPapers.map(r => r.n_papers).reverse(), y: topByPapers.map(r => shortText(r.texto, 55)).reverse(), type: 'bar', orientation: 'h',
        marker: { color: '#7dd3fc' }, hovertemplate: '<b>%{y}</b><br>%{x} papers<extra></extra>',
      }], { ...plotLayout, margin: { l: 260, r: 20, t: 10, b: 40 }, xaxis: { ...plotLayout.xaxis, title: 'Papers mentioning this affiliation text' }, yaxis: { ...plotLayout.yaxis, automargin: true } }, plotConfig);

      const involvedIds = new Set();
      edgeRows.forEach(e => { involvedIds.add(e.source); involvedIds.add(e.target) });
      const nodes = [...involvedIds].filter(id => state.catalog.has(id)).map(id => ({ data: { id, ...state.catalog.get(id) } }));
      const edges = edgeRows.filter(e => state.catalog.has(e.source) && state.catalog.has(e.target)).map((e, i) => ({ data: { id: `e${i}`, source: e.source, target: e.target, weight: num(e.weight) || 1 } }));

      state.cy = cytoscape({
        container: $('affiliation-cy'), elements: [...nodes, ...edges],
        hideEdgesOnViewport: true, textureOnViewport: true, pixelRatio: 1,
        style: [
          { selector: 'node', style: { 'background-color': '#a78bfa', 'width': 'mapData(n_papers,1,20,10,36)', 'height': 'mapData(n_papers,1,20,10,36)', 'border-width': 1, 'border-color': '#08101f', 'label': '', 'font-size': 8, 'color': '#f8fafc', 'text-outline-width': 2, 'text-outline-color': '#08101f' } },
          { selector: 'edge', style: { 'line-color': '#475569', 'opacity': .3, 'width': 'mapData(weight,1,10,.5,3.5)', 'curve-style': 'haystack' } },
          { selector: '.dim', style: { 'opacity': .06 } },
          { selector: '.selected-neighborhood', style: { 'opacity': .95 } },
          { selector: '.selected-node', style: { 'background-color': '#fbbf24', 'border-width': 3, 'border-color': '#fff' } },
        ],
        layout: { name: 'fcose', quality: 'default', animate: false, randomize: true, nodeRepulsion: 4200, idealEdgeLength: 55, fit: true, padding: 30 },
      });
      state.cy.on('tap', 'node', e => inspectAffiliation(e.target.id()));
      populateAffiliationSelect([...involvedIds]);
      $('affiliation-select').addEventListener('change', e => { if (e.target.value) inspectAffiliation(e.target.value) });

      if (status) status.textContent = `${catalogRows.length} affiliation texts · ${nodes.length} linked · ${edges.length} co-declaration links`;
    } catch (err) {
      console.error(err);
      if (status) { status.textContent = 'Data error'; status.title = err?.message || '' }
    }
  }

  init();
})();
