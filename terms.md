---
title: MeSH & Keywords
nav_order: 5
description: "Explore the terminology extracted from the corpus, its frequency and co-occurrence structure."
page_script: /assets/js/terms.js
---

# MeSH & keyword explorer
{: .fs-8 }

Explore the terminology already extracted from the corpus, its frequency/network prominence and co-occurrence structure. <span id="data-status" class="label label-blue">Loading data…</span>
{: .fs-5 .fw-300 }

<div class="ifibio-app">

<div class="toolbar">
  <select id="term-type"><option value="mesh">MeSH descriptors</option><option value="keyword">Keywords</option></select>
  <input id="term-search" type="search" placeholder="Search term…" />
  <select id="term-top"><option value="30">Top 30</option><option value="50" selected>Top 50</option><option value="100">Top 100</option></select>
</div>

<div class="grid two">
  <article class="panel"><div class="panel-head"><div><span class="section-tag">Terms</span><h3>Frequency / prominence</h3></div></div><div id="term-bar" class="chart tall"></div></article>
  <article class="panel"><div class="panel-head"><div><span class="section-tag">Word cloud</span><h3>Concept cloud</h3></div></div><div id="word-cloud" class="word-cloud"></div></article>
</div>

<div class="network-layout terms-layout">
  <article class="panel network-panel"><div id="term-network" class="network term-network"></div></article>
  <aside class="panel inspector" id="term-inspector"><span class="section-tag">Select a term</span><h3>Term details</h3><p>Click a term in the chart, cloud or network.</p></aside>
</div>

</div>
