---
title: Overview
nav_order: 1
description: "Scientific activity at a glance — publications, researchers and structure of the IFIBIO corpus."
page_script: /assets/js/overview.js
permalink: /
---

# Scientific activity at a glance
{: .fs-8 }

Interactive overview of publication output, scientific structure and collaboration patterns derived from the IFIBIO bibliometric analysis. <span id="data-status" class="label label-blue">Loading data…</span>
{: .fs-5 .fw-300 }

<div class="ifibio-app">

<div class="kpi-grid">
  <article class="kpi"><span>Publications</span><strong id="kpi-papers">—</strong><small>indexed papers</small></article>
  <article class="kpi"><span>Researchers</span><strong id="kpi-authors">—</strong><small>unique authors</small></article>
  <article class="kpi"><span>Years</span><strong id="kpi-years">—</strong><small>covered by dataset</small></article>
  <article class="kpi"><span>Clusters</span><strong id="kpi-clusters">—</strong><small>scientific communities</small></article>
</div>

<div class="grid two">
  <article class="panel"><div class="panel-head"><div><span class="section-tag">Output</span><h3>Publications over time</h3></div></div><div id="year-chart" class="chart"></div></article>
  <article class="panel"><div class="panel-head"><div><span class="section-tag">Structure</span><h3>Integrated scientific clusters</h3></div></div><div id="cluster-chart" class="chart"></div></article>
</div>

<div class="grid two">
  <article class="panel spotlight">
    <span class="section-tag">Signals</span><h3>Dataset highlights</h3>
    <div class="signal-list">
      <div><span>Top journal</span><strong id="top-journal">—</strong></div>
      <div><span>Top keyword</span><strong id="top-keyword">—</strong></div>
      <div><span>Top MeSH</span><strong id="top-mesh">—</strong></div>
    </div>
  </article>
  <article class="panel spotlight"><span class="section-tag">Collaboration</span><h3>IFIBIO participation</h3><div id="ifibio-chart" class="chart compact"></div></article>
</div>

</div>

See [Publications]({{ '/publications.html' | relative_url }}) to browse and search the corpus, [Author Network]({{ '/network.html' | relative_url }}) to explore collaboration, [Compare Authors]({{ '/compare.html' | relative_url }}) for pairwise comparisons, [MeSH & Keywords]({{ '/terms.html' | relative_url }}) for terminology, [Affiliations]({{ '/affiliations.html' | relative_url }}) for institutional co-declarations, [Paper Similarity]({{ '/similarity.html' | relative_url }}) for abstract-level similarity between individual papers, and [Scientific Landscape]({{ '/landscape.html' | relative_url }}) for additional descriptive views.
