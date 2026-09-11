---
title: Publications
nav_order: 3
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

<div class="panel note">
  <span class="section-tag">How to read this (in plain terms)</span>
  <p>Each dot below is one paper. A model reads every abstract and places similar-sounding papers close together on the map; colors are automatically detected topic clusters. Only <em>local</em> closeness matters — two clusters on opposite sides of the plot are not "twice as different" as two next to each other, and empty space carries no meaning. For an actual similarity score between two specific papers, see the <a href="similarity.html">Paper Similarity</a> network.</p>
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
