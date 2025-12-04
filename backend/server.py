# backend/server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from reasoning.loader import load_gejala, load_opt, load_rules, load_rekomendasi
from reasoning.diagnose import ReasoningEngine
import os

BASE_DATA = os.path.join(os.path.dirname(__file__), "data")

GEJALA_FILE = os.path.join(BASE_DATA, "gejala.csv")
OPT_FILE = os.path.join(BASE_DATA, "opt.csv")
ATURAN_FILE = os.path.join(BASE_DATA, "aturan.csv")
REKOM_FILE = os.path.join(BASE_DATA, "rekomendasi_produk.csv")

app = FastAPI(title="AI Reasoning Pertanian Tomat", version="1.0")

# CORS: allow local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data at startup
gejala_list = load_gejala(GEJALA_FILE)
opt_dict = load_opt(OPT_FILE)
rules_list = load_rules(ATURAN_FILE)
rekom_dict = load_rekomendasi(REKOM_FILE)

# create engine (pass loaded data)
engine = ReasoningEngine(gejala_list, opt_dict, rules_list, rekom_dict)

# Pydantic model for POST body
class DiagnoseRequest(BaseModel):
    # accept either list of codes or dict mapping code->confidence
    gejala: list | dict

@app.get("/")
def read_root():
    return {"message": "Backend AI Agrotwin berjalan!"}

@app.get("/gejala")
def get_gejala():
    # return list of gejala for frontend
    return gejala_list

@app.get("/opt/{kode}")
def get_opt(kode: str):
    if kode in opt_dict:
        return opt_dict[kode]
    return {"error": "not found"}

@app.get("/rekomendasi/{kode_opt}")
def get_rekomendasi(kode_opt: str):
    return rekom_dict.get(kode_opt, [])

@app.post("/diagnose")
def post_diagnose(body: DiagnoseRequest):
    # body.gejala can be list or dict
    result = engine.diagnose(body.gejala)
    return result
