/* Interactive coauthor network page (cytoscape) with top-25 author highlighting. */
(function () {
  const TOP_AUTHOR_COLORS = ['#ff6b6b', '#f59e0b', '#facc15', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb7185', '#fdba74', '#fde047', '#bef264', '#6ee7b7', '#67e8f9', '#93c5fd', '#c4b5fd', '#f0abfc'];
  const state = { cy: null, authorMetric: 'degree', authorMetricLabel: 'network degree' };
  let top25Ids = new Set();

  function authorMetricValue(node) { return num(node.data(state.authorMetric)) ?? node.degree() }
  function visibleNeighbors(node) { return node.neighborhood('node').filter(n => n.visible()) }

  function setNetworkMetric(nodes) {
    const key = findMetricKey(nodes, ['publications', 'n_publications', 'publication_count', 'paper_count', 'n_papers', 'papers', 'n_pubs', 'npapers', 'publications_count']);
    state.authorMetric = key || 'degree';
    state.authorMetricLabel = key ? 'publications' : 'network degree';
    const max = Math.max(1, ...nodes.map(n => num(n.data[state.authorMetric]) || 0));
    $('min-pubs').max = Math.min(Math.max(Math.ceil(max), 5), 100);
    $('label-pubs').max = $('min-pubs').max;
    if (!key) {
      $('min-pubs').closest('label').querySelector('span').childNodes[0].textContent = 'Minimum network degree ';
      $('label-pubs').closest('label').querySelector('span').childNodes[0].textContent = 'Show labels from ';
    }
  }

  function rankTopAuthors() {
    if (!state.cy) return [];
    const ranked = state.cy.nodes().map(n => ({ node: n, value: authorMetricValue(n) })).sort((a, b) => b.value - a.value || b.node.degree() - a.node.degree()).slice(0, 25);
    top25Ids = new Set(ranked.map(x => x.node.id()));
    ranked.forEach((x, i) => { x.node.data('topRank', i + 1); x.node.data('topColor', TOP_AUTHOR_COLORS[i]) });
    return ranked;
  }

  function renderTopAuthors(ranked) {
    const holder = $('top-authors-list');
    if (!holder) return;
    const metric = $('top25-metric-label');
    if (metric) metric.textContent = `by ${state.authorMetricLabel}`;
    holder.innerHTML = ranked.map((x, i) => `<button class="top-author-chip" data-id="${esc(x.node.id())}"><i style="background:${TOP_AUTHOR_COLORS[i]}"></i><span>#${i + 1}</span><b>${esc(x.node.data('label'))}</b><em>${x.value}</em></button>`).join('');
    holder.querySelectorAll('.top-author-chip').forEach(btn => btn.addEventListener('click', () => {
      const node = state.cy.getElementById(btn.dataset.id); if (!node?.length) return;
      state.cy.animate({ center: { eles: node }, zoom: Math.max(state.cy.zoom(), 1.35) }, { duration: 350 });
      inspectAuthor(node);
    }));
  }

  function improveEdgeRendering() {
    if (!state.cy) return;
    const maxWeight = Math.max(1, ...state.cy.edges().map(e => Number(e.data('weight') || 1)));
    state.cy.style()
      .selector('edge').style({ 'curve-style': 'bezier', 'line-color': '#64748b', 'opacity': 0.30, 'width': `mapData(weight,1,${maxWeight},0.65,5.2)`, 'z-index': 1 })
      .selector('node').style({ 'z-index': 10 })
      .selector('.selected-neighborhood').style({ 'opacity': 0.98 })
      .selector('edge.selected-neighborhood').style({ 'line-color': '#e2e8f0', 'opacity': 0.82, 'width': `mapData(weight,1,${maxWeight},1.4,7)`, 'z-index': 8 })
      .selector('.selected-node').style({ 'background-color': '#f8fafc', 'border-color': '#fbbf24', 'border-width': 4, 'z-index': 20 })
      .update();
  }

  function applyTopAuthorHighlighting() {
    if (!state.cy) return;
    const on = $('highlight-top25')?.checked !== false;
    const ranked = rankTopAuthors();
    state.cy.batch(() => {
      state.cy.nodes().removeClass('top-author');
      state.cy.nodes().forEach(n => {
        if (top25Ids.has(n.id())) {
          n.addClass('top-author');
          if (on) {
            n.style({ 'background-color': n.data('topColor'), 'border-color': 'rgba(255,255,255,.85)', 'border-width': 2.2 });
            if (n.visible()) n.style('label', `#${n.data('topRank')} ${n.data('label')}`);
          } else n.style({ 'background-color': '#7dd3fc', 'border-color': '#08101f', 'border-width': 1 });
        } else n.style({ 'background-color': '#7dd3fc', 'border-color': '#08101f', 'border-width': 1 });
      });
    });
    renderTopAuthors(ranked);
  }

  function applyNetworkFilters() {
    if (!state.cy) return;
    const minPub = +$('min-pubs').value, minDeg = +$('min-degree').value, labelsAll = $('labels-all').checked, hideIso = $('hide-isolates').checked;
    $('min-pubs-value').textContent = minPub;
    $('min-degree-value').textContent = minDeg;
    $('label-pubs-value').textContent = $('label-pubs').value;
    state.cy.batch(() => {
      state.cy.elements().removeClass('hidden-by-filter');
      state.cy.nodes().forEach(n => { if (authorMetricValue(n) < minPub || n.degree() < minDeg) n.addClass('hidden-by-filter') });
      state.cy.edges().forEach(e => { if (!e.source().visible() || !e.target().visible()) e.addClass('hidden-by-filter') });
      if (hideIso) state.cy.nodes(':visible').forEach(n => { if (visibleNeighbors(n).length === 0) n.addClass('hidden-by-filter') });
      state.cy.nodes().style('label', '');
      state.cy.nodes(':visible').forEach(n => { if (labelsAll || authorMetricValue(n) >= +$('label-pubs').value) n.style('label', n.data('label')) });
    });
    const vn = state.cy.nodes(':visible').length, ve = state.cy.edges(':visible').length;
    $('network-counts').textContent = `${vn} authors · ${ve} links`;
    state.cy.fit(state.cy.elements(':visible'), 30);
    applyTopAuthorHighlighting();
  }

  function inspectAuthor(node) {
    state.cy.elements().removeClass('dim selected-neighborhood selected-node');
    state.cy.elements().addClass('dim');
    node.removeClass('dim').addClass('selected-node');
    node.closedNeighborhood().removeClass('dim').addClass('selected-neighborhood');
    node.style('label', node.data('label'));
    const neighbors = node.neighborhood('node').sort((a, b) => b.degree() - a.degree()).slice(0, 12);
    $('network-inspector').innerHTML = `<span class="section-tag">RESEARCHER</span><h3>${esc(node.data('label'))}</h3><div class="inspector-stat"><span>${esc(state.authorMetricLabel)}</span><strong>${authorMetricValue(node)}</strong></div><div class="inspector-stat"><span>Collaborators</span><strong>${node.degree()}</strong></div><div class="inspector-stat"><span>Weighted degree</span><strong>${Number(node.data('weightedDegree') || 0).toFixed(0)}</strong></div><div class="inspector-stat"><span>Top collaborators</span><strong>${neighbors.map(n => esc(n.data('label'))).join(', ') || '—'}</strong></div><div class="availability-note">Only attributes actually stored in the coauthor graph are shown here.</div>`;
  }

  async function init() {
    const status = $('data-status');
    try {
      if (status) status.textContent = 'Loading network…';
      const { nodes, edges } = await fetchGEXF(DATA.network);
      setNetworkMetric(nodes);
      state.cy = cytoscape({
        container: $('cy'), elements: [...nodes, ...edges],
        // Large graph (900+ nodes / 6000+ edges): trade some rendering fidelity for pan/zoom speed.
        hideEdgesOnViewport: true, textureOnViewport: true, motionBlur: false, pixelRatio: 1, wheelSensitivity: 0.25,
        style: [
          { selector: 'node', style: { 'background-color': '#7dd3fc', 'width': 'mapData(degree,0,80,8,38)', 'height': 'mapData(degree,0,80,8,38)', 'border-width': 1, 'border-color': '#08101f', 'label': '', 'font-size': 9, 'color': '#e6f7ff', 'text-outline-width': 2, 'text-outline-color': '#08101f', 'text-valign': 'center', 'text-halign': 'center' } },
          { selector: 'edge', style: { 'line-color': '#334155', 'opacity': .22, 'width': 'mapData(weight,1,10,.5,4)', 'curve-style': 'haystack' } },
          { selector: '.dim', style: { 'opacity': .06 } },
          { selector: '.selected-neighborhood', style: { 'opacity': .9 } },
          { selector: '.selected-node', style: { 'background-color': '#fbbf24', 'border-width': 3, 'border-color': '#fff' } },
          { selector: '.hidden-by-filter', style: { 'display': 'none' } },
        ],
        // fcose (spectral + incremental) instead of plain 'cose': avoids the O(n^2) synchronous
        // repulsion pass that froze the tab on graphs of this size.
        layout: { name: 'fcose', quality: 'default', animate: false, randomize: true, nodeRepulsion: 4500, idealEdgeLength: 60, numIter: 1500, tile: true, fit: true, padding: 30 },
      });
      state.cy.on('tap', 'node', e => inspectAuthor(e.target));
      applyNetworkFilters();
      improveEdgeRendering();

      $('network-layout').addEventListener('change', () => state.cy?.layout({ name: $('network-layout').value, animate: false }).run());
      $('fit-network').addEventListener('click', () => state.cy?.fit(state.cy.elements(':visible'), 30));
      $('reset-network').addEventListener('click', () => {
        ['min-pubs', 'min-degree', 'label-pubs'].forEach((id, i) => $(id).value = [1, 0, 5][i]);
        $('labels-all').checked = false; $('hide-isolates').checked = true;
        state.cy?.elements().removeClass('dim selected-neighborhood selected-node');
        applyNetworkFilters();
      });
      ['min-pubs', 'min-degree', 'label-pubs', 'labels-all', 'hide-isolates', 'highlight-top25'].forEach(id => $(id)?.addEventListener('input', applyNetworkFilters));
      $('author-search').addEventListener('input', e => {
        if (!state.cy) return;
        const q = e.target.value.trim().toLowerCase();
        state.cy.elements().removeClass('dim');
        if (!q) return;
        state.cy.nodes().forEach(n => { if (!String(n.data('label')).toLowerCase().includes(q)) n.addClass('dim'); else n.style('label', n.data('label')) });
      });

      if (status) status.textContent = `${nodes.length} authors · ${edges.length} links`;
    } catch (err) {
      console.error(err);
      if (status) { status.textContent = 'Data error'; status.title = err?.message || '' }
    }
  }

  init();
})();
