# IFIBIO Scientific Landscape

Interactive research portal built from the bibliometric, NLP and network-analysis outputs in this repository.

## Web interface

The site is intentionally static: all expensive analysis is precomputed in `FullNetwork.ipynb` and the browser only reads the generated datasets. This makes GitHub Pages the runtime platform; no Python/Flask/Streamlit server is required.

Current interface:

- Overview with publication, author, year and cluster KPIs
- Publication output over time
- Integrated scientific-cluster distribution
- IFIBIO participation overview
- Interactive publication explorer
- Abstract UMAP projection with paper inspection
- Interactive Cytoscape coauthorship network
- Scientific-landscape views
- Methods/architecture page

## Data currently consumed by the frontend

- `ml_pubmed_ifibio/analysis_summary.json`
- `ml_pubmed_ifibio/integrated_paper_ml_dataset.csv`
- `ml_pubmed_ifibio/coauthor_network.gexf`

The remaining `.pkl`, `.gexf`, `.csv` and figures remain as reproducibility/source outputs and can be progressively exposed through lighter web-specific JSON files.

## Deployment

This site is static and must be served over HTTP to load the generated dataset files in the browser. If you open `index.html` directly from the filesystem, browsers block the `fetch()` calls used to read the CSV/JSON/GEXF assets.

For local testing:

```bash
cd /home/juan/Documents/ifibio
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

For GitHub Pages:

1. Open **Settings → Pages**.
2. Choose **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`.
4. Save.

The site entry point is `index.html`.

## Architecture

```text
FullNetwork.ipynb
        |
        v
ml_pubmed_ifibio/
  precomputed results
        |
        v
index.html + assets/app.js
        |
        v
GitHub Pages / browser
```

Heavy computation stays reproducible in Python; presentation and exploration run entirely client-side using Plotly and Cytoscape.
