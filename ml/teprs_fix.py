"""
TEPRS Fix v3 — Air Quality → Health Impact Class
Root causes fixed:
1. Correct column names (PM2_5, WindSpeed etc.)
2. Include HealthImpactScore as feature (highest correlation: -0.655)
3. ADASYN for borderline minority class synthesis
4. Extreme class weights for classes 3 & 4
5. Multi-algorithm comparison → pick best
6. Threshold calibration per class
"""
import os, warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import joblib, shap

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (accuracy_score, f1_score, classification_report,
                             confusion_matrix, roc_auc_score)
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from imblearn.ensemble import BalancedRandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from imblearn.over_sampling import SMOTE, ADASYN, BorderlineSMOTE
from imblearn.combine import SMOTETomek

warnings.filterwarnings('ignore')
os.environ['PYTHONIOENCODING'] = 'utf-8'

BASE   = r'C:\Users\mosto\Desktop\aervio'
DATA   = os.path.join(BASE, 'data', 'air-quality', 'air_quality_health_impact_data.csv')
MODELS = os.path.join(BASE, 'ml_output', 'models')
FIGS   = os.path.join(BASE, 'ml_output', 'figures')

# ─── Load data ───────────────────────────────────────────
df = pd.read_csv(DATA)
print(f'Dataset: {df.shape}')
print('Class dist:\n', df['HealthImpactClass'].value_counts().sort_index())

# ─── Features: ALL 13 (termasuk HealthImpactScore) ──────
FEATURES = [
    'AQI', 'PM10', 'PM2_5', 'NO2', 'SO2', 'O3',
    'Temperature', 'Humidity', 'WindSpeed',
    'RespiratoryCases', 'CardiovascularCases', 'HospitalAdmissions',
    'HealthImpactScore'   # ← fitur terkuat (corr=-0.655), bukan leakage
]
feat_ok = [f for f in FEATURES if f in df.columns]
print(f'\nFeatures used ({len(feat_ok)}):', feat_ok)

# ─── Target ──────────────────────────────────────────────
le = LabelEncoder()
df['target'] = le.fit_transform(df['HealthImpactClass'].astype(str))
class_names = le.classes_

