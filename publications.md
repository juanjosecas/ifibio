---
title: Publications
nav_order: 2
description: "Search and inspect the IFIBIO publication corpus, with a semantic UMAP projection of abstracts."
page_script: /assets/js/publications.js
---

# Paper explorer
{: .fs-8 }

Search and inspect the corpus. Filters update both the table and semantic projection. <span id="data-status" class="label label-blue">Loading data…</span>
{: .fs-5 .fw-300 }

<div class="ifibio-app">

<div class="toolbar">
  <input id="paper-search" type="search" placeholder="Search title or PMID…" />
  <select id="year-filter"><option value="all">All years</option></select>
  <select id="cluster-filter"><option value="all">All clusters</option></select>
</div>

<div class="panel">
  <div class="panel-head"><div><span class="section-tag">Semantic space</span><h3>UMAP projection of abstracts</h3></div><span class="hint">Click a point to inspect the paper</span></div>
  <div id="umap-chart" class="chart tall"></div>
</div>

<div class="panel">
  <div class="panel-head"><div><span class="section-tag">Corpus</span><h3>Publications</h3></div><span id="paper-count" class="hint"></span></div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Year</th><th>Title</th><th>Cluster</th><th>IFIBIO</th><th>PMID</th></tr></thead>
      <tbody id="paper-table"></tbody>
    </table>
  </div>
</div>

<dialog id="paper-dialog"><button id="close-dialog" class="dialog-close" aria-label="Close">×</button><div id="paper-dialog-content"></div></dialog>

</div>
