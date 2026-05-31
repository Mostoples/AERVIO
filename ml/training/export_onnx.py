"""
AERVINEX — XGBoost / LightGBM → ONNX exporter.

Usage:
    python export_onnx.py afib            # exports ../models/afib.pkl  → public/models/afib.onnx
    python export_onnx.py respiratory     # same for LightGBM model

Validation:
    For each model we load 32 random feature vectors, run both
    sklearn .predict_proba and the freshly-exported ONNX session, and
    assert |Δprob| < 1e-3. Throws AssertionError on mismatch.

Size budget:
    Each .onnx must be ≤ 500 KB. Otherwise we warn and suggest
    `max_depth` / `n_estimators` reduction.
"""
from __future__ import annotations

import argparse
import pickle
import sys
from pathlib import Path

import numpy as np

THIS = Path(__file__).resolve().parent
MODELS_DIR = (THIS / ".." / "models").resolve()
WEB_MODELS_DIR = (THIS / ".." / ".." / "public" / "models").resolve()
SIZE_BUDGET_KB = 500


def _to_onnx_xgboost(clf, n_features: int):
    """Convert XGBClassifier → onnx via onnxmltools."""
    from onnxmltools import convert_xgboost
    from onnxconverter_common.data_types import FloatTensorType
    initial_types = [("input", FloatTensorType([None, n_features]))]
    return convert_xgboost(clf, initial_types=initial_types,
                           target_opset=15)


def _to_onnx_lightgbm(clf, n_features: int):
    """Convert LGBMClassifier → onnx via onnxmltools."""
    from onnxmltools import convert_lightgbm
    from onnxconverter_common.data_types import FloatTensorType
    initial_types = [("input", FloatTensorType([None, n_features]))]
    return convert_lightgbm(clf, initial_types=initial_types,
                            target_opset=15)


def _validate(clf, onnx_bytes, n_features: int, n_samples: int = 32):
    """Round-trip predict to ensure ONNX matches sklearn."""
    import onnxruntime as ort
    rng = np.random.default_rng(42)
    X = rng.standard_normal((n_samples, n_features)).astype(np.float32)

    sess = ort.InferenceSession(onnx_bytes, providers=["CPUExecutionProvider"])
    in_name = sess.get_inputs()[0].name
    out = sess.run(None, {in_name: X})

    # Heuristic: probabilities live in the 2nd output for sklearn-onnx style,
    # or in 'probabilities' for onnxmltools.
    probs_onnx = None
    for arr in out:
        if isinstance(arr, list) and len(arr) > 0 and isinstance(arr[0], dict):
            probs_onnx = np.array([[d.get(0, 0.0), d.get(1, 0.0)] for d in arr])
            break
    if probs_onnx is None:
        for arr in out:
            a = np.asarray(arr)
            if a.ndim == 2 and a.shape[1] == 2:
                probs_onnx = a
                break
    assert probs_onnx is not None, "Could not locate probability output in ONNX session."

    probs_skl = clf.predict_proba(X)
    diff = float(np.abs(probs_onnx[:, 1] - probs_skl[:, 1]).max())
    print(f"[export_onnx]   validation max|Δp| = {diff:.6f}")
    assert diff < 1e-3, f"ONNX vs sklearn probability mismatch: {diff}"


def export(name: str) -> Path:
    pkl_path = MODELS_DIR / f"{name}.pkl"
    if not pkl_path.exists():
        print(f"[export_onnx] missing {pkl_path}; run train_{name}.py first.")
        sys.exit(1)

    with open(pkl_path, "rb") as f:
        bundle = pickle.load(f)
    clf = bundle["model"]
    feats = bundle["features"]
    n_features = len(feats)
    klass = type(clf).__name__

    print(f"[export_onnx] {name}: {klass}, n_features={n_features}")
    if klass.startswith("XGB"):
        onnx_model = _to_onnx_xgboost(clf, n_features)
    elif klass.startswith("LGBM"):
        onnx_model = _to_onnx_lightgbm(clf, n_features)
    else:
        print(f"[export_onnx] unsupported model type: {klass}")
        sys.exit(2)

    onnx_bytes = onnx_model.SerializeToString()
    _validate(clf, onnx_bytes, n_features)

    WEB_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = WEB_MODELS_DIR / f"{name}.onnx"
    out_path.write_bytes(onnx_bytes)
    size_kb = out_path.stat().st_size / 1024
    print(f"[export_onnx] wrote {out_path}  ({size_kb:.1f} KB)")
    if size_kb > SIZE_BUDGET_KB:
        print(f"[export_onnx] WARNING: > {SIZE_BUDGET_KB} KB budget. "
              "Reduce n_estimators or max_depth.")
    return out_path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("model_name", help="Model name (afib | respiratory | ...)")
    args = parser.parse_args()
    export(args.model_name)


if __name__ == "__main__":
    sys.exit(main() or 0)