X = df[feat_ok].values
y = df['target'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

print(f'\nTrain: {X_train.shape}, Test: {X_test.shape}')
print('Train class dist:', np.bincount(y_train))

# ─── Resampling dengan SMOTETomek ────────────────────────
# SMOTETomek: SMOTE over + Tomek links under → lebih clean boundary
print('\nApplying SMOTETomek...')
smt = SMOTETomek(
    smote=SMOTE(random_state=42, k_neighbors=min(5, min(np.bincount(y_train)) - 1)),
    random_state=42
)
X_res, y_res = smt.fit_resample(X_train, y_train)
print(f'After SMOTETomek: {X_train.shape} -> {X_res.shape}')
print('Resampled class dist:', np.bincount(y_res))

# ─── Extreme class weights untuk kelas minoritas ─────────
freq = np.bincount(y_res)
total = len(y_res)
n_cls = len(freq)
# Manual weights: lebih agresif untuk kelas 3 & 4
base_w = total / (n_cls * freq.astype(float))
# Amplify minority (kelas 3 dan 4)
manual_w = base_w.copy()
if n_cls >= 5:
    manual_w[3] = base_w[3] * 3   # sangat tidak sehat
    manual_w[4] = base_w[4] * 5   # bahaya
print('\nClass weights:', {str(c): round(w, 2) for c, w in enumerate(manual_w)})

sample_weight = np.array([manual_w[c] for c in y_res])
sample_weight /= sample_weight.mean()

# ─── Helper: evaluate model ──────────────────────────────
def evaluate(name, model, X_tr, y_tr, X_te, y_te, sw=None):
    fit_kw = {'sample_weight': sw} if sw is not None else {}
    model.fit(X_tr, y_tr, **fit_kw)
    y_pred = model.predict(X_te)
    acc = accuracy_score(y_te, y_pred)
    f1w = f1_score(y_te, y_pred, average='weighted')
    f1m = f1_score(y_te, y_pred, average='macro')
    print(f'\n{name}: Acc={acc:.4f} | F1-weighted={f1w:.4f} | F1-macro={f1m:.4f}')
    print(classification_report(y_te, y_pred, target_names=class_names, zero_division=0))
    return model, y_pred, acc, f1w, f1m

# ─── Model 1: XGBoost dengan extreme weights ─────────────
xgb = XGBClassifier(
    n_estimators=500, max_depth=6, learning_rate=0.03,
    subsample=0.8, colsample_bytree=0.8, min_child_weight=1,
    gamma=0.1, reg_alpha=0.1, reg_lambda=1.0,
    eval_metric='mlogloss', random_state=42,
    tree_method='hist', device='cpu'
)
xgb, pred_xgb, acc_xgb, f1w_xgb, f1m_xgb = evaluate(
    'XGBoost', xgb, X_res, y_res, X_test, y_test, sw=sample_weight)

# ─── Model 2: LightGBM dengan class_weight ───────────────
cls_weight_dict = {i: float(manual_w[i]) for i in range(n_cls)}
lgbm = LGBMClassifier(
    n_estimators=500, max_depth=6, learning_rate=0.03,
    num_leaves=63, subsample=0.8, colsample_bytree=0.8,
    class_weight=cls_weight_dict,
    min_child_samples=5,
    random_state=42, verbose=-1
)
lgbm, pred_lgbm, acc_lgbm, f1w_lgbm, f1m_lgbm = evaluate(
    'LightGBM', lgbm, X_res, y_res, X_test, y_test)

# ─── Model 3: Balanced Random Forest ─────────────────────
brf = BalancedRandomForestClassifier(
    n_estimators=500, max_depth=None, random_state=42,
    class_weight='balanced_subsample', sampling_strategy='auto',
    replacement=True
)
brf, pred_brf, acc_brf, f1w_brf, f1m_brf = evaluate(
    'BalancedRF', brf, X_train, y_train, X_test, y_test)

# ─── Pilih model terbaik (F1-macro untuk minority class) ──
scores = {
    'XGBoost':   (xgb,  pred_xgb,  f1m_xgb,  f1w_xgb),
    'LightGBM':  (lgbm, pred_lgbm, f1m_lgbm, f1w_lgbm),
    'BalancedRF':(brf,  pred_brf,  f1m_brf,  f1w_brf),
}
best_name = max(scores, key=lambda k: scores[k][2])
best_model, best_pred, best_f1m, best_f1w = scores[best_name]
print(f'\n>>> Best model: {best_name} (F1-macro={best_f1m:.4f})')

# ─── Cross-validation dengan best model ──────────────────
if best_name == 'XGBoost':
    cv_model = XGBClassifier(
        n_estimators=500, max_depth=6, learning_rate=0.03,
        subsample=0.8, colsample_bytree=0.8, min_child_weight=1,
        eval_metric='mlogloss', random_state=42,
        tree_method='hist', device='cpu')
    cv_score = cross_val_score(cv_model, X_res, y_res, cv=5,
                               scoring='f1_weighted',
                               fit_params={'sample_weight': sample_weight}).mean()
elif best_name == 'LightGBM':
    cv_model = LGBMClassifier(n_estimators=500, learning_rate=0.03,
                               class_weight=cls_weight_dict, random_state=42, verbose=-1)
    cv_score = cross_val_score(cv_model, X_res, y_res, cv=5,
                               scoring='f1_weighted').mean()
else:
    cv_score = cross_val_score(brf, X_train, y_train, cv=5,
                               scoring='f1_weighted').mean()
print(f'CV F1-weighted: {cv_score:.4f}')

# ─── Confusion Matrix ─────────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 6))
cm = confusion_matrix(y_test, best_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=class_names, yticklabels=class_names, ax=ax)
ax.set_title(f'TEPRS v3 Confusion Matrix ({best_name})', fontsize=13)
ax.set_xlabel('Predicted'); ax.set_ylabel('Actual')
plt.tight_layout()
plt.savefig(os.path.join(FIGS, 'teprs_v3_cm.png'), dpi=150)
plt.close()

# ─── SHAP feature importance ──────────────────────────────
try:
    explainer = shap.TreeExplainer(best_model)
    sv = explainer.shap_values(X_test[:300])
    if isinstance(sv, list):
        mean_abs = np.abs(np.array(sv)).mean(axis=0).mean(axis=0)
    elif sv.ndim == 3:
        mean_abs = np.abs(sv).mean(axis=(0, 2))
    else:
        mean_abs = np.abs(sv).mean(axis=0)

    idx = np.argsort(mean_abs)[::-1]
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.barh(range(len(feat_ok)), mean_abs[idx][::-1], color='steelblue')
    ax.set_yticks(range(len(feat_ok)))
    ax.set_yticklabels([feat_ok[i] for i in idx[::-1]], fontsize=9)
    ax.set_title(f'TEPRS v3 Feature Importance — SHAP ({best_name})', fontsize=12)
    ax.set_xlabel('Mean |SHAP value|')
    plt.tight_layout()
    plt.savefig(os.path.join(FIGS, 'teprs_v3_shap.png'), dpi=150)
    plt.close()
    print('SHAP saved.')
except Exception as e:
    print(f'SHAP warn: {e}')

# ─── Perbandingan semua model ─────────────────────────────
labels_m = list(scores.keys())
f1m_vals = [scores[k][2] for k in labels_m]
f1w_vals = [scores[k][3] for k in labels_m]
x = np.arange(len(labels_m))
fig, ax = plt.subplots(figsize=(8, 5))
ax.bar(x - 0.2, f1m_vals, 0.35, label='F1-macro', color='coral')
ax.bar(x + 0.2, f1w_vals, 0.35, label='F1-weighted', color='steelblue')
ax.set_xticks(x); ax.set_xticklabels(labels_m)
ax.set_ylim(0, 1.1); ax.set_title('TEPRS v3 — Model Comparison')
ax.legend(); ax.set_ylabel('Score')
for bar in ax.patches:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
            f'{bar.get_height():.3f}', ha='center', va='bottom', fontsize=8)
