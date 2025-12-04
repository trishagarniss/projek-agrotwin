# backend/reasoning/diagnose.py
from .loader import load_gejala, load_opt, load_rules, load_rekomendasi
from .cf_engine import combine_cf

class ReasoningEngine:
    """
    Engine that performs CF accumulation for OPT items.
    - gejala_list: list of {id, nama}
    - opt_dict: dict kode -> {nama, solusi}
    - rules_list: list of {id, gejala, opt, cf}
    - rekom_dict: dict opt -> [ {bahan_aktif, produk: [] }, ... ]
    """

    def __init__(self, gejala_list, opt_dict, rules_list, rekom_dict):
        self.gejala = gejala_list or []
        self.opt = opt_dict or {}
        self.rules = rules_list or []
        self.rekom = rekom_dict or {}

        # gejala_map: kode -> nama for convenience
        self.gejala_map = {g["id"]: g.get("nama", "") for g in self.gejala if "id" in g}

    def diagnose(self, user_inputs):
        """
        user_inputs: dict mapping kode_gejala -> confidence (0..1), or list of gejala codes (implying 1.0)
        Returns: list of diagnoses sorted desc by confidence:
          [{kode_opt, nama_opt, confidence (0..1), solusi, rekomendasi_produk}, ...]
        """
        # normalize
        inputs = {}
        if isinstance(user_inputs, dict):
            # try convert values to float in [0,1]
            for k, v in user_inputs.items():
                try:
                    val = float(v)
                    val = max(0.0, min(1.0, val))
                    inputs[k] = val
                except:
                    continue
                # if val < 0:
                #     val = 0.0
                # if val > 1:
                #     val = 1.0
                # inputs[k] = val
        elif isinstance(user_inputs, (list, tuple, set)):
            for k in user_inputs:
                inputs[k] = 1.0
        else:
            return []

        cf_opt = {}

        # Akumulasi CF
        for rule in self.rules:
            kode_gejala = rule.get("gejala")
            opt_code = rule.get("opt")

            if not kode_gejala or not opt_code:
                continue
            if kode_gejala not in inputs:
                continue

            try:
                user_cf = inputs[kode_gejala]
                rule_cf = float(rule.get("cf", 0.0)or 0.0)
                contribution = user_cf * rule_cf

                if opt_code not in cf_opt:
                    cf_opt[opt_code] = contribution
                else:
                    cf_opt[opt_code] = combine_cf(cf_opt[opt_code], contribution)
            except Exception as e:
                print(f"Error saat memproses aturan {rule.get('aturan_id')}: {e}")
                continue

            # rule_cf = float(rule.get("cf", 0.0) or 0.0)
            # contribution = user_cf * rule_cf
            # opt_code = rule.get("opt")
            # if not opt_code:
            #     continue
            # if opt_code not in cf_opt:
            #     cf_opt[opt_code] = contribution
            # else:
            #     cf_opt[opt_code] = combine_cf(cf_opt[opt_code], contribution)

        # 3. Format dan urutkan hasil
        results = []
        for opt_code, score in cf_opt.items():
            opt_info = self.opt.get(opt_code, {"nama": opt_code, "solusi": "Informasi OPT tidak ditemukan."})
            load_rekomendasi = self.rekom.get(opt_code,[])

            results.append({
                "kode_opt": opt_code,
                "nama_opt": opt_info.get("nama", opt_code),
                "confidence": round(score, 4),
                "solusi": opt_info.get("solusi", "Solusi tidak ditemukan"),
                "rekomendasi_produk": load_rekomendasi
            })

        results.sort(key=lambda x: x["confidence"], reverse=True)
        return results
