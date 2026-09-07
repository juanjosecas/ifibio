/* Compare two researchers: direct collaboration, shared neighbors, mini local network. */
(function () {
  const state = { cy: null, authorNodes: [], authorEdges: [], authorMetric: 'degree', authorMetricLabel: 'network degree', pairCy: null };

  function authorMetricValue(node) { return num(node.data(state.authorMetric)) ?? node.degree() }

  function populateAuthorSelects() {
    const authors = state.authorNodes.slice().sort((a, b) => String(a.data.label).localeCompare(String(b.data.label)));
    const html = authors.map(n => `<option value="${esc(n.data.id)}">${esc(n.data.label)}</option>`).join('');
    $('author-a').insertAdjacentHTML('beforeend', html);
    $('author-b').insertAdjacentHTML('beforeend', html);
  }

  function authorCard(node) {
    return `<div class="author-card"><h3>${esc(node.data('label'))}</h3><div class="metric-row"><div class="metric"><span>${esc(state.authorMetricLabel)}</span><strong>${authorMetricValue(node)}</strong></div><div class="metric"><span>Collaborators</span><strong>${node.degree()}</strong></div><div class="metric"><span>Weighted degree</span><strong>${Number(node.data('weightedDegree') || 0).toFixed(0)}</strong></div></div></div>`;
  }

  function renderPairNetwork(a, b, common) {
    if (state.pairCy) state.pairCy.destroy();
    const ids = new Set([a.id(), b.id(), ...common]), els = [];
    ids.forEach(id => { const n = state.cy.getElementById(id); els.push({ data: { id: n.id(), label: n.data('label'), focus: id === a.id() || id === b.id() } }) });
    state.authorEdges.forEach(e => { if (ids.has(e.data.source) && ids.has(e.data.target)) els.push({ data: e.data }) });
    state.pairCy = cytoscape({
      container: $('pair-network'), elements: els,
      style: [
        { selector: 'node', style: { 'background-color': '#7dd3fc', 'label': 'data(label)', 'font-size': 9, 'color': '#e6f7ff', 'text-outline-width': 2, 'text-outline-color': '#08101f', 'width': 18, 'height': 18 } },
        { selector: 'node[focus]', style: { 'background-color': '#fbbf24', 'width': 30, 'height': 30 } },
        { selector: 'edge', style: { 'line-color': '#475569', 'opacity': .55, 'width': 1.5 } },
      ],
      layout: { name: 'concentric', animate: false },
    });
  }

  function compareAuthors() {
    if (!state.cy) return;
    const a = state.cy.getElementById($('author-a').value), b = state.cy.getElementById($('author-b').value);
    if (!a.length || !b.length || a.id() === b.id()) {
      $('compare-results').classList.add('hidden');
      $('compare-empty').classList.remove('hidden');
      $('compare-empty').textContent = a.length && b.length ? 'Choose two different researchers.' : 'Choose two researchers to compare them.';
      return;
    }
    $('compare-empty').classList.add('hidden');
    $('compare-results').classList.remove('hidden');
    const edge = a.edgesWith(b), direct = edge.length > 0, weight = direct ? Number(edge[0].data('weight') || 1) : 0;
    const na = new Set(a.neighborhood('node').map(n => n.id())), nb = new Set(b.neighborhood('node').map(n => n.id()));
    const common = [...na].filter(x => nb.has(x)), union = new Set([...na, ...nb]), jac = union.size ? common.length / union.size : 0;
    $('cmp-direct').textContent = direct ? 'Yes' : 'No';
    $('cmp-weight').textContent = weight;
    $('cmp-common').textContent = common.length;
    $('cmp-jaccard').textContent = jac.toFixed(2);
    $('author-a-card').innerHTML = authorCard(a);
    $('author-b-card').innerHTML = authorCard(b);
    $('shared-collaborators').innerHTML = common.length ? common.map(id => `<span class="chip">${esc(state.cy.getElementById(id).data('label'))}</span>`).join('') : '<span class="hint">No shared collaborators.</span>';
    renderPairNetwork(a, b, common);
    const richer = edge[0]?.data();
    if (richer) {
      const paperKey = Object.keys(richer).find(k => /pmid|paper|publication|title/i.test(k) && !['source', 'target', 'weight', 'id'].includes(k));
      if (paperKey) {
        const vals = parseList(richer[paperKey]);
        if (vals.length) $('shared-collaborators').insertAdjacentHTML('beforeend', `<div class="availability-note">Direct-edge publication metadata: ${esc(vals.join(', '))}</div>`);
      }
    }
  }

  async function init() {
    const status = $('data-status');
    try {
      if (status) status.textContent = 'Loading network…';
      const { nodes, edges } = await fetchGEXF(DATA.network);
      state.authorNodes = nodes; state.authorEdges = edges;
      const key = findMetricKey(nodes, ['publications', 'n_publications', 'publication_count', 'paper_count', 'n_papers', 'papers', 'n_pubs', 'npapers', 'publications_count']);
      state.authorMetric = key || 'degree';
      state.authorMetricLabel = key ? 'publications' : 'network degree';
      state.cy = cytoscape({ container: document.createElement('div'), elements: [...nodes, ...edges], headless: true });
      populateAuthorSelects();
      $('author-a').addEventListener('change', compareAuthors);
      $('author-b').addEventListener('change', compareAuthors);
      if (status) status.textContent = `${nodes.length} authors loaded`;
    } catch (err) {
      console.error(err);
      if (status) { status.textContent = 'Data error'; status.title = err?.message || '' }
    }
  }

  init();
})();
