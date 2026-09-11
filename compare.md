---
title: Compare Authors
nav_order: 5
description: "Select any pair of researchers and inspect observed collaboration, neighborhood overlap and network similarity."
page_script: /assets/js/compare.js
---

# Compare two authors
{: .fs-8 }

Select any pair of researchers and inspect observed collaboration, neighborhood overlap and network similarity. <span id="data-status" class="label label-blue">Loading data…</span>
{: .fs-5 .fw-300 }

<div class="ifibio-app">

<div class="compare-selectors">
  <label><span>Researcher A</span><select id="author-a"><option value="">Select author…</option></select></label>
  <div class="compare-vs">VS</div>
  <label><span>Researcher B</span><select id="author-b"><option value="">Select author…</option></select></label>
</div>

<div id="compare-empty" class="panel empty-state">Choose two researchers to compare them.</div>

<div id="compare-results" class="compare-results hidden">
  <div class="kpi-grid compare-kpis">
    <article class="kpi"><span>Direct collaboration</span><strong id="cmp-direct">—</strong><small>observed coauthorship edge</small></article>
    <article class="kpi"><span>Joint publication weight</span><strong id="cmp-weight">—</strong><small>edge weight in coauthor graph</small></article>
    <article class="kpi"><span>Shared collaborators</span><strong id="cmp-common">—</strong><small>common neighbors</small></article>
    <article class="kpi"><span>Neighborhood similarity</span><strong id="cmp-jaccard">—</strong><small>Jaccard index</small></article>
  </div>
  <div class="grid two">
    <article class="panel"><span class="section-tag">Researcher A</span><div id="author-a-card"></div></article>
    <article class="panel"><span class="section-tag">Researcher B</span><div id="author-b-card"></div></article>
  </div>
  <div class="grid two">
    <article class="panel"><div class="panel-head"><div><span class="section-tag">Overlap</span><h3>Shared collaborators</h3></div></div><div id="shared-collaborators" class="chip-cloud"></div></article>
    <article class="panel"><div class="panel-head"><div><span class="section-tag">Local network</span><h3>Pair neighborhood</h3></div></div><div id="pair-network" class="mini-network"></div></article>
  </div>
</div>

</div>
