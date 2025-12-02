# backend/reasoning/diagnose.py
from .loader import load_gejala, load_opt, load_rules, load_rekomendasi
from .cf_engine import combine_cf

class ReasoningEngine:
    """
    This engine expects the server to pass loaded data (not paths).
    - gejala_list: list of {id, nama}
    - opt_dict: dict kode -> {nama, solusi}
    - rules_list: list of {gejala, opt, cf}
    - rekom_dict: dict opt -> [ {bahan_aktif, produk: [] }, ... ]
    """

    def __init__(self, gejala_list, opt_dict, rules_list, rekom_dict):
        # store as provided
        self.gejala = gejala_list
        self.opt = opt_dict
        self.rules = rules_list
        self.rekom = rekom_dict

        # create quick lookup for gejala names if needed
        self.gejala_map = {g["id"]: g["nama"] for g in gejala_list}

    def diagnose(self, user_inputs):
        """
        user_inputs: object mapping kode gejala -> user confidence (0..1)
        or list of gejala codes (we'll accept both).
        Returns: list of diagnosis sorted by confidence desc.
        """
        # normalize user_inputs into a dict: kode -> cf (0..1)
        inputs = {}
        if isinstance(user_inputs, dict):
            inputs = user_inputs
        elif isinstance(user_inputs, list):
            # if user only passed codes, assume 1.0 confidence each
            for k in user_inputs:
                inputs[k] = 1.0
        else:
            return []

        cf_opt = {}
        # iterate rules and accumulate contributions
        for rule in self.rules:
            kode_gejala = rule.get("gejala")
            if not kode_gejala:
                continue
            if kode_gejala not in inputs:
                continue
            user_cf = float(inputs[kode_gejala])
            rule_cf = float(rule.get("cf", 0.0))
            contribution = user_cf * rule_cf
            opt_code = rule.get("opt")
            if not opt_code:
                continue
            if opt_code not in cf_opt:
                cf_opt[opt_code] = contribution
            else:
                cf_opt[opt_code] = combine_cf(cf_opt[opt_code], contribution)

        # prepare results
        results = []
        for opt_code, score in cf_opt.items():
            opt_info = self.opt.get(opt_code, {"nama": opt_code, "solusi": ""})
            results.append({
                "kode_opt": opt_code,
                "nama_opt": opt_info.get("nama", opt_code),
                "confidence": round(score, 4),
                "solusi": opt_info.get("solusi", ""),
                "rekomendasi_produk": self.rekom.get(opt_code, [])
            })

        # sort by confidence desc
        results.sort(key=lambda x: x["confidence"], reverse=True)
        return results
