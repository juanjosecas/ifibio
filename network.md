---
title: Author Network
nav_order: 3
description: "Interactive observed coauthorship network with configurable visibility and labeling thresholds."
page_script: /assets/js/network.js
---

# Interactive author network
{: .fs-8 }

Observed coauthorship network with configurable visibility and labeling thresholds. <span id="data-status" class="label label-blue">Loading data…</span>
{: .fs-5 .fw-300 }

<div class="ifibio-app">

<div class="control-panel">
  <div class="toolbar network-toolbar">
    <input id="author-search" type="search" placeholder="Find researcher…" />
    <select id="network-layout"><option value="cose">Organic layout</option><option value="concentric">Concentric</option><option value="circle">Circle</option><option value="grid">Grid</option></select>
    <button id="fit-network" class="button">Fit network</button>
    <button id="reset-network" class="button ghost">Reset</button>
  </div>
  <div class="range-grid">
    <label><span>Minimum publications <b id="min-pubs-value">4</b></span><input id="min-pubs" type="range" min="1" max="20" value="4" step="1" /></label>
    <label><span>Minimum collaborations <b id="min-degree-value">2</b></span><input id="min-degree" type="range" min="0" max="30" value="2" step="1" /></label>
    <label><span>Show labels from <b id="label-pubs-value">4</b> publications</span><input id="label-pubs" type="range" min="1" max="20" value="5" step="1" /></label>
  </div>
  <div class="toggle-row">
    <label class="toggle"><input id="labels-all" type="checkbox" /><span>Show all visible labels</span></label>
    <label class="toggle"><input id="hide-isolates" type="checkbox" checked /><span>Hide isolates after filtering</span></label>
    <label class="toggle top25-toggle"><input id="highlight-top25" type="checkbox" checked /><span>Highlight top 25 authors</span></label>
    <span id="network-counts" class="hint"></span>
  </div>
  <div class="top-authors-panel">
    <div class="top-authors-head"><span><b>Top 25 authors</b> <small id="top25-metric-label"></small></span><span class="hint">click an author to focus</span></div>
    <div id="top-authors-list" class="top-authors-list"></div>
  </div>
</div>

<div class="network-layout">
  <article class="panel network-panel"><div id="cy" class="network"></div></article>
  <aside class="panel inspector" id="network-inspector"><span class="section-tag">Select a node</span><h3>Researcher details</h3><p>Click a researcher to inspect productivity and local connectivity.</p></aside>
</div>

</div>
