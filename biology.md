---
title: Biological Landscape
nav_order: 8.5
description: "Genes, diseases, pathways and functional enrichment across the IFIBIO corpus."
page_script: /assets/js/biology.js
---

# Biological landscape of the IFIBIO corpus
{: .fs-8 }

A biological view of the publication corpus based on normalized genes, disease entities, gene–disease co-mentions, curated pathway mappings and functional enrichment. The plots below consume precomputed analysis tables: the browser renders them, but does not reconstruct the biological relationships on every visit. <span id="bio-data-status" class="label label-blue">Loading biological data…</span>
{: .fs-5 .fw-300 }

<div class="ifibio-app">

<div class="panel note">
  <span class="section-tag">Interpretation</span>
  <p>The corpus is biologically heterogeneous. Recurrent themes include renal and diarrhoeal disease, neurodegeneration, maternal–fetal biology, inflammation, cellular stress and signalling. Gene–disease links on this page are <strong>document-level co-mentions</strong>: they indicate that a gene and disease occur in the same IFIBIO publication, not that the corpus establishes a causal or mechanistic relationship.</p>
</div>

## Diseases represented in the literature

<div class="grid two">
  <article class="panel">
    <div class="panel-head"><div><span class="section-tag">Disease landscape</span><h3>Most recurrent diseases</h3></div><span class="hint">Unique papers</span></div>
    <div id="bio-disease-bar" class="chart"></div>
    <p class="chart-note">Normalized disease entities ranked by the number of IFIBIO papers in which they occur.</p>
  </article>
  <article class="panel">
    <div class="panel-head"><div><span class="section-tag">Disease connectivity</span><h3>Genes associated with each disease</h3></div><span class="hint">Bubble size = associations</span></div>
    <div id="bio-disease-bubble" class="chart"></div>
    <p class="chart-note">Diseases with many genes and supporting papers occupy the upper-right region. Associations here are corpus co-mentions.</p>
  </article>
</div>

## Gene–disease architecture

<div class="grid two">
  <article class="panel">
    <div class="panel-head"><div><span class="section-tag">Gene hubs</span><h3>Genes spanning the most diseases</h3></div><span class="hint">Precomputed profile</span></div>
    <div id="bio-gene-hubs" class="chart"></div>
  </article>
  <article class="panel">
    <div class="panel-head"><div><span class="section-tag">Evidence depth</span><h3>Recurrence of gene–disease pairs</h3></div><span class="hint">Papers per pair</span></div>
    <div id="bio-edge-support" class="chart"></div>
  </article>
</div>

<article class="panel">
  <div class="panel-head"><div><span class="section-tag">Interactive network</span><h3>Gene ↔ disease co-mention map</h3></div><span class="hint">Click a node · edge width = supporting papers</span></div>
  <div id="bio-gd-network" style="height: 640px; width: 100%; min-height: 480px;"></div>
  <div id="bio-network-detail" class="chart-note">The network uses the already-computed <code>ifibio_gene_disease_comention.csv</code> table. Only recurrent edges are drawn, and positions use a lightweight preset bipartite layout rather than recalculating a force-directed network.</div>
</article>

## Pathways and enriched biological processes

<div class="grid two">
  <article class="panel">
    <div class="panel-head"><div><span class="section-tag">Pathways</span><h3>Pathways represented by the most genes</h3></div><span class="hint">Curated mappings</span></div>
    <div id="bio-pathway-bar" class="chart"></div>
  </article>
  <article class="panel">
    <div class="panel-head"><div><span class="section-tag">Knowledge sources</span><h3>Pathway annotation sources</h3></div><span class="hint">Top mapped pathways</span></div>
    <div id="bio-pathway-source" class="chart"></div>
  </article>
</div>

<article class="panel">
  <div class="panel-head"><div><span class="section-tag">g:Profiler</span><h3>Functional enrichment: strength vs. gene coverage</h3></div><span class="hint">Corrected fold enrichment</span></div>
  <div id="bio-enrichment" class="chart tall"></div>
  <p class="chart-note">Each point is a significant functional term. X-axis: fold enrichment relative to the effective annotation universe. Y-axis: fraction of query genes in the term. Point size: intersecting genes. Color: −log10(adjusted p-value). Very broad terms are excluded from this summary view to favour interpretable signals.</p>
</article>

<div class="panel note">
  <span class="section-tag">Integrated biological reading</span>
  <div class="grid two">
    <div><h3>Renal and infectious axis</h3><p>Shiga-toxin biology and aquaporin-related work connect haemolytic–uremic syndrome, acute kidney injury, diarrhoeal and infectious disease themes.</p></div>
    <div><h3>Neurobiology and neurodegeneration</h3><p>Dopamine-receptor and TDP-43-related publications contribute Parkinson disease, ALS, frontotemporal dementia and broader neurodegenerative themes.</p></div>
    <div><h3>Maternal–fetal biology</h3><p>Aquaporins, hypoxia-related factors and vascular processes contribute a distinct pre-eclampsia and placental research component.</p></div>
    <div><h3>Stress, inflammation and signalling</h3><p>Functional enrichment converges on cellular responses to chemical and oxygen-containing compounds, stress, homeostasis and cell signalling.</p></div>
  </div>
</div>

</div>