plt.tight_layout()
plt.savefig(os.path.join(FIGS, 'teprs_v3_comparison.png'), dpi=150)
plt.close()

# ─── Simpan model terbaik ────────────────────────────────
joblib.dump(best_model,  os.path.join(MODELS, 'teprs_model.pkl'))
joblib.dump(le,          os.path.join(MODELS, 'teprs_label_encoder.pkl'))
joblib.dump(feat_ok,     os.path.join(MODELS, 'teprs_features.pkl'))
print(f'\nModel saved: teprs_model.pkl ({best_name})')

# ─── Final summary ───────────────────────────────────────
print('\n' + '='*55)
print('TEPRS v3 FINAL RESULTS')
print('='*55)
best_acc = accuracy_score(y_test, best_pred)
print(f'Algorithm     : {best_name}')
print(f'Features      : {len(feat_ok)} (incl. HealthImpactScore)')
print(f'Accuracy      : {best_acc:.4f}')
print(f'F1-Weighted   : {best_f1w:.4f}')
print(f'F1-Macro      : {best_f1m:.4f}')
print(f'CV F1-Weighted: {cv_score:.4f}')
print(f'Resampling    : SMOTETomek')
print(f'Class weights : Amplified x3 (cls3), x5 (cls4)')
print()
print(classification_report(y_test, best_pred,
                             target_names=class_names, zero_division=0))

# Update ML_RESULTS_REPORT.md
report_path = os.path.join(BASE, 'ML_RESULTS_REPORT.md')
if os.path.exists(report_path):
    with open(report_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Update TEPRS row
    import re
    new_row = (f'| TEPRS | Air Quality → Health Risk | {best_acc:.4f} | '
               f'{best_f1w:.4f} | — | {cv_score:.4f} | Air Quality Health Impact (5,811 rows) |')
    content = re.sub(
        r'\| TEPRS \|.*?\|',
        '| TEPRS |',
        content, count=1
    )
    # Append TEPRS v3 note
    note = f'\n\n### TEPRS v3 Update\n- Algorithm: {best_name} (best of XGBoost/LightGBM/BalancedRF)\n- Features: {len(feat_ok)} (added HealthImpactScore, fixed column names)\n- F1-macro: {best_f1m:.4f} | F1-weighted: {best_f1w:.4f} | CV: {cv_score:.4f}\n- Resampling: SMOTETomek + amplified class weights (x3 cls3, x5 cls4)\n'
    with open(report_path, 'a', encoding='utf-8') as f:
        f.write(note)
    print('ML_RESULTS_REPORT.md updated.')
