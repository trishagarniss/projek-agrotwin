# backend/reasoning/cf_engine.py

def combine_cf(cf_old, cf_new):
    """
    Combine two certainty factors (both in 0..1).
    Formula used: cf_combined = cf_old + cf_new * (1 - cf_old)
    Both inputs may be numeric or convertible-to-float. Non-numeric -> treated as 0.0.
    """
    try:
        cf_old = float(cf_old)
    except ValueError:
        cf_old = 0.0
    try:
        cf_new = float(cf_new)
    except ValueError:
        cf_new = 0.0

    # clamp to [0,1] defensively
    if cf_old < 0.0:
        cf_old = 0.0
    if cf_old > 1.0:
        cf_old = 1.0
    if cf_new < 0.0:
        cf_new = 0.0
    if cf_new > 1.0:
        cf_new = 1.0

    return cf_old + cf_new * (1 - cf_old)
