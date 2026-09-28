# IFIBIO Scientific Landscape

Interactive research portal built from the bibliometric, NLP and network-analysis outputs in this repository.

## Web interface

The site is intentionally static: all expensive analysis is precomputed in `FullNetwork.ipynb` and the browser only reads the generated datasets. This makes GitHub Pages the runtime platform; no Python/Flask/Streamlit server is required.

Current interface:

- Overview with publication, author, year and cluster KPIs
- Institutional directory generated directly from the repository Excel file; former members are hidden by default and research lines are displayed as personal metadata
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

The interactive parts (Plotly charts, Cytoscape networks) are plain client-side JavaScript, split per page under `assets/js/` and shared helpers in `assets/js/common.js`. The Pages workflow stages only the pages, browser assets and datasets referenced by the JavaScript. Analysis outputs stay in Git but are not included in the deployed site.

Data currently consumed by the frontend:

- `assets/data/Integrantes_IFIBIO_Houssay.xlsx` (sheet `Organigrama`)
- `ml_pubmed_ifibio/analysis_summary.json`
- `ml_pubmed_ifibio/integrated_paper_ml_dataset.csv`
- `ml_pubmed_ifibio/coauthor_network.gexf`
- `ml_pubmed_ifibio/mesh_network.gexf`
- `ml_pubmed_ifibio/keyword_network.gexf`
- `ml_pubmed_ifibio/paper_nlp_network.gexf`
- `ml_pubmed_ifibio/filiaciones/catalogo_filiaciones.csv`
- `ml_pubmed_ifibio/filiaciones/red_filiaciones_aristas.csv`
- `ml_pubmed_ifibio/affiliation_affiliation_cooccurrence.csv`
- The six `ifibio_*.csv` datasets referenced by `assets/js/biology.js`

The remaining `.pkl`, `.gexf`, `.csv` and figures remain as reproducibility/source outputs. `scripts/prepare_site.py` discovers static dataset paths in `assets/js/*.js`, validates their formats and copies only those paths into `.site-source/`. When adding a new browser dataset, reference it with a literal `${BASEURL}/path/to/file.csv` (or `.json`, `.gexf`, `.xlsx`) in a page script so it is included automatically.

## Local development

```bash
cd /home/juan/Documents/ifibio
bundle install
bundle exec jekyll serve
```

Then open `http://localhost:4000`. (Requires Ruby with development headers, e.g. `sudo apt install ruby-dev`, before `bundle install` will succeed.)

## Deployment

The [Pages workflow](.github/workflows/pages.yml) checks JavaScript syntax, validates referenced data, builds Jekyll from the small staged source and checks the rendered output on pull requests. Only a successful push to `main` (or manual run on `main`) uploads and deploys the site. [Dependabot](.github/dependabot.yml) proposes weekly updates to GitHub Actions.

One-time setup required in the repository:

1. Open **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions** (instead of "Deploy from a branch").
3. Push to `main` — the workflow builds and deploys automatically. No manual `index.html` editing is required for future updates.

## Updating the data

### Institutional organization tree

1. Download and edit `assets/data/Integrantes_IFIBIO_Houssay.xlsx`.
2. In the `Organigrama` sheet, keep the existing column names and edit, add or remove rows. The `Estado` column accepts `Actual`, `Exintegrante` or `Conflicto: actual y exintegrante`.
3. Replace the file in the same repository path and commit the change to `main`.
4. GitHub Pages republishes automatically. The browser reads the Excel file directly; there is no separate JSON file to synchronize. Only sector and unit define tree levels; subgroups and technical areas are shown on each person’s card. The sheet does not encode a complete governance hierarchy.

### Scientific landscape

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
