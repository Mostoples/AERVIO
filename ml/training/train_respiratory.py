"""
AERVINEX — Respiratory event detector (DETECT-style).

Background
----------
Quer et al. 2021 "Wearable sensor data and self-reported symptoms for
COVID-19 detection" (Nature Medicine, DOI 10.1038/s41591-020-1123-x)
used DETECT cohort wearable signals — resting HR, sleep, steps —
combined with self-reported symptoms to flag respiratory infection.

Features (5)
------------
delta_rhr           7-day rolling RHR minus 30-day baseline (bpm)
sleep_deviation_min last-night sleep duration deviation (min)
steps_drop_pct      7-day step count drop vs baseline (%)
spo2_drop           SpO2 drop vs personal baseline (%)
cough_count_24h     self-reported cough events last 24h

Data source
-----------
- DETECT cohort:  not publicly redistributable. Access via
  https://detectstudy.org/ (Scripps).
- For scaffold testing we generate synthetic-symptomatic data.

Output
------
../models/respiratory.pkl + metrics in version.json
"""
from __future__ import annotations

import json
import pickle
import sys
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd

SEED = 42
FEATURE_ORDER = ["delta_rhr", "sleep_deviation_min", "steps_drop_pct",
                 "spo2_drop", "cough_count_24h"]
THIS = Path(__file__).resolve().parent
MODELS_DIR = (THIS / ".." / "models").resolve()


def make_synthetic(n: int = 3000) -> pd.DataFrame:
    rng = np.random.default_rng(SEED)
    n_pos = n // 3
    n_neg = n - n_pos
    rows = []
    for _ in range(n_pos):  # symptomatic
        rows.append({
            "delta_rhr": rng.normal(8, 3),
            "sleep_deviation_min": rng.normal(-45, 25),
            "steps_drop_pct": rng.uniform(20, 70),
            "spo2_drop": rng.uniform(1.5, 4.0),
            "cough_count_24h": rng.poisson(6),
            "label": 1,
        })
    for _ in range(n_neg):  # healthy
        rows.append({
            "delta_rhr": rng.normal(0.5, 2),
            "sleep_deviation_min": rng.normal(0, 20),
            "steps_drop_pct": rng.uniform(-10, 10),
            "spo2_drop": rng.uniform(-0.5, 1.0),
            "cough_count_24h": rng.poisson(0.2),
            "label": 0,
        })
    return pd.DataFrame(rows)


def train(df: pd.DataFrame):
    from sklearn.metrics import (roc_auc_score, f1_score,
                                 precision_score, recall_score)
    from sklearn.model_selection import train_test_split
    import lightgbm as lgb

    y = df["label"].astype(int).values
    X = df[FEATURE_ORDER].astype(float).values
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.30, stratify=y, random_state=SEED)

    clf = lgb.LGBMClassifier(
        n_estimators=120, max_depth=5, learning_rate=0.06,
        num_leaves=24, random_state=SEED, n_jobs=-1, verbose=-1,
    )
    clf.fit(X_tr, y_tr)

    prob = clf.predict_proba(X_te)[:, 1]
    pred = (prob >= 0.5).astype(int)
    metrics = {
        "auc":       float(roc_auc_score(y_te, prob)),
        "f1":        float(f1_score(y_te, pred)),
        "precision": float(precision_score(y_te, pred, zero_division=0)),
        "recall":    float(recall_score(y_te, pred, zero_division=0)),
        "n_train":   int(len(y_tr)),
        "n_test":    int(len(y_te)),
    }
    return clf, metrics


def main():
    print("[train_respiratory] using synthetic data — replace with DETECT cohort.")
    df = make_synthetic()
    clf, metrics = train(df)
    print("[train_respiratory] metrics:", json.dumps(metrics, indent=2))

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with open(MODELS_DIR / "respiratory.pkl", "wb") as f:
        pickle.dump({"model": clf, "features": FEATURE_ORDER}, f)

    version_path = MODELS_DIR / "version.json"
    versions = {}
    if version_path.exists():
        try: versions = json.loads(version_path.read_text())
        except json.JSONDecodeError: versions = {}
    versions["respiratory"] = {
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "dataset": "synthetic-DETECT-like",
        "n_samples": int(len(df)),
        "metrics": metrics,
        "features": FEATURE_ORDER,
        "framework": "lightgbm",
    }
    version_path.write_text(json.dumps(versions, indent=2))
    print(f"[train_respiratory] wrote {MODELS_DIR / 'respiratory.pkl'}")


if __name__ == "__main__":
    sys.exit(main() or 0)
