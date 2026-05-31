"""
TEPRS v4 — Retrain dengan dataset baru (mujtabamatin)
Dataset baru: 5000 rows, 4 kelas, Hazardous=500 (vs 56 sebelumnya)
"""
import os, warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import joblib, shap

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (accuracy_score, f1_score, classification_report,
                             confusion_matrix, roc_auc_score)
from imblearn.over_sampling import SMOTE
from imblearn.combine import SMOTETomek
from imblearn.ensemble import BalancedRandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

warnings.filterwarnings('ignore')
os.environ['PYTHONIOENCODING'] = 'utf-8'

BASE   = r'C:\Users\mosto\Desktop\aervio'
MODELS = os.path.join(BASE, 'ml_output', 'models')
FIGS   = os.path.join(BASE, 'ml_output', 'figures')

# ─── Load dataset baru ───────────────────────────────────
DATA_NEW = os.path.join(BASE, 'data', '_tmp_check',
                        'air-quality-and-pollution-assessment',
                        'updated_pollution_dataset.csv')
df = pd.read_csv(DATA_NEW)
print(f'Dataset baru: {df.shape}')
print(df['Air Quality'].value_counts())

# ─── EDA cepat ───────────────────────────────────────────
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
fig.suptitle('TEPRS v4 — Dataset EDA', fontsize=13)

# Distribusi kelas
class_counts = df['Air Quality'].value_counts()
axes[0].bar(class_counts.index, class_counts.values,
            color=['green','orange','red','darkred'])
axes[0].set_title('Class Distribution')
axes[0].set_ylabel('Count')
for i, (k, v) in enumerate(class_counts.items()):
    axes[0].text(i, v+10, str(v), ha='center', fontsize=9)

# PM2.5 per kelas
order = ['Good','Moderate','Poor','Hazardous']
df_plot = df[df['Air Quality'].isin(order)]
colors = {'Good':'green','Moderate':'orange','Poor':'red','Hazardous':'darkred'}
for cls in order:
    sub = df_plot[df_plot['Air Quality']==cls]['PM2.5']
    axes[1].hist(sub, alpha=0.5, bins=30, label=cls, color=colors[cls])
axes[1].set_title('PM2.5 Distribution per Class')
axes[1].legend(fontsize=8)

# Correlation heatmap
feat_cols = ['Temperature','Humidity','PM2.5','PM10','NO2','SO2','CO',
             'Proximity_to_Industrial_Areas','Population_Density']
corr = df[feat_cols].corr()
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm',
            ax=axes[2], annot_kws={'size':6})
axes[2].set_title('Feature Correlation')
plt.tight_layout()
plt.savefig(os.path.join(FIGS, 'teprs_v4_eda.png'), dpi=150)
plt.close()
print('EDA saved.')

# ─── Fitur & target ──────────────────────────────────────
FEATURES = ['PM2.5','PM10','NO2','SO2','CO','Temperature','Humidity',
            'Proximity_to_Industrial_Areas','Population_Density']
feat_ok = [f for f in FEATURES if f in df.columns]
print(f'\nFeatures ({len(feat_ok)}):', feat_ok)

le = LabelEncoder()
# Urutkan kelas secara logis: Good < Moderate < Poor < Hazardous
le.fit(['Good','Moderate','Poor','Hazardous'])
df['target'] = le.transform(df['Air Quality'])
class_names = le.classes_
print('Class encoding:', dict(zip(le.classes_, le.transform(le.classes_))))

X = df[feat_ok].values
y = df['target'].values

X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
print(f'\nTrain: {X_tr.shape} | Test: {X_te.shape}')
print('Train dist:', np.bincount(y_tr))

# ─── Gabungkan dengan dataset lama (opsional) ───────────
# Load dataset lama (5811 rows), mapping kolom
DATA_OLD = os.path.join(BASE, 'data', 'air-quality', 'air_quality_health_impact_data.csv')
df_old = pd.read_csv(DATA_OLD)

# Map kelas lama (0-4) ke kelas baru (Good/Moderate/Poor/Hazardous)
class_map_old = {0.0:'Good', 1.0:'Moderate', 2.0:'Poor', 3.0:'Poor', 4.0:'Hazardous'}
df_old['Air Quality'] = df_old['HealthImpactClass'].map(class_map_old)
df_old = df_old.dropna(subset=['Air Quality'])

