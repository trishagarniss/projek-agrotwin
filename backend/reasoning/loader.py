# backend/reasoning/loader.py
import csv

def load_gejala(path):
    # expects CSV with header: id,nama  (comma-separated)
    gejala_list = []
    with open(path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            gejala_list.append({
                "id": row.get("id") or row.get("Column1"),
                "nama": row.get("nama") or row.get("Column2")
            })
    return gejala_list

def load_opt(path):
    # expects semicolon-separated lines: KODE;NAMA;SOLUSI
    opt = {}
    with open(path, encoding="utf-8-sig") as f:
        reader = csv.reader(f, delimiter=";")
        for row in reader:
            if not row:
                continue
            # protect if row length differs
            kode = row[0].strip()
            nama = row[1].strip() if len(row) > 1 else ""
            solusi = row[2].strip() if len(row) > 2 else ""
            opt[kode] = {"nama": nama, "solusi": solusi}
    return opt

def load_rules(path):
    # expects semicolon-separated: ID;GEJALA;OPT;CF
    rules = []
    with open(path, encoding="utf-8-sig") as f:
        reader = csv.reader(f, delimiter=";")
        for row in reader:
            if not row:
                continue
            if len(row) < 4:
                continue
            _, gejala, opt, cf = row[0].strip(), row[1].strip(), row[2].strip(), row[3].strip()
            try:
                cf_val = float(cf)
            except:
                cf_val = 0.0
            rules.append({
                "gejala": gejala,
                "opt": opt,
                "cf": cf_val
            })
    return rules

def load_rekomendasi(path):
    # expects CSV with header Column1,Column2,Column3
    # Column1 = kode_opt, Column2 = bahan aktif, Column3 = "produk1, produk2, ..."
    rekom = {}
    with open(path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            kode = (row.get("Column1") or row.get("kode_opt") or "").strip()
            bahan = (row.get("Column2") or row.get("bahan_aktif") or "").strip()
            produk_raw = (row.get("Column3") or row.get("produk") or "").strip()
            produk_list = [p.strip() for p in produk_raw.split(",")] if produk_raw else []
            if not kode:
                continue
            if kode not in rekom:
                rekom[kode] = []
            rekom[kode].append({
                "bahan_aktif": bahan,
                "produk": produk_list
            })
    return rekom
