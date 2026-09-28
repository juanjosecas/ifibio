"""Stage only browser-facing files for the Jekyll Pages build."""

import argparse
import csv
import json
import re
import shutil
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / ".site-source"
SITE = ROOT / "_site"
DATA_RE = re.compile(r"\$\{BASEURL\}/([\w./-]+\.(?:csv|gexf|json|xlsx))")
PAGES = [p for p in ROOT.glob("*.md") if p.name != "README.md"]


def copy_file(relative):
    source = ROOT / relative
    if not source.is_file() or source.is_symlink():
        raise ValueError(f"Missing or unsafe site file: {relative}")
    target = STAGE / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def data_files():
    paths = set()
    for script in (ROOT / "assets/js").glob("*.js"):
        paths.update(DATA_RE.findall(script.read_text(encoding="utf-8")))
    if not paths:
        raise ValueError("No browser data references found")
    for path in paths:
        if ".." in Path(path).parts:
            raise ValueError(f"Unsafe data path: {path}")
    return sorted(paths)


def validate_data(paths):
    for path in paths:
        source = ROOT / path
        if not source.is_file() or source.stat().st_size == 0:
            raise ValueError(f"Missing or empty browser dataset: {path}")
        if path.endswith(".json"):
            json.loads(source.read_text(encoding="utf-8"))
        elif path.endswith(".csv"):
            with source.open(encoding="utf-8-sig", newline="") as file:
                header = next(csv.reader(file), [])
            if len(header) < 2:
                raise ValueError(f"Invalid CSV header: {path}")
            if path.endswith("integrated_paper_ml_dataset.csv") and not {"PMID", "Title", "Year"} <= set(header):
                raise ValueError(f"Missing publication columns: {path}")
        elif path.endswith(".gexf"):
            if ET.parse(source).getroot().tag.rsplit("}", 1)[-1] != "gexf":
                raise ValueError(f"Invalid GEXF root: {path}")
        elif path.endswith(".xlsx"):
            with zipfile.ZipFile(source) as archive:
                workbook = ET.fromstring(archive.read("xl/workbook.xml"))
            if not any(node.attrib.get("name") == "Organigrama" for node in workbook.iter()):
                raise ValueError(f"Missing Organigrama sheet: {path}")


def prepare():
    paths = data_files()
    validate_data(paths)
    if STAGE.exists():
        shutil.rmtree(STAGE)
    for file in [ROOT / "_config.yml", *PAGES, *(ROOT / "_includes").glob("*.html")]:
        copy_file(file.relative_to(ROOT))
    for directory in ("assets/css", "assets/js"):
        for file in (ROOT / directory).iterdir():
            if file.is_file():
                copy_file(file.relative_to(ROOT))
    for path in paths:
        copy_file(Path(path))
    print(f"Staged {len(PAGES)} pages and {len(paths)} browser datasets")


def check_output():
    if not (SITE / "index.html").is_file():
        raise ValueError("Jekyll did not render index.html")
    for page in PAGES:
        if not (SITE / f"{page.stem}.html").is_file() and page.stem != "index":
            raise ValueError(f"Jekyll did not render {page.stem}.html")
    for path in data_files():
        if not (SITE / path).is_file():
            raise ValueError(f"Browser dataset missing from build: {path}")
    forbidden = [p for p in SITE.rglob("*") if p.is_file() and p.suffix in {".ipynb", ".pkl", ".graphml"}]
    if forbidden:
        raise ValueError(f"Analysis artifacts leaked into site: {forbidden[:5]}")
    size = sum(p.stat().st_size for p in SITE.rglob("*") if p.is_file())
    print(f"Site validated: {size / 1024 / 1024:.1f} MiB")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-output", action="store_true")
    args = parser.parse_args()
    check_output() if args.check_output else prepare()
