"""Extract a public roster from local spreadsheets; never copy the workbooks."""

import argparse
import json
import re
import unicodedata
from pathlib import Path

import openpyxl


EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def text(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def name(value):
    value = EMAIL.sub("", text(value))
    return text(re.sub(r"[<>]", "", value)).strip(" ,")


def key(value):
    value = "".join(c for c in unicodedata.normalize("NFKD", name(value).lower()) if not unicodedata.combining(c))
    value = value.replace("pretell", "petrell").replace("lesly", "leslie")
    return frozenset(re.findall(r"[a-z]+", value))


def safe_supervisor(value):
    value = name(value)
    if re.search(r"\d|seguro|p[oó]liza|\bART\b", value, re.I):
        return ""
    return value


def unit_name(value):
    value = text(value)
    normal = " ".join(sorted(key(value)))
    if "biomembranas" in normal:
        return "LABORATORIO DE BIOMEMBRANAS"
    if "reproduccion" in normal:
        return "LABORATORIO DE BIOLOGIA DE LA REPRODUCCION"
    if "neurofisiopatologia" in normal:
        return "LABORATORIO DE NEUROFISIOPATOLOGIA"
    if "fisiopatogenia" in normal or "fisopatogenia" in normal:
        return "LABORATORIO DE FISOPATOGENIA"
    if "renal" in normal:
        return "LABORATORIO DE FISIOLOGÍA RENAL"
    if value.lower() == "gns":
        return "GNS — unidad sin especificar"
    if value.lower() in {"secretaría", "gestion institucional", "gestión institucional"}:
        return "Gestión institucional"
    return value or "Sin unidad informada"


def extract(administrative, structured):
    records = []

    def add(source, sheet, row, person, category="", unit="", supervisor="", status="Sin confirmar", emails=()):
        person = name(person)
        if not person:
            return
        records.append({"source": source, "sheet": sheet, "row": row, "name": person,
                        "category": text(category), "unit": text(unit), "supervisor": safe_supervisor(supervisor),
                        "status": status, "emails": sorted({m.lower() for field in emails for m in EMAIL.findall(text(field))})})

    admin = openpyxl.load_workbook(administrative, data_only=True, read_only=True)
    for sheet in admin:
        for i, values in enumerate(sheet.values, 1):
            r = list(values) + [None] * 20
            if sheet.title == "Investigadores":
                add("Planilla septiembre", sheet.title, i, r[1], r[2], emails=[r[1]])
            elif sheet.title == "Becarios" and i > 1:
                # Dates embedded in the category are not insurance dates.
                add("Planilla septiembre", sheet.title, i, r[0], r[8], r[11], r[12], emails=[r[1], r[7]])
            elif sheet.title == "Tesistas y pasantes" and i > 1:
                add("Planilla septiembre", sheet.title, i, r[0], r[1], r[8], r[9], emails=[r[2]])
            elif sheet.title == "Personal de Apoyo" and i > 2:
                add("Planilla septiembre", sheet.title, i, r[0], r[1], r[8], r[9], emails=[r[2]])
            elif sheet.title == "ex-IFIBIO":
                add("Planilla septiembre", sheet.title, i, r[0], r[8], r[11], r[12], "Exintegrante", [r[0], r[1], r[7]])
    admin.close()

    book = openpyxl.load_workbook(structured, data_only=True, read_only=True)
    catalog = [text(r[0]) for i, r in enumerate(book["LABORATORIOS"].values, 1) if 3 <= i <= 17 and r[0]]
    for sheet_name in ["INVESTIGADORES", "BECARIOS", "CPA", "ADMINISTRATIVOS", "Laboratorio de Fisiopatogenia"]:
        for i, values in enumerate(book[sheet_name].values, 1):
            r = list(values) + [None] * 14
            if i == 1 or not (r[0] or r[1]):
                continue
            status = {"activo": "Actual", "inactivo": "Exintegrante", "exintegrante": "Exintegrante"}.get(text(r[7]).lower(), "Sin confirmar")
            unit = r[6] or ("Personal de Apoyo" if sheet_name == "CPA" else "Gestión institucional" if sheet_name == "ADMINISTRATIVOS" else "")
            add("Integrantes nuevo", sheet_name, i, f"{text(r[0])}, {text(r[1])}", r[4], unit, r[5], status)
    book.close()

    # Merge only exact token sets or a uniquely matching shortened name.
    # No fuzzy spelling matches and no identifier/contact fields are used.
    groups = {}
    for record in sorted(records, key=lambda r: len(key(r["name"])), reverse=True):
        tokens = key(record["name"])
        candidates = [k for k in groups if len(tokens & k) >= 2 and (tokens <= k or k <= tokens)]
        group_key = tokens if tokens in groups or len(candidates) != 1 else candidates[0]
        groups.setdefault(group_key, []).append(record)
    people = []
    for rows in groups.values():
        states = {r["status"] for r in rows} - {"Sin confirmar"}
        status = "En revisión" if len(states) > 1 else next(iter(states), "Sin confirmar")
        display = max(rows, key=lambda r: len(key(r["name"]))) ["name"]
        preferred = next((r for r in rows if r["source"] == "Integrantes nuevo" and r["unit"]), None)
        unit = unit_name(preferred["unit"] if preferred else next((r["unit"] for r in rows if r["unit"]), "Sin unidad informada"))
        people.append({"name": display, "unit": unit, "status": status,
                       "emails": sorted({mail for r in rows for mail in r["emails"]}), "records": rows})
    people.sort(key=lambda p: name(p["name"]).lower())
    return {"schema_version": 1, "source_period": "Septiembre de 2026", "catalog": catalog, "people": people,
            "notes": ["La pertenencia actual no se deduce del vencimiento de una beca ni de un seguro.",
                      "La unidad principal usa la tabla por categoría del archivo nuevo cuando está informada; las demás asignaciones se conservan como evidencia.",
                      "Se excluye la hoja Organigrama del archivo nuevo por sobrescritura de categorías y estados.",
                      "Las hojas por laboratorio duplicadas no se usan para definir estados. La hoja de Fisiopatogenia se conserva por aportar un estado explícito de baja.",
                      "Los nombres abreviados solo se reúnen cuando existe una coincidencia única de palabras; las diferencias de escritura requieren revisión."]}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("administrative", type=Path)
    parser.add_argument("structured", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    result = extract(args.administrative, args.structured)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Exported {len(result['people'])} people and {sum(len(p['records']) for p in result['people'])} source records")
