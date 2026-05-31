# AERVINEX ML Training Pipeline

This directory hosts the real-model training pipeline that replaces the
in-browser calibrated proxy (`public/js/ml-client.js`) with XGBoost /
LightGBM models exported to ONNX for client-side inference via
onnxruntime-web.

## Layout

```
ml/training/
  requirements.txt    Python deps (xgboost, scikit-learn, onnxmltools, wfdb, ...)
  train_afib.py       PhysioNet CinC 2017 AFib classifier (15 HRV features)
  train_respiratory.py  Quer 2021 DETECT-style respiratory event detector
  export_onnx.py      XGBoost.Booster  →  ONNX  (validated against sklearn)
  mlflow_setup.md     Local MLflow tracking server how-to
  README.md           This file
```

Outputs land in `../models/` (sklearn pickle for sanity) and
`public/models/{name}.onnx` (production artefacts).

## Quickstart

```bash
cd ml/training
python -m venv .venv && source .venv/bin/activate   # or .\.venv\Scripts\activate on Windows
pip install -r requirements.txt

# 1) Download dataset (NOT bundled — too large)
#    AFib: https://physionet.org/content/challenge-2017/1.0.0/
#    Save to ~/data/cinc2017/  (or set $AERVINEX_AFIB_DIR)
export AERVINEX_AFIB_DIR=~/data/cinc2017

# 2) Train + export
python train_afib.py           # writes ../models/afib.pkl + metrics
python export_onnx.py afib     # writes ../../public/models/afib.onnx

# 3) (Optional) MLflow tracking — see mlflow_setup.md
mlflow ui  # http://localhost:5000
```

## Reproducibility

- Random seeds pinned (seed=42 across numpy / sklearn / xgboost).
- Train/val/test split = 70/15/15, stratified by class.
- Dataset hash (sha256 of file list) recorded in `../models/version.json`.

## Model size budget

ONNX exports must be ≤ 500 KB each so the PWA stays cacheable.
XGBoost models with `max_depth=4, n_estimators<=100` fit comfortably.

## CI hook (TODO)

Add `ml/training/test_smoke.py` that loads a tiny canned slice from
`ml/local-test/` and asserts AUC > 0.6 — catches gross regressions in
under 10 seconds.
