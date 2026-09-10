# IFIBIO Scientific Landscape

Interactive research portal built from the bibliometric, NLP and network-analysis outputs in this repository.

## Web interface

The site is intentionally static: all expensive analysis is precomputed in `FullNetwork.ipynb` and the browser only reads the generated datasets. This makes GitHub Pages the runtime platform; no Python/Flask/Streamlit server is required.

Current interface:

- Overview with publication, author, year and cluster KPIs
- Interactive organization chart with current members, former members and unresolved official status conflicts
- Publication output over time
- Integrated scientific-cluster distribution
- IFIBIO participation overview
- Interactive publication explorer
- Abstract UMAP projection with paper inspection (with an in-page explainer of what the plot means)
- Interactive Cytoscape coauthorship network
- Pairwise author comparison
- MeSH / keyword frequency, word cloud and co-occurrence network
- Affiliation co-declaration network with a picker to inspect a single affiliation
- Paper similarity network (abstract-embedding graph) with a paper picker to find related work
- Scientific-landscape views
- Methods/architecture page

## Site framework

The site is built with [Jekyll](https://jekyllrb.com) using the [Just the Docs](https://just-the-docs.com) theme. Each section (Overview, Publications, Author Network, Compare Authors, MeSH & Keywords, Scientific Landscape, Methods) is a plain Markdown page at the repository root, with front matter controlling its title and navigation order. Editing the text/structure of a page only requires editing that Markdown file — no HTML templating knowledge needed.

The interactive parts (Plotly charts, Cytoscape networks) are still plain client-side JavaScript, split per page under `assets/js/` and shared helpers in `assets/js/common.js`. Jekyll only handles the page templating/navigation layer; it copies `assets/`, `ml_pubmed_ifibio/` and the rest of the data as static files, so those scripts fetch and render the CSV/JSON/GEXF exports in the browser exactly as before.

Data currently consumed by the frontend:

- `ml_pubmed_ifibio/analysis_summary.json`
- `ml_pubmed_ifibio/integrated_paper_ml_dataset.csv`
- `ml_pubmed_ifibio/coauthor_network.gexf`
- `ml_pubmed_ifibio/mesh_network.gexf`
- `ml_pubmed_ifibio/keyword_network.gexf`
- `ml_pubmed_ifibio/paper_nlp_network.gexf`
- `ml_pubmed_ifibio/filiaciones/catalogo_filiaciones.csv`
- `ml_pubmed_ifibio/filiaciones/red_filiaciones_aristas.csv`

The remaining `.pkl`, `.gexf`, `.csv` and figures remain as reproducibility/source outputs and can be progressively exposed through lighter web-specific JSON files. The other files under `ml_pubmed_ifibio/filiaciones/` (its `README.md`, `filiaciones_llm.json`, per-author/per-paper CSVs, the `.graphml` and `.png`) are reproducibility artifacts and are excluded from the built site (see `exclude` in `_config.yml`) so they don't show up as a stray navigable page.

## Local development

```bash
cd /home/juan/Documents/ifibio
bundle install
bundle exec jekyll serve
```

Then open `http://localhost:4000`. (Requires Ruby with development headers, e.g. `sudo apt install ruby-dev`, before `bundle install` will succeed.)

## Deployment

The site is deployed with a GitHub Actions workflow ([.github/workflows/pages.yml](.github/workflows/pages.yml)) that builds the Jekyll site and publishes it with the official `actions/deploy-pages` action on every push to `main`.

One-time setup required in the repository:

1. Open **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions** (instead of "Deploy from a branch").
3. Push to `main` — the workflow builds and deploys automatically. No manual `index.html` editing is required for future updates.

## Updating the data

1. Re-run `FullNetwork.ipynb` to regenerate the exports in `ml_pubmed_ifibio/`.
2. Commit the updated CSV/JSON/GEXF files and push to `main`.
3. The GitHub Actions workflow rebuilds and redeploys the site automatically.

## Architecture

```text
FullNetwork.ipynb
        |
        v
ml_pubmed_ifibio/
  precomputed results
        |
        v
Jekyll pages (*.md) + assets/js/*.js
        |
        v
GitHub Actions build -> GitHub Pages / browser
```

Heavy computation stays reproducible in Python; presentation and exploration run entirely client-side using Plotly and Cytoscape. Jekyll adds only the page templating, navigation and Markdown-based content editing on top.
