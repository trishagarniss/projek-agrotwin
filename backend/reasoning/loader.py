# backend/reasoning/loader.py
import csv
from collections import OrderedDict

def _detect_delimiter_and_header(path, sample_lines=5):
    """
    Simple heuristic: check whether file uses ';' or ',' based on first few lines.
    Also detect whether first non-empty line looks like a header (contains non-numeric names).
    """
    with open(path, encoding="utf-8-sig") as f:
        lines = [ln for ln in (next(f, "") for _ in range(sample_lines)) if ln]
    content = "".join(lines)
    # prefer semicolon if present in sample
    delim = ";" if ";" in content and content.count(";") >= content.count(",") else ","
    # header detection: if first line contains non-numeric tokens or "id" / "nama"
    first = lines[0].strip() if lines else ""
    has_header = False
    if first:
        tokens = first.split(delim)
        # if token names contain letters (not all numbers) assume header
        if any(not t.strip().replace(".", "").isdigit() for t in tokens):
            has_header = True
    return delim, has_header


def load_gejala(path):
    delim, has_header = _detect_delimiter_and_header(path)
    gejala_list = []
    with open(path, encoding="utf-8-sig") as f:
        if has_header and delim == ",":
            reader = csv.DictReader(f)
            for row in reader:
                gid = (row.get("id") or row.get("kode") or row.get("Column1") or "").strip()
                nama = (row.get("nama") or row.get("description") or row.get("Column2") or "").strip()
                if gid:
                    gejala_list.append({"id": gid, "nama": nama})
        else:
            # semicolon or no-header case: parse manually
            reader = csv.reader(f, delimiter=delim)
            for row in reader:
                if not row:
                    continue
                # expect at least 2 columns: kode, deskripsi
                if len(row) >= 2:
                    gid = row[0].strip()
                    nama = row[1].strip()
                elif len(row) == 1:
                    gid = f"G{len(gejala_list)+1:02d}"
                    nama = row[0].strip()
                else:
                    continue
                gejala_list.append({"id": gid, "nama": nama})
    return gejala_list


def load_opt(path):
    delim, has_header = _detect_delimiter_and_header(path)
    opt = {}
    with open(path, encoding="utf-8-sig") as f:
        if has_header and delim == ",":
            reader = csv.DictReader(f)
            for row in reader:
                kode = (row.get("id") or row.get("kode") or row.get("Column1") or "").strip()
                nama = (row.get("nama") or row.get("Column2") or "").strip()
                solusi = (row.get("solusi") or row.get("Column3") or "").strip()
                if kode:
                    opt[kode] = {"nama": nama, "solusi": solusi}
        else:
            reader = csv.reader(f, delimiter=delim)
            for row in reader:
                if not row:
                    continue
                kode = row[0].strip() if len(row) > 0 else ""
                nama = row[1].strip() if len(row) > 1 else ""
                solusi = row[2].strip() if len(row) > 2 else ""
                if kode:
                    opt[kode] = {"nama": nama, "solusi": solusi}
    return opt


def load_rules(path):
    delim, has_header = _detect_delimiter_and_header(path)
    rules = []
    with open(path, encoding="utf-8-sig") as f:
        reader = csv.reader(f, delimiter=delim)
        for row in reader:
            if not row:
                continue
            # try to skip header lines heuristically
            if len(row) >= 4:
                id_field = row[0].strip()
                gejala = row[1].strip()
                opt = row[2].strip()
                cf_raw = row[3].strip()
            elif len(row) == 3:
                # maybe no ID column
                id_field = ""
                gejala = row[0].strip()
                opt = row[1].strip()
                cf_raw = row[2].strip()
            else:
                continue
            try:
                cf_val = float(cf_raw)
            except ValueError:
                cf_val = 0.0
            # skip header-like lines where cf couldn't be parsed and gejala looks like 'gejala' text
            if (gejala.lower().startswith("gejala") or opt.lower().startswith("opt")) and cf_val == 0.0:
                continue
            rules.append({
                "id": id_field,
                "gejala": gejala,
                "opt": opt,
                "cf": cf_val
            })
    return rules


def load_rekomendasi(path):
    delim, has_header = _detect_delimiter_and_header(path)
    rekom = {}
    with open(path, encoding="utf-8-sig") as f:
        # try DictReader first if header-like
        if has_header and delim == ",":
            reader = csv.DictReader(f)
            for row in reader:
                kode = (row.get("kode_opt") or row.get("Column1") or row.get("kode") or "").strip()
                bahan = (row.get("bahan_aktif") or row.get("Column2") or "").strip()
                produk_raw = (row.get("produk") or row.get("Column3") or "").strip()
                produk_list = [p.strip() for p in produk_raw.split(",")] if produk_raw else []
                if not kode:
                    continue
                rekom.setdefault(kode, []).append({"bahan_aktif": bahan, "produk": produk_list})
        else:
            reader = csv.reader(f, delimiter=delim)
            for row in reader:
                if not row:
                    continue
                kode = row[0].strip() if len(row) > 0 else ""
                bahan = row[1].strip() if len(row) > 1 else ""
                produk_raw = row[2].strip() if len(row) > 2 else ""
                produk_list = [p.strip() for p in produk_raw.split(",")] if produk_raw else []
                if not kode:
                    continue
                rekom.setdefault(kode, []).append({"bahan_aktif": bahan, "produk": produk_list})
    return rekom
