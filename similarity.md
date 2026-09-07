---
title: Paper Similarity
nav_order: 7
description: "Network of papers linked by abstract-embedding similarity, with a paper picker to explore related work."
page_script: /assets/js/similarity.js
---

# Paper similarity network
{: .fs-8 }

Papers connected when their abstract embeddings are similar enough to pass the precomputed similarity threshold. <span id="data-status" class="label label-blue">Loading data…</span>
{: .fs-5 .fw-300 }

<div class="ifibio-app">

<div class="panel note">
  <span class="section-tag">How to read this (in plain terms)</span>
  <p>Each dot is one paper. A line between two papers means a text-embedding model scored their abstracts as similar enough to pass a fixed threshold — the thicker the line, the higher that similarity score. Colors mark automatically detected topic communities. Only papers with at least one similarity link above the threshold are shown (not every paper in the corpus has one). This is a more literal "similarity" measure than the UMAP scatterplots on the <a href="publications.html">Publications</a> and <a href="landscape.html">Scientific Landscape</a> pages, which only preserve approximate neighborhoods in 2D, not exact pairwise similarity.</p>
</div>

<div class="toolbar">
  <select id="paper-select"><option value="">Select a paper…</option></select>
  <input id="paper-search" type="search" placeholder="Highlight papers by title…" />
</div>

<div class="network-layout terms-layout">
  <article class="panel network-panel"><div id="paper-cy" class="network term-network"></div></article>
  <aside class="panel inspector" id="paper-inspector"><span class="section-tag">Select a paper</span><h3>Paper details</h3><p>Pick a paper above or click a node to see its most similar papers.</p></aside>
</div>

</div>
