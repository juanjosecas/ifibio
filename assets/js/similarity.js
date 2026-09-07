/* Paper similarity network: nodes = papers, edges = abstract-embedding similarity above threshold. */
(function () {
  const state = { cy: null, nodesById: new Map() };

  function shortTitle(t, n = 60) { const s = String(t || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s }

  function populatePaperSelect(nodes) {
    const sorted = nodes.slice().sort((a, b) => String(a.data.Title).localeCompare(String(b.data.Title)));
    $('paper-select').insertAdjacentHTML('beforeend', sorted.map(n => `<option value="${esc(n.data.id)}">${esc(shortTitle(n.data.Title, 90))}</option>`).join(''));
  }

  function inspectPaper(id) {
    const node = state.cy.getElementById(String(id));
    if (!node || !node.length) return;
    state.cy.elements().removeClass('dim selected-neighborhood selected-node');
    state.cy.elements().addClass('dim');
    node.removeClass('dim').addClass('selected-node');
    node.closedNeighborhood().removeClass('dim').addClass('selected-neighborhood');
    $('paper-select').value = node.id();

    const neighborEdges = node.connectedEdges();
    const similar = neighborEdges.map(e => {
      const other = e.source().id() === node.id() ? e.target() : e.source();
      return { node: other, weight: Number(e.data('weight') || 0) };
    }).sort((a, b) => b.weight - a.weight).slice(0, 12);

    $('paper-inspector').innerHTML = `<span class="section-tag">Paper</span><h3>${esc(node.data('Title'))}</h3>
      <div class="inspector-stat"><span>Year</span><strong>${node.data('Year') ?? '—'}</strong></div>
      <div class="inspector-stat"><span>PMID</span><strong>${esc(node.data('PMID') || '—')}</strong></div>
      <div class="inspector-stat"><span>NLP community</span><strong>${node.data('NLP_Community') ?? '—'}</strong></div>
      <div class="inspector-stat"><span>Similar papers linked</span><strong>${neighborEdges.length}</strong></div>
      <div class="term-related">${similar.map(x => `<button class="chip chip-button" data-id="${esc(x.node.id())}">${esc(shortTitle(x.node.data('Title')))} · ${x.weight.toFixed(2)}</button>`).join('') || '<span class="hint">No similarity edges above threshold for this paper.</span>'}</div>
      <div class="availability-note">Similarity score comes from the precomputed abstract-embedding graph (edge weight), not from visual distance in the UMAP scatterplots.</div>`;
    $('paper-inspector').querySelectorAll('.chip-button').forEach(b => b.addEventListener('click', () => inspectPaper(b.dataset.id)));
  }

  async function init() {
    const status = $('data-status');
    try {
      if (status) status.textContent = 'Loading similarity network…';
      const { nodes, edges } = await fetchGEXF(DATA.paperSimilarity);
      const communities = [...new Set(nodes.map(n => num(n.data.NLP_Community)))].sort((a, b) => (a ?? 999) - (b ?? 999));
      state.cy = cytoscape({
        container: $('paper-cy'), elements: [...nodes, ...edges],
        hideEdgesOnViewport: true, textureOnViewport: true, pixelRatio: 1,
        style: [
          { selector: 'node', style: { 'background-color': n => `hsl(${(communities.indexOf(num(n.data('NLP_Community'))) * 47 + 200) % 360} 70% 62%)`, 'width': 'mapData(WeightedDegree,0,10,10,34)', 'height': 'mapData(WeightedDegree,0,10,10,34)', 'border-width': 1, 'border-color': '#08101f', 'label': '', 'font-size': 8, 'color': '#f8fafc', 'text-outline-width': 2, 'text-outline-color': '#08101f' } },
          { selector: 'edge', style: { 'line-color': '#475569', 'opacity': .3, 'width': 'mapData(weight,0,1,.5,3.5)', 'curve-style': 'haystack' } },
          { selector: '.dim', style: { 'opacity': .06 } },
          { selector: '.selected-neighborhood', style: { 'opacity': .95 } },
          { selector: '.selected-node', style: { 'background-color': '#fbbf24', 'border-width': 3, 'border-color': '#fff', 'label': 'data(Title)' } },
        ],
        layout: { name: 'fcose', quality: 'default', animate: false, randomize: true, nodeRepulsion: 4000, idealEdgeLength: 55, fit: true, padding: 30 },
      });
      state.cy.on('tap', 'node', e => inspectPaper(e.target.id()));
      populatePaperSelect(nodes);
      $('paper-select').addEventListener('change', e => { if (e.target.value) inspectPaper(e.target.value) });
      $('paper-search').addEventListener('input', e => {
        const q = e.target.value.trim().toLowerCase();
        state.cy.elements().removeClass('dim');
        if (!q) return;
        state.cy.nodes().forEach(n => { if (!String(n.data('Title')).toLowerCase().includes(q)) n.addClass('dim') });
      });
      if (status) status.textContent = `${nodes.length} papers · ${edges.length} similarity links`;
    } catch (err) {
      console.error(err);
      if (status) { status.textContent = 'Data error'; status.title = err?.message || '' }
    }
  }

  init();
})();
