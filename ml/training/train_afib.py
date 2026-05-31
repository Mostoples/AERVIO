"""
AERVINEX — AFib classifier training (PhysioNet CinC 2017).

Dataset
-------
PhysioNet/CinC Challenge 2017 "AF Classification from a Short Single
Lead ECG Recording" — https://physionet.org/content/challenge-2017/1.0.0/
~8,500 ECG strips, 30s @ 300Hz, labels in {N, A, O, ~}.
For binary AFib detection we map A -> 1, everything else -> 0.

Features (15, from Faust et al. 2018 and DeepBeat paper)
--------
Time-domain HRV  : meanRR, sdnn, rmssd, sdsd, pnn50
Geometric        : sd1 (Poincare), sd2, sd1/sd2
Non-linear       : sampen, cosen, higuci, kurt, skew
Freq-domain      : lf, hf, lf/hf

Output
------
../models/afib.pkl                         scikit-style booster + metrics
../models/version.json (updated)           training timestamp + metrics
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd

# ── Constants ────────────────────────────────────────────────────────────
SEED = 42
FEATURE_ORDER = [
    "rmssd", "sdnn", "pnn50",          # time-domain
    "sd1", "sd2",                       # Poincaré
    "sampen", "cosen",                  # non-linear entropy
    "meanRR", "sdsd",                   # time-domain extras
    "lf", "hf", "lfHf",                 # freq-domain
    "higuci", "kurt", "skew",
]
THIS = Path(__file__).resolve().parent
MODELS_DIR = (THIS / ".." / "models").resolve()


def extract_features_from_rr(rr_ms: np.ndarray) -> dict:
    """Compute 15 HRV features from an RR-interval series (ms)."""
    rr = np.asarray(rr_ms, dtype=float)
    if rr.size < 8:
        return {k: 0.0 for k in FEATURE_ORDER}

    diff = np.diff(rr)
    rmssd = float(np.sqrt(np.mean(diff ** 2)))
    sdnn = float(np.std(rr, ddof=1))
    sdsd = float(np.std(diff, ddof=1))
    pnn50 = float(np.mean(np.abs(diff) > 50) * 100)
    meanrr = float(np.mean(rr))

    # Poincaré
    sd1 = float(np.sqrt(0.5) * np.std(diff, ddof=1))
    sd2 = float(np.sqrt(2 * sdnn ** 2 - 0.5 * sdsd ** 2)) if sdnn > 0 else 0.0

    # Approximate frequency-domain via Lomb-Scargle would be ideal; for the
    # scaffold we approximate with normalized power split at 0.15Hz proxy.
    rr_s = rr / 1000.0  # convert to seconds
    if rr_s.size >= 16:
        power = np.abs(np.fft.rfft(rr_s - rr_s.mean())) ** 2
        freqs = np.fft.rfftfreq(rr_s.size, d=rr_s.mean() if rr_s.mean() > 0 else 1.0)
        lf = float(power[(freqs >= 0.04) & (freqs < 0.15)].sum())
        hf = float(power[(freqs >= 0.15) & (freqs < 0.40)].sum())
    else:
        lf, hf = 0.0, 0.0
    lf_hf = lf / hf if hf > 1e-6 else 0.0

    # Entropy proxies (real impl uses neurokit2.entropy_sample / cosen).
    sampen = float(_sample_entropy(rr, m=2, r=0.2 * sdnn) if sdnn > 0 else 0.0)
    cosen = sampen - np.log(2 * 0.2 * sdnn / meanrr) if (sdnn > 0 and meanrr > 0) else 0.0

    # Higuchi fractal dimension proxy + kurt/skew.
    higuci = float(_higuchi_fd(rr, k_max=6))
    kurt = float(pd.Series(rr).kurtosis())
    skew = float(pd.Series(rr).skew())

    return {
        "rmssd": rmssd, "sdnn": sdnn, "pnn50": pnn50,
        "sd1": sd1, "sd2": sd2,
        "sampen": sampen, "cosen": float(cosen),
        "meanRR": meanrr, "sdsd": sdsd,
        "lf": lf, "hf": hf, "lfHf": lf_hf,
        "higuci": higuci, "kurt": kurt, "skew": skew,
    }


def _sample_entropy(x: np.ndarray, m: int = 2, r: float = 0.0) -> float:
    """Sample entropy (Richman & Moorman 2000). O(n^2); only for small n."""
    n = len(x)
    if n <= m + 1 or r <= 0:
        return 0.0

    def _phi(mm: int) -> int:
        pats = np.array([x[i : i + mm] for i in range(n - mm)])
        c = 0
        for i in range(len(pats)):
            for j in range(i + 1, len(pats)):
                if np.max(np.abs(pats[i] - pats[j])) <= r:
                    c += 1
        return c

    b = _phi(m)
    a = _phi(m + 1)
    return float(-np.log(a / b)) if b > 0 and a > 0 else 0.0


def _higuchi_fd(x: np.ndarray, k_max: int = 6) -> float:
    """Higuchi fractal dimension."""
    n = len(x)
    lk = []
    xk = np.arange(1, k_max + 1)
    for k in xk:
        lm = []
        for m in range(k):
            ln = 0.0
            idxs = np.arange(1, int((n - m) / k))
            for i in idxs:
                ln += abs(x[m + i * k] - x[m + (i - 1) * k])
            norm = (n - 1) / (len(idxs) * k) if len(idxs) > 0 else 1.0
            lm.append((ln * norm) / k)
        lk.append(np.log(np.mean(lm) + 1e-12))
    xk = np.log(1.0 / xk)
    slope, _ = np.polyfit(xk, lk, 1)
    return float(slope)


def load_cinc2017(data_dir: Path) -> pd.DataFrame:
    """Walk CinC 2017 WFDB records → DataFrame[features + label].
    Requires `wfdb` and a downloaded CinC 2017 directory containing
    REFERENCE.csv and *.hea / *.mat files.
    """
    try:
        import wfdb  # noqa: F401  (imported for side-effect / version check)
    except ImportError as e:
        print(f"[train_afib] wfdb not installed: {e}\n"
              "  pip install wfdb")
        return pd.DataFrame()

    ref_path = data_dir / "REFERENCE.csv"
    if not ref_path.exists():
        print(f"[train_afib] REFERENCE.csv missing in {data_dir}.\n"
              "  Download CinC 2017 from "
              "https://physionet.org/content/challenge-2017/1.0.0/")
        return pd.DataFrame()

    ref = pd.read_csv(ref_path, header=None, names=["record", "label"])
    rows = []
    for _, row in ref.iterrows():
        rec_path = data_dir / row["record"]
        try:
            from wfdb import rdrecord
            from wfdb.processing import gqrs_detect
            rec = rdrecord(str(rec_path))
            sig = rec.p_signal[:, 0]
            fs = rec.fs
            qrs = gqrs_detect(sig=sig, fs=fs)
            rr_ms = np.diff(qrs) * 1000.0 / fs
            feats = extract_features_from_rr(rr_ms)
            feats["label"] = 1 if row["label"] == "A" else 0
            rows.append(feats)
        except Exception as e:
            print(f"[train_afib] skip {row['record']}: {e}")
    return pd.DataFrame(rows)


def make_synthetic(n: int = 2000) -> pd.DataFrame:
    """Synthetic AFib-vs-NSR HRV cohort for scaffold testing."""
    rng = np.random.default_rng(SEED)
    n_pos = n // 4
    n_neg = n - n_pos

    def _sample(is_afib: bool) -> dict:
        if is_afib:
            rr = rng.normal(750, 150, size=120)  # high variance
            rr += rng.normal(0, 80, size=120)
        else:
            rr = rng.normal(900, 35, size=120)   # low variance
        rr = np.clip(rr, 300, 1500)
        feats = extract_features_from_rr(rr)
        feats["label"] = 1 if is_afib else 0
        return feats

    return pd.DataFrame(
        [_sample(True) for _ in range(n_pos)] +
        [_sample(False) for _ in range(n_neg)]
    )


def train(df: pd.DataFrame):
    from sklearn.metrics import (roc_auc_score, f1_score,
                                 precision_score, recall_score)
    from sklearn.model_selection import train_test_split
    import xgboost as xgb

    y = df["label"].astype(int).values
    X = df[FEATURE_ORDER].astype(float).values

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.30, stratify=y, random_state=SEED)
    X_val, X_te, y_val, y_te = train_test_split(
        X_te, y_te, test_size=0.50, stratify=y_te, random_state=SEED)

    clf = xgb.XGBClassifier(
        n_estimators=80, max_depth=4, learning_rate=0.08,
        objective="binary:logistic", random_state=SEED,
        eval_metric="auc", n_jobs=-1, tree_method="hist",
    )
    clf.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=False)

    prob = clf.predict_proba(X_te)[:, 1]
    pred = (prob >= 0.5).astype(int)
    metrics = {
        "auc":       float(roc_auc_score(y_te, prob)),
        "f1":        float(f1_score(y_te, pred)),
        "precision": float(precision_score(y_te, pred, zero_division=0)),
        "recall":    float(recall_score(y_te, pred, zero_division=0)),
        "n_train":   int(len(y_tr)),
        "n_val":     int(len(y_val)),
        "n_test":    int(len(y_te)),
    }
    return clf, metrics


def _dataset_hash(df: pd.DataFrame) -> str:
    return hashlib.sha256(pd.util.hash_pandas_object(df, index=True).values.tobytes()
                          ).hexdigest()[:16]


def main():
    data_dir = Path(os.environ.get("AERVINEX_AFIB_DIR", "")).expanduser()
    use_real = data_dir.exists() and (data_dir / "REFERENCE.csv").exists()
    if use_real:
        print(f"[train_afib] loading CinC 2017 from {data_dir}")
        df = load_cinc2017(data_dir)
        if df.empty:
            print("[train_afib] real dataset empty, falling back to synthetic.")
            df = make_synthetic()
    else:
        print("[train_afib] AERVINEX_AFIB_DIR unset or missing — synthetic.")
        df = make_synthetic()

    clf, metrics = train(df)
    print("[train_afib] metrics:", json.dumps(metrics, indent=2))

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    import pickle
    with open(MODELS_DIR / "afib.pkl", "wb") as f:
        pickle.dump({"model": clf, "features": FEATURE_ORDER}, f)

    # Update version.json
    version_path = MODELS_DIR / "version.json"
    versions = {}
    if version_path.exists():
        try:
            versions = json.loads(version_path.read_text())
        except json.JSONDecodeError:
            versions = {}
    versions["afib"] = {
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "dataset": "CinC2017" if use_real else "synthetic",
        "dataset_hash": _dataset_hash(df),
        "n_samples": int(len(df)),
        "metrics": metrics,
        "features": FEATURE_ORDER,
        "framework": "xgboost",
    }
    version_path.write_text(json.dumps(versions, indent=2))
    print(f"[train_afib] wrote {MODELS_DIR / 'afib.pkl'}")
    print(f"[train_afib] updated {version_path}")


if __name__ == "__main__":
    sys.exit(main() or 0)
