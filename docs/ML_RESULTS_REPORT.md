# AERVINEX ML Pipeline v2 — Final Results Report

Generated: 2026-05-04

## Summary

All 5 AERVINEX ML models trained and evaluated. Below are the consolidated metrics.

## Model Performance Table

| Model | Feature | Accuracy | F1-Weighted | AUC | CV-F1 | Dataset |
|-------|---------|----------|-------------|-----|-------|---------|
| TEPRS | Air Quality → Health Risk | 0.7352 | 0.7799 | — | 0.9129 | Air Quality Health Impact (5,811 rows) |
| AIRI  | Athlete Injury Risk Index | 0.9500 | 0.9380 | 0.9460 | 0.9010 | Collegiate Athlete Injury (200 rows) |
| MCD   | Motion/Activity Detection | 0.9912 | 0.9912 | — | 0.9994 | UCI HAR Dataset (10,299 rows, 561 features) |
| APRB  | Physiological Stress | 0.8147 | 0.8237 | — | 0.8358 | Nurse Stress Prediction (80K sampled from 11M) |
| RRSS  | HRV Recovery Score | 0.9931 | 0.9931 | 0.9998 | 0.9928 | SWELL HRV Dataset |

## Model Details

### TEPRS (v2 — SMOTE Fixed)
- Algorithm: XGBoost + SMOTE oversampling
- Features: 7 air quality + health indicators
- Classes: 0.0, 1.0, 2.0, 3.0, 4.0
- Fix applied: SMOTE to balance minority health classes + class-weighted sample_weight

### AIRI (from ml_pipeline.py v1)
- Algorithm: XGBoost (original, already high performance)
- Features: 15 athlete physiological + training load features
- AUC = 0.946 — reliable injury risk stratification

### MCD (v2 — HAR Dataset)
- Algorithm: XGBoost (retrained on UCI HAR)
- Features: 561 accelerometer/gyroscope time-domain features
- Classes: Resting, Running, Walking
- Fix: replaced wearable dataset (no IMU) with HAR (561 sensor features)

### APRB (New Model)
- Algorithm: LightGBM
- Features: 7 (ACC XYZ, EDA, HR, TEMP + magnitude)
- 3-class stress: No Stress / Low Stress / High Stress
- Dataset: 80K stratified sample from 11M-row nurse wearable dataset

### RRSS (New Model)
- Algorithm: XGBoost
- Features: 20 HRV time-domain + frequency-domain features
- Binary: Recovered vs Stressed (HRV-based)

## Explainable AI (XAI)
- SHAP TreeExplainer applied to all tree-based models
- SHAP bar plots saved in ml_output/figures/ for each model
- Key drivers identified per model for clinical interpretability

## Files Generated
- `ml_output/models/teprs_model.pkl` + label encoder + features
- `ml_output/models/airi_model.pkl`
- `ml_output/models/mcd_model.pkl` + label encoder + features (HAR)
- `ml_output/models/aprb_model.pkl` + features
- `ml_output/models/rrss_model.pkl` + features
- `ml_output/figures/` — 10+ plots (CM, SHAP, Dashboard)
- `inference_pipeline.py` — Unified AERVINEXPredictor class

## Novelty Features Covered by ML
| Novelty Code | ML Model | Status |
|-------------|----------|--------|
| TEPRS | XGBoost (Air Quality → Health Impact) | DONE |
| AIRI  | XGBoost (Injury Risk Index) | DONE |
| MCD   | XGBoost (HAR Activity Detection) | DONE |
| APRB  | LightGBM (Stress Detection) | DONE |
| RRSS  | XGBoost (HRV Recovery Score) | DONE |
| XAI-M | SHAP TreeExplainer (all models) | DONE |
| AIRE  | Integrated Inference Pipeline | DONE |

### TEPRS v3 Update
- Algorithm: LightGBM (best of XGBoost/LightGBM/BalancedRF)
- Features: 13 (added HealthImpactScore, fixed column names)
- F1-macro: 0.6829 | F1-weighted: 0.9524 | CV: 0.9874
- Resampling: SMOTETomek + amplified class weights (x3 cls3, x5 cls4)


### TEPRS v4 Update (Dataset Baru)
- Dataset: mujtabamatin/air-quality-and-pollution-assessment (5000 rows)
- Kelas: Good=2000, Moderate=1500, Poor=1000, Hazardous=500
- Algorithm: LightGBM-New
- Features: 9
- Accuracy: 0.9520 | F1-weighted: 0.9519 | F1-macro: 0.9292 | CV: 0.9699
- Hazardous F1: 0.8725 (dari 0% di v3!)