# Rename kolom lama agar sama dengan dataset baru
rename_map = {
    'PM2_5': 'PM2.5', 'WindSpeed': 'Wind Speed',
    'RespiratoryCases': 'RespiratoryCases',
    'CardiovascularCases': 'CardiovascularCases',
}
df_old = df_old.rename(columns=rename_map)

# Ambil fitur yang ada di kedua dataset
feat_common = ['PM2.5','PM10','NO2','SO2','O3','Temperature','Humidity']
feat_common_ok = [f for f in feat_common if f in df_old.columns and f in df.columns]

df_old_sub = df_old[feat_common_ok + ['Air Quality']].copy()
df_old_sub['target'] = le.transform(df_old_sub['Air Quality'])

# Merge: gunakan fitur common untuk combined dataset
feat_merged = feat_common_ok
X_old = df_old_sub[feat_merged].values
y_old = df_old_sub['target'].values

# Dataset baru dengan fitur common saja
X_new_common = df[feat_merged].values
y_new = df['target'].values

X_merged = np.vstack([X_new_common, X_old])
y_merged = np.concatenate([y_new, y_old])
print(f'\nMerged dataset: {X_merged.shape}')
print('Merged class dist:', np.bincount(y_merged))

X_mtr, X_mte, y_mtr, y_mte = train_test_split(
    X_merged, y_merged, test_size=0.2, random_state=42, stratify=y_merged)

# ─── Helper evaluate ────────────────────────────────────
def evaluate(name, model, Xtr, ytr, Xte, yte, sw=None):
    kw = {'sample_weight': sw} if sw is not None else {}
    model.fit(Xtr, ytr, **kw)
    yp = model.predict(Xte)
    acc = accuracy_score(yte, yp)
    f1w = f1_score(yte, yp, average='weighted')
    f1m = f1_score(yte, yp, average='macro')
    print(f'\n{name}: Acc={acc:.4f} | F1-w={f1w:.4f} | F1-m={f1m:.4f}')
    print(classification_report(yte, yp, target_names=class_names, zero_division=0))
    return model, yp, acc, f1w, f1m

# ─── TRAIN A: Dataset baru saja (9 fitur) ───────────────
print('\n' + '='*55)
print('A. Dataset BARU (9 fitur, 5000 rows)')
print('='*55)

sm = SMOTE(random_state=42)
X_res, y_res = sm.fit_resample(X_tr, y_tr)
print(f'SMOTE: {X_tr.shape} -> {X_res.shape}')

cls_w = {i: len(y_res)/(len(np.unique(y_res))*np.bincount(y_res)[i])
         for i in range(len(np.unique(y_res)))}

xgb_a = XGBClassifier(n_estimators=500, max_depth=6, learning_rate=0.03,
                       subsample=0.8, colsample_bytree=0.8,
                       eval_metric='mlogloss', random_state=42,
                       tree_method='hist', device='cpu')
sw_a = np.array([cls_w[c] for c in y_res])
xgb_a, pred_a, acc_a, f1w_a, f1m_a = evaluate(
    'XGBoost (dataset baru)', xgb_a, X_res, y_res, X_te, y_te, sw=sw_a)

lgbm_a = LGBMClassifier(n_estimators=500, max_depth=6, learning_rate=0.03,
                         num_leaves=63, subsample=0.8, class_weight=cls_w,
                         random_state=42, verbose=-1)
lgbm_a, pred_la, acc_la, f1w_la, f1m_la = evaluate(
    'LightGBM (dataset baru)', lgbm_a, X_res, y_res, X_te, y_te)

# ─── TRAIN B: Dataset merged (common fitur) ─────────────
print('\n' + '='*55)
print(f'B. Dataset MERGED ({len(feat_merged)} fitur, {len(X_merged)} rows)')
print('='*55)

sm_m = SMOTE(random_state=42)
X_mres, y_mres = sm_m.fit_resample(X_mtr, y_mtr)
print(f'SMOTE merged: {X_mtr.shape} -> {X_mres.shape}')

