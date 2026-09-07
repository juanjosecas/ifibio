---
title: Scientific Landscape
nav_order: 8
description: "Additional descriptive views of publication characteristics and semantic structure."
page_script: /assets/js/landscape.js
---

# Structure of the research portfolio
{: .fs-8 }

Additional views of publication characteristics and semantic structure, including analyses that are descriptive rather than predictive. <span id="data-status" class="label label-blue">Loading data…</span>
{: .fs-5 .fw-300 }

<div class="ifibio-app">

<div class="grid two">
  <article class="panel"><div class="panel-head"><div><span class="section-tag">Collaboration</span><h3>IFIBIO author fraction</h3></div></div><div id="fraction-chart" class="chart"></div></article>
  <article class="panel"><div class="panel-head"><div><span class="section-tag">Team size</span><h3>Authors per paper</h3></div></div><div id="authors-chart" class="chart"></div></article>
</div>

<div class="grid two">
  <article class="panel"><div class="panel-head"><div><span class="section-tag">Indexing</span><h3>MeSH terms per paper</h3></div></div><div id="mesh-count-chart" class="chart"></div></article>
  <article class="panel"><div class="panel-head"><div><span class="section-tag">Indexing</span><h3>Keywords per paper</h3></div></div><div id="keyword-count-chart" class="chart"></div></article>
</div>

<div class="panel note">
  <span class="section-tag">How to read this (in plain terms)</span>
  <p>Each dot below is one paper positioned by how similar a model judged its abstract to be to every other abstract; colors mark the integrated topic clusters used across this site. Distance only means something for <em>nearby</em> points — this is a 2D approximation of a much higher-dimensional similarity space, so far-apart regions are not meaningfully "more different". To see concrete similarity scores between individual papers, use the <a href="similarity.html">Paper Similarity</a> network instead.</p>
</div>

<article class="panel"><div class="panel-head"><div><span class="section-tag">Map</span><h3>Semantic landscape by integrated cluster</h3></div></div><div id="landscape-chart" class="chart tall"></div></article>

<div class="grid two">
  <article class="panel">
    <div class="panel-head"><div><span class="section-tag">Network structure</span><h3>Which papers bridge topics</h3></div><span class="hint">Each dot is a paper</span></div>
    <div id="centrality-chart" class="chart"></div>
    <p class="chart-note">X-axis: betweenness (how often a paper sits on the shortest path between other papers, i.e. connects otherwise separate topics). Y-axis: PageRank (overall structural prominence in the paper network). Color: integrated cluster.</p>
  </article>
  <article class="panel">
    <div class="panel-head"><div><span class="section-tag">Team dynamics</span><h3>Team size vs. author experience</h3></div><span class="hint">Each dot is a paper</span></div>
    <div id="team-experience-chart" class="chart"></div>
    <p class="chart-note">Y-axis: average number of prior publications of the paper's authors (a rough proxy for team seniority). Color: fraction of authors affiliated with IFIBIO.</p>
  </article>
</div>

<div class="grid two">
  <article class="panel">
    <div class="panel-head"><div><span class="section-tag">Structure</span><h3>Social clusters (coauthorship communities)</h3></div></div>
    <div id="social-cluster-chart" class="chart"></div>
    <p class="chart-note">Groups papers by the coauthorship-network community of their authors — a different lens than the topic-based Integrated Cluster used elsewhere on this site.</p>
  </article>
  <article class="panel">
    <div class="panel-head"><div><span class="section-tag">Timeline</span><h3>Years since the dataset's first publication</h3></div></div>
    <div id="years-from-first-chart" class="chart"></div>
  </article>
</div>

</div>

</div>
