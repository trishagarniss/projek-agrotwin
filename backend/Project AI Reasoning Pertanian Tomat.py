import os

class hama_dan_penyakit :
    def __init__ (self,nama,solusi) :
        self.nama = nama
        self.solusi = solusi

class aturan :
    def __init__ (self,gejala,opt,cf) :
        self.gejala = gejala
        self.opt = opt
        self.cf = cf

ham = {}
file = open("OPT Tomat.csv","r")
for i in file.readlines() :
    kode,nama,solusi = i.strip().split(";")
    hdp = hama_dan_penyakit(nama,solusi)
    ham[kode] = hdp
file.close()

gej = {}
file = open("Gejala Tomat.csv","r",encoding='utf-8-sig')
count = 1
for i in file.readlines() :
    kode,deskripsi = i.strip().split(";")
    gej[kode] = deskripsi
file.close()

atu = {}
file = open("Aturan Tomat V2.csv","r",encoding='utf-8-sig')
for i in file.readlines() :
    kode,gejala,opt,cf = i.strip().split(";")
    try :
        cf = float(cf)
    except ValueError :
        print(f"{cf} Tidak Bisa Float")
    rules = aturan(gejala,opt,cf)
    atu[kode] = rules
file.close()

jawaban = {}

while True :
    try :
        jawab = float(input("Masukan PH Tanah : "))
        persen = float(input("Seberapa Yakin Anda Dengan Jawaban Anda? (Input Dalam Persentase)\n>> "))
        if jawab < 5.5 :
            jawaban["P08"] = 0.6 * persen/100
            jawaban["P14"] = 0.9 * persen/100
        if jawab > 7 :
            jawaban["P07"] = 0.4 * persen/100
        break
    except ValueError :
        print("Jawaban Tidak Boleh Karakter Selain Angka, Jika Desimal Gunakan Titik (.)")

while True :
    try :
        jawab = float(input("Masukan Kelembapan Udara (Input Dalam Persentase) : "))
        persen = float(input("Seberapa Yakin Anda Dengan Jawaban Anda? (Input Dalam Persentase)\n>> "))
        if jawab > 85 :
            jawaban["P05"] = 0.8 * persen/100
            jawaban["P06"] = 0.7 * persen/100
        break
    except ValueError :
        print("Jawaban Tidak Boleh Karakter Selain Angka, Jika Desimal Gunakan Titik (.)")

while True :
    try :
        jawab = float(input("Masukan Suhu Udara (Input Dalam Celcius) : "))
        persen = float(input("Seberapa Yakin Anda Dengan Jawaban Anda? (Input Dalam Persentase)\n>> "))
        if jawab < 20 :
            for k in jawaban :
                if k == "P05" :
                    jawaban[k] += ((1 - jawaban[k]) * 0,6 * (persen / 100))
                    break
            else :
                jawaban["P05"] = 0.6 * persen/100
        if jawab > 30 :
            for k in jawaban :
                if k == "P07" :
                    jawaban[k] += ((1 - jawaban[k]) * 0,5 * (persen / 100))
                    break
            else :
                jawaban["P07"] = 0.5 * persen/100
            for k in jawaban :
                if k == "P08" :
                    jawaban[k] += ((1 - jawaban[k]) * 0,5 * (persen / 100))
                    break
            else :
                jawaban["P08"] = 0.5 * persen/100
        break
    except ValueError :
        print("Jawaban Tidak Boleh Karakter Selain Angka, Jika Desimal Gunakan Titik (.)")

while True :
    try :
        jawab = float(input("Masukan Kelembapan Tanah (Input Dalam Persentase) : "))
        persen = float(input("Seberapa Yakin Anda Dengan Jawaban Anda? (Input Dalam Persentase)\n>> "))
        if jawab < 40 :
            for k in jawaban :
                if k == "P14" :
                    jawaban[k] += ((1 - jawaban[k]) * 0,7 * (persen / 100))
                    break
            else :
                jawaban["P14"] = 0.7 * persen/100
        if jawab > 90 :
            jawaban["P01"] = 0.7 * persen/100
            jawaban["P09"] = 0.6 * persen/100
        break
    except ValueError :
        print("Jawaban Tidak Boleh Karakter Selain Angka, Jika Desimal Gunakan Titik (.)")

count = 1
for i in gej :
    if count <= 7 :
        count += 1
        continue
    while True :
        jawab = input(f"Apakah {gej[i]}? [Y/N] : ").lower()
        match jawab :
            case "y" | "n" :
                break
            case _ :
                print("Jawaban Hanya Boleh [Y/N]")
    if jawab == "y" :
        while True :
            try :
                persen = float(input("Seberapa Yakin Anda Dengan Jawaban Anda? (Input Dalam Persentase)\n>> "))
                break
            except ValueError :
                print("Jawaban Tidak Boleh Karakter Selain Angka, Jika Desimal Gunakan Titik (.)")
        for j in atu :
            if atu[j].gejala == i :
                for k in jawaban :
                    if k == atu[j].opt :
                        jawaban[k] += ((1 - jawaban[k]) * atu[j].cf * (persen / 100))
                        break
                else :
                    jawaban[atu[j].opt] = atu[j].cf * (persen / 100)
os.system("cls")
print("-"*50)
print("Kesimpulan".center(50))
print("-"*50)
for i in jawaban :
    print(f"Hama / Penyakit\t\t: {ham[i].nama}")
    print(f"Tingkat Kepercayaan\t: {(jawaban[i]*100):.2f}%")
    print(f"Solusi\t\t\t: {ham[i].solusi}")
    print("-"*50)

print("Tes")