cls_wm = {i: len(y_mres)/(len(np.unique(y_mres))*np.bincount(y_mres)[i])
          for i in range(len(np.unique(y_mres)))}

xgb_b = XGBClassifier(n_estimators=500, max_depth=6, learning_rate=0.03,
                       subsample=0.8, colsample_bytree=0.8,
                       eval_metric='mlogloss', random_state=42,
                       tree_method='hist', device='cpu')
sw_b = np.array([cls_wm[c] for c in y_mres])
xgb_b, pred_b, acc_b, f1w_b, f1m_b = evaluate(
    'XGBoost (merged)', xgb_b, X_mres, y_mres, X_mte, y_mte, sw=sw_b)

lgbm_b = LGBMClassifier(n_estimators=500, max_depth=6, learning_rate=0.03,
                         num_leaves=63, subsample=0.8, class_weight=cls_wm,
                         random_state=42, verbose=-1)
lgbm_b, pred_lb, acc_lb, f1w_lb, f1m_lb = evaluate(
    'LightGBM (merged)', lgbm_b, X_mres, y_mres, X_mte, y_mte)

# ─── Pilih model terbaik ─────────────────────────────────
all_scores = {
    'XGBoost-New':    (xgb_a,  pred_a,  X_te,  y_te,  feat_ok, class_names, f1m_a,  f1w_a,  acc_a),
    'LightGBM-New':   (lgbm_a, pred_la, X_te,  y_te,  feat_ok, class_names, f1m_la, f1w_la, acc_la),
    'XGBoost-Merged': (xgb_b,  pred_b,  X_mte, y_mte, feat_merged, class_names, f1m_b,  f1w_b,  acc_b),
    'LightGBM-Merged':(lgbm_b, pred_lb, X_mte, y_mte, feat_merged, class_names, f1m_lb, f1w_lb, acc_lb),
}
best_name = max(all_scores, key=lambda k: all_scores[k][6])
best_model, best_pred, best_Xte, best_yte, best_feats, best_cls, best_f1m, best_f1w, best_acc = all_scores[best_name]
print(f'\n>>> Best: {best_name} (F1-macro={best_f1m:.4f})')

# ─── CV Score ────────────────────────────────────────────
if 'New' in best_name:
    cv_data = (X_res, y_res, sw_a if 'XGBoost' in best_name else None)
else:
    cv_data = (X_mres, y_mres, sw_b if 'XGBoost' in best_name else None)

cv_score = cross_val_score(best_model, cv_data[0], cv_data[1],
                           cv=5, scoring='f1_weighted').mean()
print(f'CV F1-weighted: {cv_score:.4f}')

# ─── Confusion Matrix ────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

cm = confusion_matrix(best_yte, best_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=best_cls, yticklabels=best_cls, ax=axes[0])
axes[0].set_title(f'TEPRS v4 — {best_name}\nConfusion Matrix', fontsize=11)
axes[0].set_xlabel('Predicted'); axes[0].set_ylabel('Actual')

# Perbandingan semua model
names_plot = list(all_scores.keys())
f1m_vals = [all_scores[k][6] for k in names_plot]
f1w_vals = [all_scores[k][7] for k in names_plot]
x = np.arange(len(names_plot))
axes[1].bar(x - 0.2, f1m_vals, 0.35, label='F1-macro', color='coral')
axes[1].bar(x + 0.2, f1w_vals, 0.35, label='F1-weighted', color='steelblue')
axes[1].set_xticks(x)
axes[1].set_xticklabels([n.replace('-','\n') for n in names_plot], fontsize=8)
axes[1].set_ylim(0, 1.1); axes[1].legend()
axes[1].set_title('Model Comparison (TEPRS v4)')
for bar in axes[1].patches:
    if bar.get_height() > 0.01:
        axes[1].text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                     f'{bar.get_height():.3f}', ha='center', va='bottom', fontsize=7)
plt.tight_layout()
plt.savefig(os.path.join(FIGS, 'teprs_v4_results.png'), dpi=150)
plt.close()

