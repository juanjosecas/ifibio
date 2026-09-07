/* MeSH / keyword explorer: bar chart, word cloud, term co-occurrence network. */
(function () {
  const state = { currentTerms: 'mesh', terms: { mesh: null, keyword: null }, loaded: { mesh: false, keyword: false }, termCy: null };

  function termScoreProxy(node) {
    const d = node.data, keys = Object.keys(d);
    for (const name of ['paper_count', 'n_papers', 'papers_count', 'frequency', 'count', 'occurrences', 'n_occurrences', 'size']) {
      const k = keys.find(x => normalizedKey(x) === normalizedKey(name));
      if (k && num(d[k]) != null) return num(d[k]);
    }
    return num(d.weightedDegree) || num(d.degree) || 0;
  }

  function renderTermNetwork(keepIds) {
    const data = state.terms[state.currentTerms], keep = new Set(keepIds);
    const nodes = data.nodes.filter(n => keep.has(n.data.id)), edges = data.edges.filter(e => keep.has(e.data.source) && keep.has(e.data.target));
    if (state.termCy) state.termCy.destroy();
    state.termCy = cytoscape({
      container: $('term-network'), elements: [...nodes, ...edges],
      style: [
        { selector: 'node', style: { 'background-color': state.currentTerms === 'mesh' ? '#6ee7b7' : '#fbbf24', 'width': 'mapData(degree,0,40,10,34)', 'height': 'mapData(degree,0,40,10,34)', 'label': 'data(label)', 'font-size': 8, 'color': '#f8fafc', 'text-outline-width': 2, 'text-outline-color': '#08101f' } },
        { selector: 'edge', style: { 'line-color': '#475569', 'opacity': .25, 'width': 'mapData(weight,1,10,.5,3)' } },
        { selector: '.focus', style: { 'background-color': '#a78bfa', 'border-width': 3, 'border-color': '#fff' } },
      ],
      layout: { name: 'cose', animate: false, nodeRepulsion: 7000, idealEdgeLength: 85 },
    });
    state.termCy.on('tap', 'node', e => inspectTerm(e.target.id()));
  }

  function renderWordCloud(items) {
    const max = Math.max(1, ...items.map(x => x.score));
    $('word-cloud').innerHTML = items.map((x, i) => {
      const s = 14 + 30 * Math.sqrt(x.score / max);
      return `<button class="cloud-word" data-id="${esc(x.n.data.id)}" style="font-size:${s.toFixed(1)}px;transform:rotate(${i % 7 === 0 ? -3 : i % 9 === 0 ? 3 : 0}deg)">${esc(x.label)}</button>`;
    }).join('');
    $('word-cloud').querySelectorAll('.cloud-word').forEach(b => b.addEventListener('click', () => inspectTerm(b.dataset.id)));
  }

  function renderTerms() {
    const type = state.currentTerms, data = state.terms[type];
    if (!data) return;
    const q = $('term-search').value.trim().toLowerCase(), top = +$('term-top').value;
    const nodes = data.nodes.map(n => ({ n, label: n.data.label, score: termScoreProxy(n) })).filter(x => !q || String(x.label).toLowerCase().includes(q)).sort((a, b) => b.score - a.score).slice(0, top);
    Plotly.react('term-bar', [{
      x: nodes.map(x => x.score).reverse(), y: nodes.map(x => x.label).reverse(), type: 'bar', orientation: 'h',
      ids: nodes.map(x => x.n.data.id).reverse(), marker: { color: type === 'mesh' ? '#6ee7b7' : '#fbbf24' },
      hovertemplate: '<b>%{y}</b><br>score %{x}<extra></extra>',
    }], { ...plotLayout, margin: { l: 150, r: 20, t: 10, b: 40 }, xaxis: { ...plotLayout.xaxis, title: 'Frequency / network prominence' }, yaxis: { ...plotLayout.yaxis, automargin: true } }, plotConfig);
    const bar = $('term-bar');
    if (!bar.dataset.termBound) { bar.on('plotly_click', e => inspectTerm(e?.points?.[0]?.id)); bar.dataset.termBound = '1' }
    renderWordCloud(nodes);
    renderTermNetwork(nodes.map(x => x.n.data.id));
  }

  function inspectTerm(id) {
    const data = state.terms[state.currentTerms], raw = data.nodes.find(n => String(n.data.id) === String(id));
    if (!raw) return;
    const d = raw.data;
    const neighbors = data.edges.filter(e => e.data.source === d.id || e.data.target === d.id).map(e => {
      const other = e.data.source === d.id ? e.data.target : e.data.source, n = data.nodes.find(x => x.data.id === other);
      return { label: n?.data.label || other, weight: e.data.weight || 1 };
    }).sort((a, b) => b.weight - a.weight).slice(0, 15);
    if (state.termCy) { state.termCy.elements().removeClass('focus'); const n = state.termCy.getElementById(d.id); if (n.length) n.addClass('focus') }
    const keys = Object.keys(d), paperKey = keys.find(k => /paper|pmid|publication/i.test(k)), paperVals = paperKey ? parseList(d[paperKey]) : [];
    const score = termScoreProxy(raw);
    $('term-inspector').innerHTML = `<span class="section-tag">${state.currentTerms === 'mesh' ? 'MESH DESCRIPTOR' : 'KEYWORD'}</span><h3>${esc(d.label)}</h3><div class="inspector-stat"><span>Frequency / prominence</span><strong>${score}</strong></div><div class="inspector-stat"><span>Network degree</span><strong>${d.degree ?? '—'}</strong></div><div class="inspector-stat"><span>Related terms</span><strong>${neighbors.length}</strong></div><div class="term-related">${neighbors.map(x => `<span class="chip">${esc(x.label)} · ${x.weight}</span>`).join('') || '<span class="hint">No related terms in current filtered network.</span>'}</div>${paperVals.length ? `<div class="availability-note">Paper-level identifiers stored in this node: ${esc(paperVals.join(', '))}</div>` : '<div class="availability-note">This exported term network does not expose a paper-title list in the browser. Counts and co-occurrence statistics shown here come only from attributes already stored in the GEXF.</div>'}`;
  }

  async function loadTerms(type) {
    state.currentTerms = type;
    if (!state.loaded[type]) { state.terms[type] = await fetchGEXF(DATA[type]); state.loaded[type] = true }
    renderTerms();
  }

  async function init() {
    const status = $('data-status');
    try {
      if (status) status.textContent = 'Loading terms…';
      await loadTerms($('term-type').value);
      $('term-type').addEventListener('change', e => loadTerms(e.target.value));
      $('term-search').addEventListener('input', renderTerms);
      $('term-top').addEventListener('change', renderTerms);
      if (status) status.textContent = 'Terms loaded';
    } catch (err) {
      console.error(err);
      if (status) { status.textContent = 'Data error'; status.title = err?.message || '' }
    }
  }

  init();
})();
