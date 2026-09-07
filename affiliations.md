---
title: Affiliations
nav_order: 6
description: "Network of author-declared affiliation texts, linked when the same author lists both on one paper."
page_script: /assets/js/affiliations.js
---

# Affiliation network
{: .fs-8 }

Explore the raw affiliation texts declared across the corpus and how they co-occur through shared authors. <span id="data-status" class="label label-blue">Loading data…</span>
{: .fs-5 .fw-300 }

<div class="ifibio-app">

<div class="panel note">
  <span class="section-tag">How to read this (in plain terms)</span>
  <p>Each node is one <em>affiliation text</em> exactly as it was printed on a paper — not a deduplicated institution. The same lab can appear as several separate nodes if authors wrote its name slightly differently (abbreviations, order of departments, accents, "CONICET" placement, etc.), so do not read node count as "number of institutions". A line connects two affiliation texts only when the same author listed both of them on the same paper; line thickness is how many distinct authors support that link. This describes what authors <em>wrote</em>, not their current employer or institutional agreements between sites.</p>
</div>

<article class="panel"><div class="panel-head"><div><span class="section-tag">Frequency</span><h3>Most-mentioned affiliation texts</h3></div></div><div id="affiliation-bar" class="chart tall"></div></article>

<article class="panel">
  <div class="panel-head"><div><span class="section-tag">Co-occurrence</span><h3>Most frequent affiliation pairs</h3></div></div>
  <div id="affiliation-pairs-chart" class="chart tall"></div>
  <p class="chart-note">Top pairs of affiliation texts listed together on the same paper (any author), from the raw paper-level co-occurrence table — a complementary, denser view of the same underlying idea as the network below, which instead links affiliations through a single shared author.</p>
</article>

<div class="toolbar">
  <select id="affiliation-select"><option value="">Select an affiliation…</option></select>
</div>

<div class="network-layout terms-layout">
  <article class="panel network-panel"><div id="affiliation-cy" class="network term-network"></div></article>
  <aside class="panel inspector" id="affiliation-inspector"><span class="section-tag">Select an affiliation</span><h3>Affiliation details</h3><p>Pick an affiliation above or click a node to see what it links to.</p></aside>
</div>

</div>