# ─── SHAP ────────────────────────────────────────────────
try:
    explainer = shap.TreeExplainer(best_model)
    sv = explainer.shap_values(best_Xte[:300])
    if isinstance(sv, list):
        mean_abs = np.abs(np.array(sv)).mean(axis=0).mean(axis=0)
    elif hasattr(sv, 'ndim') and sv.ndim == 3:
        mean_abs = np.abs(sv).mean(axis=(0, 2))
    else:
        mean_abs = np.abs(sv).mean(axis=0)

    n_feat = len(best_feats)
    mean_abs = mean_abs[:n_feat]
    idx = np.argsort(mean_abs)[::-1]
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.barh(range(n_feat), mean_abs[idx][::-1], color='steelblue')
    ax.set_yticks(range(n_feat))
    ax.set_yticklabels([best_feats[i] for i in idx[::-1]], fontsize=9)
    ax.set_title(f'TEPRS v4 SHAP — {best_name}', fontsize=12)
    ax.set_xlabel('Mean |SHAP value|')
    plt.tight_layout()
    plt.savefig(os.path.join(FIGS, 'teprs_v4_shap.png'), dpi=150)
    plt.close()
    print('SHAP saved.')
except Exception as e:
    print(f'SHAP warn: {e}')

# ─── Simpan model ────────────────────────────────────────
joblib.dump(best_model,  os.path.join(MODELS, 'teprs_model.pkl'))
joblib.dump(le,          os.path.join(MODELS, 'teprs_label_encoder.pkl'))
joblib.dump(best_feats,  os.path.join(MODELS, 'teprs_features.pkl'))
print(f'\nModel saved: teprs_model.pkl ({best_name})')
print(f'Features saved: {best_feats}')

# ─── Final summary ───────────────────────────────────────
print('\n' + '='*55)
print('TEPRS v4 FINAL RESULTS')
print('='*55)
print(f'Algorithm     : {best_name}')
print(f'Dataset       : {len(X_merged) if "Merged" in best_name else 5000} rows')
print(f'Features      : {len(best_feats)}')
print(f'Accuracy      : {best_acc:.4f}')
print(f'F1-Weighted   : {best_f1w:.4f}')
print(f'F1-Macro      : {best_f1m:.4f}')
print(f'CV F1         : {cv_score:.4f}')
print()
print(classification_report(best_yte, best_pred,
                             target_names=best_cls, zero_division=0))

# Progress vs versi sebelumnya
print('\n--- Perbandingan dengan versi sebelumnya ---')
print(f'{"Versi":<12} {"Acc":>8} {"F1-w":>8} {"F1-m":>8} {"Hazardous F1":>14}')
print(f'{"TEPRS v1":<12} {"0.7352":>8} {"0.7799":>8} {"0.36":>8} {"0%":>14}')
print(f'{"TEPRS v3":<12} {"0.9579":>8} {"0.9524":>8} {"0.68":>8} {"0%":>14}')

# Hitung Hazardous F1 untuk v4
from sklearn.metrics import f1_score as f1s
haz_idx = list(le.classes_).index('Hazardous')
haz_f1 = f1s(best_yte == haz_idx, best_pred == haz_idx, average='binary')
print(f'{"TEPRS v4":<12} {best_acc:>8.4f} {best_f1w:>8.4f} {best_f1m:>8.4f} {haz_f1:>14.4f}')

# Update report
note = (f'\n\n### TEPRS v4 Update (Dataset Baru)\n'
        f'- Dataset: mujtabamatin/air-quality-and-pollution-assessment (5000 rows)\n'
        f'- Kelas: Good=2000, Moderate=1500, Poor=1000, Hazardous=500\n'
        f'- Algorithm: {best_name}\n'
        f'- Features: {len(best_feats)}\n'
        f'- Accuracy: {best_acc:.4f} | F1-weighted: {best_f1w:.4f} | F1-macro: {best_f1m:.4f} | CV: {cv_score:.4f}\n'
        f'- Hazardous F1: {haz_f1:.4f} (dari 0% di v3!)\n')
report_path = os.path.join(BASE, 'ML_RESULTS_REPORT.md')
with open(report_path, 'a', encoding='utf-8') as f:
    f.write(note)
print('\nML_RESULTS_REPORT.md updated.')
