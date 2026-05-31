# MLflow Setup — Local Experiment Tracking

For AERVINEX we use MLflow to log every training run's params, metrics,
artifacts (model + feature importance plots), and dataset hash. This
gives us a paper-trail when calibration shifts or a model regresses.

## 1. Install

Already in `requirements.txt`. If you only need MLflow:

```bash
pip install mlflow
```

## 2. Run the tracking server (local)

```bash
# From any directory — store data under ./mlruns by default.
mlflow ui --host 127.0.0.1 --port 5000
# Then open http://localhost:5000
```

For team use, point MLflow to a shared SQLite or PostgreSQL backend:

```bash
mlflow ui \
  --backend-store-uri postgresql://user:pass@db.host:5432/mlflow \
  --default-artifact-root gs://aervinex-mlflow-artifacts \
  --host 0.0.0.0 --port 5000
```

## 3. Wire into training scripts

Add at the top of each `train_*.py` (already commented in train_afib.py):

```python
import mlflow

mlflow.set_tracking_uri("http://127.0.0.1:5000")
mlflow.set_experiment("aervinex-afib")

with mlflow.start_run(run_name=f"afib-{datetime.utcnow().isoformat()}"):
    mlflow.log_params({
        "n_estimators": 80, "max_depth": 4, "lr": 0.08, "seed": SEED,
    })
    # ... train ...
    mlflow.log_metric("auc", metrics["auc"])
    mlflow.log_metric("f1",  metrics["f1"])
    mlflow.xgboost.log_model(clf, artifact_path="model")
    mlflow.log_artifact("../models/version.json")
```

## 4. Compare runs

UI → Experiments → `aervinex-afib` → check rows → "Compare" → diff
hyperparams and metric overlays.

## 5. Promote a run

When a run beats the current production model on F1 and AUC by ≥1%
on the held-out test set:

1. Tag the run: `mlflow.set_tag("status", "production")`.
2. Re-run `python export_onnx.py afib` to refresh `public/models/afib.onnx`.
3. Bump `ml/models/version.json` and commit.
4. Update `public/js/ml-onnx-loader.js` `FEATURE_SPECS` if features changed.
