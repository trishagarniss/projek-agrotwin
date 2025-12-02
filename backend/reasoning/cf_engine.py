# backend/reasoning/cf_engine.py

def combine_cf(cf_old, cf_new):
    """
    Combine two certainty factors (both in 0..1).
    Formula: cf_combined = cf_old + cf_new * (1 - cf_old)
    """
    try:
        cf_old = float(cf_old)
    except:
        cf_old = 0.0
    try:
        cf_new = float(cf_new)
    except:
        cf_new = 0.0
    return cf_old + cf_new * (1 - cf_old)
