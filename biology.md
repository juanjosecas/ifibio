---
title: Biological Landscape
nav_order: 10
description: "Genes, diseases, pathways and functional enrichment across the IFIBIO corpus."
page_script: /assets/js/biology.js
---

<link rel="stylesheet" href="{{ '/assets/css/biology.css' | relative_url }}">

# Biological landscape of the IFIBIO corpus
{: .fs-8 }

A biological view of the publication corpus based on normalized genes, disease entities, gene–disease co-mentions, curated pathway mappings and functional enrichment. The plots below consume precomputed analysis tables: the browser renders them, but does not reconstruct biological relationships on each visit. <span id="bio-data-status" class="label label-blue">Loading biological data…</span>
{: .fs-5 .fw-300 }

<div class="ifibio-app biology-page">

<div class="panel note">
  <span class="section-tag">Interpretation</span>
  <p>The corpus is biologically heterogeneous. Recurrent themes include renal and diarrhoeal disease, neurodegeneration, maternal–fetal biology, inflammation, cellular stress and signalling. Gene–disease links on this page are <strong>document-level co-mentions</strong>: they indicate that a gene and a disease occur in the same IFIBIO publication, not that the corpus establishes a causal or mechanistic relationship.</p>
</div>

<h2 class="bio-section">Diseases represented in the literature</h2>

<div class="bio-stack">
  <article class="panel">
    <div class="panel-head">
      <div><span class="section-tag">Disease landscape</span><h3>Most recurrent diseases</h3></div>
      <span class="hint">Unique papers</span>
    </div>
    <div id="bio-disease-bar" class="bio-chart large"></div>
    <p class="chart-note">Normalized disease entities ranked by the number of IFIBIO papers in which they occur.</p>
  </article>

  <article class="panel">
    <div class="panel-head">
      <div><span class="section-tag">Disease connectivity</span><h3>Genes co-mentioned with each disease</h3></div>
      <span class="hint">Bubble size = number of gene–disease pairs</span>
    </div>
    <div id="bio-disease-bubble" class="bio-chart medium"></div>
    <p class="chart-note">Diseases with many co-mentioned genes and repeated support across papers appear toward the upper-right. These are corpus-level co-mentions, not validated gene–disease associations.</p>
  </article>
</div>

<h2 class="bio-section">Gene–disease architecture</h2>

<div class="bio-stack">
  <article class="panel">
    <div class="panel-head">
      <div><span class="section-tag">Gene hubs</span><h3>Genes co-mentioned across the most diseases</h3></div>
      <span class="hint">Precomputed profile</span>
    </div>
    <div id="bio-gene-hubs" class="bio-chart large"></div>
    <p class="chart-note">Genes ranked by the number of distinct normalized diseases with which they are co-mentioned in the corpus.</p>
  </article>

  <article class="panel">
    <div class="panel-head">
      <div><span class="section-tag">Evidence depth</span><h3>Recurrence of gene–disease co-mention pairs</h3></div>
      <span class="hint">Papers per pair</span>
    </div>
    <div id="bio-edge-support" class="bio-chart medium"></div>
    <p class="chart-note">Distribution of the number of IFIBIO papers supporting each observed gene–disease co-mention pair.</p>
  </article>

  <article class="panel">
    <div class="panel-head">
      <div><span class="section-tag">Interactive network</span><h3>Gene ↔ disease co-mention map</h3></div>
      <span class="hint">Click a node or edge · width = supporting papers</span>
    </div>
    <div id="bio-gd-network" class="bio-chart network"></div>
    <div id="bio-network-detail" class="chart-note bio-network-detail">The network reads the precomputed <code>ifibio_gene_disease_comention.csv</code> table. Only recurrent edges are shown, using a fixed bipartite layout so the browser does not recompute a force-directed network.</div>
  </article>
</div>

<h2 class="bio-section">Pathways and enriched biological processes</h2>

<div class="bio-stack">
  <article class="panel">
    <div class="panel-head">
      <div><span class="section-tag">Pathways</span><h3>Pathways represented by the most genes</h3></div>
      <span class="hint">Curated mappings</span>
    </div>
    <div id="bio-pathway-bar" class="bio-chart large"></div>
    <p class="chart-note">Pathways ranked by the number of mapped genes represented in the IFIBIO corpus.</p>
  </article>

  <article class="panel">
    <div class="panel-head">
      <div><span class="section-tag">Knowledge sources</span><h3>Pathway annotation sources</h3></div>
      <span class="hint">Top 150 mapped pathways</span>
    </div>
    <div id="bio-pathway-source" class="bio-chart medium"></div>
    <p class="chart-note">Relative contribution of pathway databases among the top mapped pathways displayed by this page.</p>
  </article>

  <article class="panel">
    <div class="panel-head">
      <div><span class="section-tag">g:Profiler</span><h3>Functional enrichment: strength vs. gene coverage</h3></div>
      <span class="hint">Corrected fold enrichment</span>
    </div>
    <div id="bio-enrichment" class="bio-chart large"></div>
    <p class="chart-note">Each point is a significant functional term. X-axis: fold enrichment relative to the effective annotation universe. Y-axis: fraction of query genes in the term. Point size: intersecting genes. Color: −log10(adjusted p-value). Very broad terms are excluded from this summary view to favour interpretable signals.</p>
  </article>
</div>

<h2 class="bio-section">Integrated biological reading</h2>

<div class="panel note">
  <div class="bio-reading-grid">
    <div><h3>Renal and infectious axis</h3><p>Shiga-toxin biology and aquaporin-related work connect haemolytic–uremic syndrome, acute kidney injury, diarrhoeal and infectious disease themes.</p></div>
    <div><h3>Neurobiology and neurodegeneration</h3><p>Dopamine-receptor and TDP-43-related publications contribute Parkinson disease, ALS, frontotemporal dementia and broader neurodegenerative themes.</p></div>
    <div><h3>Maternal–fetal biology</h3><p>Aquaporins, hypoxia-related factors and vascular processes contribute a distinct pre-eclampsia and placental research component.</p></div>
    <div><h3>Stress, inflammation and signalling</h3><p>Functional enrichment converges on cellular responses to chemical and oxygen-containing compounds, stress, homeostasis and cell signalling.</p></div>
  </div>
</div>

</div>
