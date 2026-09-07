---
title: Methods
nav_order: 7
description: "How this portal is built — architecture and data sources."
---

# How this portal is built
{: .fs-8 }

The interface is a presentation layer over precomputed bibliometric, network and machine-learning outputs.
{: .fs-5 .fw-300 }

<div class="ifibio-app">

<div class="grid three methods-grid">
  <article class="panel method"><strong>01</strong><h3>Bibliometric corpus</h3><p>PubMed-derived publication metadata, authorship, MeSH and keyword information.</p></article>
  <article class="panel method"><strong>02</strong><h3>Semantic analysis</h3><p>Abstract embeddings, dimensionality reduction and clustering provide a navigable scientific map.</p></article>
  <article class="panel method"><strong>03</strong><h3>Network analysis</h3><p>Coauthorship, topic networks and multidimensional graph outputs describe collaboration and scientific proximity.</p></article>
</div>

<article class="panel note"><span class="section-tag">Architecture</span><h3>No runtime analytics backend required</h3><p>Heavy computation stays in <a href="https://github.com/juanjosecas/ifibio/blob/main/FullNetwork.ipynb">FullNetwork.ipynb</a>. This site is built with Jekyll (GitHub Pages) and reads the precomputed CSV, JSON and GEXF exports from <code>ml_pubmed_ifibio/</code> directly in the browser — no build step is required when new data is exported, only replacing those files.</p></article>

</div>

## Updating the data

1. Re-run `FullNetwork.ipynb` to regenerate the exports in `ml_pubmed_ifibio/`.
2. Commit the updated CSV/JSON/GEXF files and push to `main`.
3. GitHub Actions rebuilds and redeploys the site automatically — no HTML editing needed.

## Editing pages

Every page under this site (except the interactive dashboards) is plain Markdown with [Just the Docs](https://just-the-docs.com) front matter (`title`, `nav_order`, …). Add a new `.md` file at the repository root to add a new page to the navigation.
