# run_cli.py
import os
from reasoning.loader import load_gejala, load_opt, load_rules, load_rekomendasi
from reasoning.diagnose import ReasoningEngine

BASE_DIR = os.path.join(os.path.dirname(__file__), "data")

GEJALA_CSV = os.path.join(BASE_DIR, "gejala.csv")
OPT_CSV = os.path.join(BASE_DIR, "opt.csv")
RULES_CSV = os.path.join(BASE_DIR, "aturan.csv")
REKOM_CSV = os.path.join(BASE_DIR, "rekomendasi_produk.csv")

def ask_float(prompt):
    while True:
        try:
            v = float(input(prompt))
            return v
        except ValueError:
            print("Jawaban Tidak Boleh Karakter Selain Angka, Jika Desimal Gunakan Titik (.)")

def ask_percent(prompt):
    while True:
        try:
            p = float(input(prompt))
            # accept percent like 0..100, convert to fraction
            if p < 0:
                p = 0.0
            if p > 100:
                p = 100.0
            return p / 100.0
        except ValueError:
            print("Masukan persen sebagai angka (0-100).")

def main():
    gej = load_gejala(GEJALA_CSV)
    opt = load_opt(OPT_CSV)
    rules = load_rules(RULES_CSV)
    rekom = {}
    try:
        rekom = load_rekomendasi(REKOM_CSV)
    except FileNotFoundError:
        pass
    jawaban = {}
    # PH
    jawab = ask_float("Masukan PH Tanah : ")
    persen = ask_percent("Seberapa Yakin Anda Dengan Jawaban Anda? (Input Dalam Persentase)\n>> ")
    if jawab < 5.5:
        jawaban["P08"] = 0.6 * persen
        jawaban["P14"] = 0.9 * persen
    if jawab > 7:
        jawaban["P07"] = 0.4 * persen
    # Kelembapan udara
    jawab = ask_float("Masukan Kelembapan Udara (Input Dalam Persentase) : ")
    persen = ask_percent("Seberapa Yakin Anda Dengan Jawaban Anda? (Input Dalam Persentase)\n>> ")
    if jawab > 85:
        jawaban["P05"] = 0.8 * persen
        jawaban["P06"] = 0.7 * persen
    # Suhu
    jawab = ask_float("Masukan Suhu Udara (Input Dalam Celcius) : ")
    persen = ask_percent("Seberapa Yakin Anda Dengan Jawaban Anda? (Input Dalam Persentase)\n>> ")
    if jawab < 20:
        if "P05" in jawaban:
            jawaban["P05"] += ((1 - jawaban["P05"]) * 0.6 * persen)
        else:
            jawaban["P05"] = 0.6 * persen
    if jawab > 30:
        if "P07" in jawaban:
            jawaban["P07"] += ((1 - jawaban["P07"]) * 0.5 * persen)
        else:
            jawaban["P07"] = 0.5 * persen
        if "P08" in jawaban:
            jawaban["P08"] += ((1 - jawaban["P08"]) * 0.5 * persen)
        else:
            jawaban["P08"] = 0.5 * persen
    # Kelembapan tanah
    jawab = ask_float("Masukan Kelembapan Tanah (Input Dalam Persentase) : ")
    persen = ask_percent("Seberapa Yakin Anda Dengan Jawaban Anda? (Input Dalam Persentase)\n>> ")
    if jawab < 40:
        if "P14" in jawaban:
            jawaban["P14"] += ((1 - jawaban["P14"]) * 0.7 * persen)
        else:
            jawaban["P14"] = 0.7 * persen
    if jawab > 90:
        jawaban["P01"] = 0.7 * persen
        jawaban["P09"] = 0.6 * persen
    # tanya gejala (meniru skema: skip 7 pertama)
    count = 1
    for g in gej:
        gid = g["id"]
        gnama = g["nama"]
        if count <= 7:
            count += 1
            continue
        while True:
            ans = input(f"Apakah {gnama}? [Y/N] : ").strip().lower()
            if ans in ("y", "n"):
                break
            print("Jawaban Hanya Boleh [Y/N]")
        if ans == "y":
            persen = ask_percent("Seberapa Yakin Anda Dengan Jawaban Anda? (Input Dalam Persentase)\n>> ")
            # cari semua rules yang punya gejala ini
            for r in rules:
                if r.get("gejala") == gid:
                    opt_code = r.get("opt")
                    if not opt_code:
                        continue
                    contribution = r.get("cf", 0.0) * persen
                    if opt_code in jawaban:
                        # combine like original logic (using same formula)
                        old = jawaban[opt_code]
                        jawaban[opt_code] = old + contribution * (1 - old)
                    else:
                        jawaban[opt_code] = contribution

    # tampilkan hasil
    os.system("cls" if os.name == "nt" else "clear")
    print("-" * 50)
    print("Kesimpulan".center(50))
    print("-" * 50)
    # order by confidence desc
    for kode, conf in sorted(jawaban.items(), key=lambda x: x[1], reverse=True):
        info = opt.get(kode, {"nama": kode, "solusi": ""})
        print(f"Hama / Penyakit\t\t: {info.get('nama')}")
        print(f"Tingkat Kepercayaan\t: {(conf * 100):.2f}%")
        print(f"Solusi\t\t\t: {info.get('solusi')}")
        print("-" * 50)

if __name__ == "__main__":
    main()
