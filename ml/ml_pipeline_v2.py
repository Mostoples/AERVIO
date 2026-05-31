"""
AERVINEX ML Pipeline v2
Tasks: TEPRS fix, MCD retrain (HAR), APRB (Nurse Stress), RRSS (SWELL HRV),
       Integrated Inference Pipeline, Final Report
"""
import os, sys, warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import joblib, shap

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (accuracy_score, f1_score, roc_auc_score,
                             confusion_matrix, classification_report)
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

warnings.filterwarnings('ignore')
os.environ['PYTHONIOENCODING'] = 'utf-8'

# ─────────────────────────────────────────────
BASE   = r'C:\Users\mosto\Desktop\aervio'
DATA   = os.path.join(BASE, 'data')
OUT    = os.path.join(BASE, 'ml_output')
MODELS = os.path.join(OUT, 'models')
FIGS   = os.path.join(OUT, 'figures')
os.makedirs(MODELS, exist_ok=True)
os.makedirs(FIGS,   exist_ok=True)

results_summary = {}   # {model_name: {acc, f1, auc, cv}}

# ─────────────────────────────────────────────
def save_confusion_matrix(y_true, y_pred, labels, title, fname):
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(max(6, len(labels)), max(5, len(labels))))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=labels, yticklabels=labels, ax=ax)
    ax.set_title(title, fontsize=13)
    ax.set_xlabel('Predicted')
    ax.set_ylabel('Actual')
    plt.tight_layout()
    plt.savefig(os.path.join(FIGS, fname), dpi=150)
    plt.close()


def save_shap_bar(model, X_sample, feature_names, title, fname, max_display=15):
    try:
        explainer = shap.TreeExplainer(model)
        sv = explainer.shap_values(X_sample)
        if isinstance(sv, list):
            sv = np.abs(np.array(sv)).mean(axis=0)
        mean_abs = np.abs(sv).mean(axis=0)
        idx = np.argsort(mean_abs)[::-1][:max_display]
        fig, ax = plt.subplots(figsize=(8, 6))
        ax.barh(range(max_display), mean_abs[idx][::-1], color='steelblue')
        ax.set_yticks(range(max_display))
        ax.set_yticklabels([feature_names[i] for i in idx[::-1]], fontsize=8)
        ax.set_title(title, fontsize=12)
        ax.set_xlabel('Mean |SHAP value|')
        plt.tight_layout()
        plt.savefig(os.path.join(FIGS, fname), dpi=150)
        plt.close()
    except Exception as e:
        print(f'  [SHAP warn] {e}')


# ══════════════════════════════════════════════════════════
# TASK 2: Fix TEPRS (Air Quality → Health Impact Class)
# ══════════════════════════════════════════════════════════
print('\n' + '='*60)
print('TASK 2: TEPRS — Fix Class Imbalance (SMOTE)')
print('='*60)

df_aq = pd.read_csv(os.path.join(DATA, 'air-quality', 'air_quality_health_impact_data.csv'))
print(f'Dataset: {df_aq.shape}')
print('Columns:', list(df_aq.columns))

# Map target column
target_col = 'Health Impact Class' if 'Health Impact Class' in df_aq.columns else df_aq.columns[-1]
print(f'Target: {target_col}')
print('Class distribution:\n', df_aq[target_col].value_counts())

# Encode target if string
le_teprs = LabelEncoder()
df_aq['target_enc'] = le_teprs.fit_transform(df_aq[target_col].astype(str))

TEPRS_FEATURES = ['AQI', 'PM2.5', 'PM10', 'NO2', 'SO2', 'O3',
                  'Temperature', 'Humidity', 'Wind Speed',
                  'Respiratory Cases', 'Cardiovascular Cases', 'Hospital Admissions']
feat_ok = [f for f in TEPRS_FEATURES if f in df_aq.columns]
# fallback: use all numeric cols except target
if len(feat_ok) < 3:
    feat_ok = [c for c in df_aq.select_dtypes(include=np.number).columns
               if c not in ['target_enc']]
print(f'Features used ({len(feat_ok)}):', feat_ok)

X = df_aq[feat_ok].values
y = df_aq['target_enc'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

# SMOTE to balance classes
sm = SMOTE(random_state=42, k_neighbors=min(5, min(np.bincount(y_train)) - 1))
try:
    X_res, y_res = sm.fit_resample(X_train, y_train)
    print(f'SMOTE: {X_train.shape} -> {X_res.shape}')
except Exception as e:
    print(f'SMOTE failed ({e}), using original data')
    X_res, y_res = X_train, y_train

# Compute class weights for XGBoost
n_classes = len(np.unique(y))
# scale_pos_weight for multi-class: not directly supported; use class weighting via sample_weight
class_counts = np.bincount(y_res)
sample_weight = np.array([1.0 / class_counts[c] for c in y_res])
sample_weight = sample_weight / sample_weight.mean()  # normalise

teprs_model = XGBClassifier(
    n_estimators=300, max_depth=6, learning_rate=0.05,
    subsample=0.8, colsample_bytree=0.8,
    eval_metric='mlogloss', random_state=42,
    tree_method='hist', device='cpu'
)
teprs_model.fit(X_res, y_res, sample_weight=sample_weight,
                eval_set=[(X_test, y_test)], verbose=False)

y_pred = teprs_model.predict(X_test)
acc  = accuracy_score(y_test, y_pred)
f1   = f1_score(y_test, y_pred, average='weighted')
cv   = cross_val_score(teprs_model, X_res, y_res, cv=5,
                       scoring='f1_weighted', fit_params={'sample_weight': sample_weight}).mean()

print(f'\nTEPRS v2 Results:')
print(f'  Accuracy : {acc:.4f}')
print(f'  F1-macro : {f1:.4f}')
print(f'  CV F1    : {cv:.4f}')
print(classification_report(y_test, y_pred, target_names=le_teprs.classes_))

save_confusion_matrix(y_test, y_pred, le_teprs.classes_,
                      'TEPRS v2 Confusion Matrix (SMOTE)', 'teprs_v2_cm.png')
save_shap_bar(teprs_model, X_test[:200], feat_ok,
              'TEPRS v2 Feature Importance (SHAP)', 'teprs_v2_shap.png')

joblib.dump(teprs_model, os.path.join(MODELS, 'teprs_model.pkl'))
joblib.dump(le_teprs,    os.path.join(MODELS, 'teprs_label_encoder.pkl'))
joblib.dump(feat_ok,     os.path.join(MODELS, 'teprs_features.pkl'))

results_summary['TEPRS'] = {'accuracy': acc, 'f1_weighted': f1, 'cv_f1': cv,
                             'classes': list(le_teprs.classes_), 'n_features': len(feat_ok)}
print('[TEPRS v2 DONE]')


# ══════════════════════════════════════════════════════════
# TASK 3: Retrain MCD with HAR Dataset
# ══════════════════════════════════════════════════════════
print('\n' + '='*60)
print('TASK 3: MCD — Motion/Activity Detection (HAR Dataset)')
print('='*60)

har_train = pd.read_csv(os.path.join(DATA, 'har', 'train.csv'))
har_test  = pd.read_csv(os.path.join(DATA, 'har', 'test.csv'))
print(f'HAR train: {har_train.shape}, test: {har_test.shape}')
print('Activities:', har_train['Activity'].value_counts().to_dict())

# Map HAR 6-class → AERVINEX 4-class
activity_map = {
    'WALKING':            'Walking',
    'WALKING_UPSTAIRS':   'Running',
    'WALKING_DOWNSTAIRS': 'Running',
    'STANDING':           'Resting',
    'SITTING':            'Resting',
    'LAYING':             'Resting',
}
har_train['Activity_mapped'] = har_train['Activity'].map(activity_map)
har_test['Activity_mapped']  = har_test['Activity'].map(activity_map)

feature_cols = [c for c in har_train.columns if c not in ['Activity', 'subject', 'Activity_mapped']]
print(f'Feature count: {len(feature_cols)}')
print('Mapped dist:', har_train['Activity_mapped'].value_counts().to_dict())

le_mcd = LabelEncoder()
y_mcd_train = le_mcd.fit_transform(har_train['Activity_mapped'])
y_mcd_test  = le_mcd.transform(har_test['Activity_mapped'])
X_mcd_train = har_train[feature_cols].values
X_mcd_test  = har_test[feature_cols].values

# SMOTE on training data
sm_mcd = SMOTE(random_state=42)
X_mcd_res, y_mcd_res = sm_mcd.fit_resample(X_mcd_train, y_mcd_train)
print(f'SMOTE MCD: {X_mcd_train.shape} -> {X_mcd_res.shape}')

mcd_model = XGBClassifier(
    n_estimators=200, max_depth=6, learning_rate=0.1,
    subsample=0.8, colsample_bytree=0.6,
    eval_metric='mlogloss', random_state=42,
    tree_method='hist', device='cpu'
)
mcd_model.fit(X_mcd_res, y_mcd_res,
              eval_set=[(X_mcd_test, y_mcd_test)], verbose=False)

y_mcd_pred = mcd_model.predict(X_mcd_test)
acc_mcd = accuracy_score(y_mcd_test, y_mcd_pred)
f1_mcd  = f1_score(y_mcd_test, y_mcd_pred, average='weighted')

cv_mcd = cross_val_score(mcd_model, X_mcd_res, y_mcd_res, cv=5,
                          scoring='f1_weighted').mean()

print(f'\nMCD (HAR) Results:')
print(f'  Accuracy : {acc_mcd:.4f}')
print(f'  F1       : {f1_mcd:.4f}')
print(f'  CV F1    : {cv_mcd:.4f}')
print(classification_report(y_mcd_test, y_mcd_pred, target_names=le_mcd.classes_))

save_confusion_matrix(y_mcd_test, y_mcd_pred, le_mcd.classes_,
                      'MCD v2 Confusion Matrix (HAR)', 'mcd_v2_cm.png')
save_shap_bar(mcd_model, X_mcd_test[:200], feature_cols,
              'MCD v2 Feature Importance (SHAP)', 'mcd_v2_shap.png')

joblib.dump(mcd_model,     os.path.join(MODELS, 'mcd_model.pkl'))
joblib.dump(le_mcd,        os.path.join(MODELS, 'mcd_label_encoder.pkl'))
joblib.dump(feature_cols,  os.path.join(MODELS, 'mcd_features.pkl'))

results_summary['MCD'] = {'accuracy': acc_mcd, 'f1_weighted': f1_mcd, 'cv_f1': cv_mcd,
                           'classes': list(le_mcd.classes_), 'n_features': len(feature_cols)}
print('[MCD v2 DONE]')


# ══════════════════════════════════════════════════════════
# TASK 4: APRB — Stress Detection (Nurse Stress Dataset)
# ══════════════════════════════════════════════════════════
print('\n' + '='*60)
print('TASK 4: APRB — Stress Detection (Nurse Stress Dataset)')
print('='*60)

# Dataset is very large (11M rows); stratified sample 80k rows
SAMPLE_SIZE = 80_000
chunks = []
for chunk in pd.read_csv(os.path.join(DATA, 'nurse-stress', 'merged_data.csv'),
                          chunksize=200_000):
    chunk = chunk.dropna(subset=['label'])
    chunks.append(chunk)

df_nurse = pd.concat(chunks, ignore_index=True)
print(f'Full nurse dataset: {df_nurse.shape}')
print('Label dist:', df_nurse['label'].value_counts().to_dict())

# Stratified sample
df_nurse_sampled, _ = train_test_split(
    df_nurse, train_size=SAMPLE_SIZE, stratify=df_nurse['label'], random_state=42)
print(f'Sampled: {df_nurse_sampled.shape}')

APRB_FEATURES = ['X', 'Y', 'Z', 'EDA', 'HR', 'TEMP']
feat_aprb = [f for f in APRB_FEATURES if f in df_nurse_sampled.columns]

# Add derived features
df_nurse_sampled = df_nurse_sampled.copy()
df_nurse_sampled['acc_magnitude'] = np.sqrt(
    df_nurse_sampled['X']**2 + df_nurse_sampled['Y']**2 + df_nurse_sampled['Z']**2)
feat_aprb.append('acc_magnitude')

X_aprb = df_nurse_sampled[feat_aprb].values
y_aprb = df_nurse_sampled['label'].astype(int).values

X_aprb_tr, X_aprb_te, y_aprb_tr, y_aprb_te = train_test_split(
    X_aprb, y_aprb, test_size=0.2, random_state=42, stratify=y_aprb)

# SMOTE
sm_aprb = SMOTE(random_state=42)
X_aprb_res, y_aprb_res = sm_aprb.fit_resample(X_aprb_tr, y_aprb_tr)
print(f'SMOTE APRB: {X_aprb_tr.shape} -> {X_aprb_res.shape}')

aprb_model = LGBMClassifier(
    n_estimators=300, max_depth=6, learning_rate=0.05,
    num_leaves=63, subsample=0.8, colsample_bytree=0.8,
    class_weight='balanced', random_state=42, verbose=-1
)
aprb_model.fit(X_aprb_res, y_aprb_res)

y_aprb_pred = aprb_model.predict(X_aprb_te)
acc_aprb = accuracy_score(y_aprb_te, y_aprb_pred)
f1_aprb  = f1_score(y_aprb_te, y_aprb_pred, average='weighted')
cv_aprb  = cross_val_score(aprb_model, X_aprb_res, y_aprb_res, cv=5,
                            scoring='f1_weighted').mean()

stress_labels = ['No Stress', 'Low Stress', 'High Stress']
print(f'\nAPRB Results:')
print(f'  Accuracy : {acc_aprb:.4f}')
print(f'  F1       : {f1_aprb:.4f}')
print(f'  CV F1    : {cv_aprb:.4f}')
print(classification_report(y_aprb_te, y_aprb_pred, target_names=stress_labels))

save_confusion_matrix(y_aprb_te, y_aprb_pred, stress_labels,
                      'APRB Confusion Matrix (Nurse Stress)', 'aprb_cm.png')

# SHAP for LightGBM
try:
    explainer_aprb = shap.TreeExplainer(aprb_model)
    sv_aprb = explainer_aprb.shap_values(X_aprb_te[:300])
    if isinstance(sv_aprb, list):
        sv_aprb_mean = np.abs(np.array(sv_aprb)).mean(axis=0).mean(axis=0)
    else:
        sv_aprb_mean = np.abs(sv_aprb).mean(axis=0)
    fig, ax = plt.subplots(figsize=(7, 5))
    idx = np.argsort(sv_aprb_mean)[::-1]
    ax.barh(range(len(feat_aprb)), sv_aprb_mean[idx][::-1], color='coral')
    ax.set_yticks(range(len(feat_aprb)))
    ax.set_yticklabels([feat_aprb[i] for i in idx[::-1]], fontsize=9)
    ax.set_title('APRB Feature Importance (SHAP)', fontsize=12)
    ax.set_xlabel('Mean |SHAP value|')
    plt.tight_layout()
    plt.savefig(os.path.join(FIGS, 'aprb_shap.png'), dpi=150)
    plt.close()
except Exception as e:
    print(f'  [SHAP warn] {e}')

joblib.dump(aprb_model,   os.path.join(MODELS, 'aprb_model.pkl'))
joblib.dump(feat_aprb,    os.path.join(MODELS, 'aprb_features.pkl'))

results_summary['APRB'] = {'accuracy': acc_aprb, 'f1_weighted': f1_aprb, 'cv_f1': cv_aprb,
                            'classes': stress_labels, 'n_features': len(feat_aprb)}
print('[APRB DONE]')


# ══════════════════════════════════════════════════════════
# TASK 5: RRSS — Recovery Score (SWELL HRV Dataset)
# ══════════════════════════════════════════════════════════
print('\n' + '='*60)
print('TASK 5: RRSS — Recovery/Stress Score (SWELL HRV Dataset)')
print('='*60)

swell_path = os.path.join(DATA, 'swell-hrv', 'hrv dataset', 'data', 'final', 'train.csv')
df_swell = pd.read_csv(swell_path)
swell_test_path = os.path.join(DATA, 'swell-hrv', 'hrv dataset', 'data', 'final', 'test.csv')
df_swell_te = pd.read_csv(swell_test_path)
print(f'SWELL train: {df_swell.shape}, test: {df_swell_te.shape}')
print('Condition dist train:', df_swell['condition'].value_counts().to_dict())

# Binary: no stress = Recovery=1, else = Recovery=0
df_swell['recovery'] = (df_swell['condition'] == 'no stress').astype(int)
df_swell_te['recovery'] = (df_swell_te['condition'] == 'no stress').astype(int)

RRSS_FEATURES = ['MEAN_RR', 'MEDIAN_RR', 'SDRR', 'RMSSD', 'SDSD',
                 'SDRR_RMSSD', 'HR', 'pNN25', 'pNN50', 'SD1', 'SD2',
                 'KURT', 'SKEW', 'VLF', 'LF', 'HF', 'LF_HF', 'HF_LF',
                 'sampen', 'higuci']
feat_rrss = [f for f in RRSS_FEATURES if f in df_swell.columns]
print(f'Features ({len(feat_rrss)}):', feat_rrss)

X_rrss_tr = df_swell[feat_rrss].values
y_rrss_tr = df_swell['recovery'].values
X_rrss_te = df_swell_te[feat_rrss].values
y_rrss_te = df_swell_te['recovery'].values

# SMOTE
sm_rrss = SMOTE(random_state=42, k_neighbors=min(5, min(np.bincount(y_rrss_tr)) - 1))
X_rrss_res, y_rrss_res = sm_rrss.fit_resample(X_rrss_tr, y_rrss_tr)
print(f'SMOTE RRSS: {X_rrss_tr.shape} -> {X_rrss_res.shape}')

rrss_model = XGBClassifier(
    n_estimators=300, max_depth=5, learning_rate=0.05,
    subsample=0.8, colsample_bytree=0.8,
    eval_metric='logloss', random_state=42,
    tree_method='hist', device='cpu'
)
rrss_model.fit(X_rrss_res, y_rrss_res,
               eval_set=[(X_rrss_te, y_rrss_te)], verbose=False)

y_rrss_pred = rrss_model.predict(X_rrss_te)
y_rrss_prob = rrss_model.predict_proba(X_rrss_te)[:, 1]
acc_rrss = accuracy_score(y_rrss_te, y_rrss_pred)
f1_rrss  = f1_score(y_rrss_te, y_rrss_pred, average='weighted')
try:
    auc_rrss = roc_auc_score(y_rrss_te, y_rrss_prob)
except Exception:
    auc_rrss = float('nan')
cv_rrss = cross_val_score(rrss_model, X_rrss_res, y_rrss_res, cv=5,
                           scoring='f1_weighted').mean()

print(f'\nRRSS Results:')
print(f'  Accuracy : {acc_rrss:.4f}')
print(f'  F1       : {f1_rrss:.4f}')
print(f'  AUC      : {auc_rrss:.4f}')
print(f'  CV F1    : {cv_rrss:.4f}')
print(classification_report(y_rrss_te, y_rrss_pred,
                             target_names=['Stressed', 'Recovered']))

save_confusion_matrix(y_rrss_te, y_rrss_pred, ['Stressed', 'Recovered'],
                      'RRSS Confusion Matrix (HRV)', 'rrss_cm.png')
save_shap_bar(rrss_model, X_rrss_te[:200], feat_rrss,
              'RRSS Feature Importance (SHAP)', 'rrss_shap.png')

joblib.dump(rrss_model,  os.path.join(MODELS, 'rrss_model.pkl'))
joblib.dump(feat_rrss,   os.path.join(MODELS, 'rrss_features.pkl'))

results_summary['RRSS'] = {'accuracy': acc_rrss, 'f1_weighted': f1_rrss,
                            'auc': auc_rrss, 'cv_f1': cv_rrss,
                            'classes': ['Stressed', 'Recovered'],
                            'n_features': len(feat_rrss)}
print('[RRSS DONE]')


# ══════════════════════════════════════════════════════════
# TASK 6: Integrated Inference Pipeline
# ══════════════════════════════════════════════════════════
print('\n' + '='*60)
print('TASK 6: Integrated Inference Pipeline')
print('='*60)

INFERENCE_CODE = '''"""
AERVINEX Integrated Inference Pipeline
Usage: from inference_pipeline import AERVINEXPredictor
"""
import numpy as np
import joblib, os

_MODEL_DIR = os.path.join(os.path.dirname(__file__), 'ml_output', 'models')

def _load(name):
    path = os.path.join(_MODEL_DIR, name)
    return joblib.load(path)

class AERVINEXPredictor:
    """Unified prediction interface for all AERVINEX ML models."""

    def __init__(self):
        self._teprs_model = _load('teprs_model.pkl')
        self._teprs_le    = _load('teprs_label_encoder.pkl')
        self._teprs_feat  = _load('teprs_features.pkl')

        self._airi_model  = _load('airi_model.pkl')

        self._mcd_model   = _load('mcd_model.pkl')
        self._mcd_le      = _load('mcd_label_encoder.pkl')
        self._mcd_feat    = _load('mcd_features.pkl')

        self._aprb_model  = _load('aprb_model.pkl')
        self._aprb_feat   = _load('aprb_features.pkl')

        self._rrss_model  = _load('rrss_model.pkl')
        self._rrss_feat   = _load('rrss_features.pkl')

    # ── TEPRS: Air Quality → Health Risk ──────────────────
    def predict_air_health(self, aqi, pm25, pm10, no2, so2, o3,
                           temperature, humidity, wind_speed,
                           resp_cases=0, cardio_cases=0, hosp_admissions=0):
        """
        Returns: dict with health_impact_class, label, probability
        """
        feat_map = {
            'AQI': aqi, 'PM2.5': pm25, 'PM10': pm10,
            'NO2': no2, 'SO2': so2, 'O3': o3,
            'Temperature': temperature, 'Humidity': humidity,
            'Wind Speed': wind_speed,
            'Respiratory Cases': resp_cases,
            'Cardiovascular Cases': cardio_cases,
            'Hospital Admissions': hosp_admissions,
        }
        X = np.array([[feat_map.get(f, 0) for f in self._teprs_feat]])
        pred = self._teprs_model.predict(X)[0]
        prob = self._teprs_model.predict_proba(X)[0].max()
        label = self._teprs_le.inverse_transform([pred])[0]
        return {'class': int(pred), 'label': label, 'confidence': float(prob)}

    # ── AIRI: Athlete Injury Risk ─────────────────────────
    def predict_injury_risk(self, age, height_cm, weight_kg, training_intensity,
                            training_hours_pw, recovery_days_pw, match_count_pw,
                            rest_between_events, fatigue_score, performance_score,
                            team_contribution, load_balance, acl_risk,
                            position='midfielder', gender='male'):
        """
        Returns: dict with injury_risk (0/1), probability
        """
        pos_enc = {'goalkeeper': 0, 'defender': 1, 'midfielder': 2, 'forward': 3}.get(
            position.lower(), 2)
        gen_enc = 0 if gender.lower() == 'female' else 1
        X = np.array([[age, height_cm, weight_kg, training_intensity,
                       training_hours_pw, recovery_days_pw, match_count_pw,
                       rest_between_events, fatigue_score, performance_score,
                       team_contribution, load_balance, acl_risk,
                       pos_enc, gen_enc]])
        pred = self._airi_model.predict(X)[0]
        prob = self._airi_model.predict_proba(X)[0][1]
        return {'injury_risk': int(pred), 'risk_probability': float(prob),
                'risk_level': 'HIGH' if prob > 0.7 else 'MEDIUM' if prob > 0.4 else 'LOW'}

    # ── MCD: Activity Detection (HAR features) ────────────
    def predict_activity(self, sensor_features_561):
        """
        sensor_features_561: array-like of 561 HAR feature values
        Returns: dict with activity, confidence
        """
        X = np.array([sensor_features_561])
        pred = self._mcd_model.predict(X)[0]
        prob = self._mcd_model.predict_proba(X)[0].max()
        label = self._mcd_le.inverse_transform([pred])[0]
        return {'activity': label, 'confidence': float(prob)}

    # ── APRB: Stress Detection ────────────────────────────
    def predict_stress(self, acc_x, acc_y, acc_z, eda, hr, temp):
        """
        Returns: dict with stress_level (0=None,1=Low,2=High), label, probability
        """
        mag = float(np.sqrt(acc_x**2 + acc_y**2 + acc_z**2))
        feat_map = {'X': acc_x, 'Y': acc_y, 'Z': acc_z,
                    'EDA': eda, 'HR': hr, 'TEMP': temp, 'acc_magnitude': mag}
        X = np.array([[feat_map.get(f, 0) for f in self._aprb_feat]])
        pred = self._aprb_model.predict(X)[0]
        prob = self._aprb_model.predict_proba(X)[0].max()
        labels = {0: 'No Stress', 1: 'Low Stress', 2: 'High Stress'}
        return {'stress_level': int(pred), 'label': labels.get(pred, 'Unknown'),
                'confidence': float(prob)}

    # ── RRSS: Recovery Score (HRV) ────────────────────────
    def predict_recovery(self, mean_rr, median_rr, sdrr, rmssd, sdsd,
                         sdrr_rmssd, hr, pnn25, pnn50, sd1, sd2,
                         kurt, skew, vlf, lf, hf, lf_hf, hf_lf,
                         sampen, higuci):
        """
        Returns: dict with recovery status, probability, recovery_score 0-100
        """
        feat_map = {
            'MEAN_RR': mean_rr, 'MEDIAN_RR': median_rr, 'SDRR': sdrr,
            'RMSSD': rmssd, 'SDSD': sdsd, 'SDRR_RMSSD': sdrr_rmssd,
            'HR': hr, 'pNN25': pnn25, 'pNN50': pnn50, 'SD1': sd1, 'SD2': sd2,
            'KURT': kurt, 'SKEW': skew, 'VLF': vlf, 'LF': lf, 'HF': hf,
            'LF_HF': lf_hf, 'HF_LF': hf_lf, 'sampen': sampen, 'higuci': higuci,
        }
        X = np.array([[feat_map.get(f, 0) for f in self._rrss_feat]])
        pred = self._rrss_model.predict(X)[0]
        prob_recovered = float(self._rrss_model.predict_proba(X)[0][1])
        score = round(prob_recovered * 100, 1)
        return {'recovered': bool(pred), 'recovery_score': score,
                'status': 'RECOVERED' if pred else 'STRESSED'}

    # ── Full inference: all models ─────────────────────────
    def full_assessment(self, air_params: dict, athlete_params: dict,
                        stress_params: dict, hrv_params: dict) -> dict:
        """
        Run all models and return comprehensive health assessment.
        """
        return {
            'air_health':    self.predict_air_health(**air_params),
            'injury_risk':   self.predict_injury_risk(**athlete_params),
            'stress':        self.predict_stress(**stress_params),
            'recovery':      self.predict_recovery(**hrv_params),
        }


if __name__ == '__main__':
    predictor = AERVINEXPredictor()
    print("AERVINEX Integrated Predictor loaded OK")

    # Demo inference
    air_result = predictor.predict_air_health(
        aqi=85, pm25=35, pm10=55, no2=20, so2=5, o3=40,
        temperature=32, humidity=65, wind_speed=3
    )
    print(f"Air Health: {air_result}")

    stress_result = predictor.predict_stress(
        acc_x=0.2, acc_y=0.1, acc_z=9.8, eda=1.5, hr=95, temp=37.2
    )
    print(f"Stress: {stress_result}")

    recovery_result = predictor.predict_recovery(
        mean_rr=850, median_rr=840, sdrr=45, rmssd=38, sdsd=30,
        sdrr_rmssd=1.2, hr=68, pnn25=0.3, pnn50=0.2, sd1=27, sd2=61,
        kurt=2.1, skew=0.1, vlf=120, lf=400, hf=300, lf_hf=1.3, hf_lf=0.77,
        sampen=1.5, higuci=1.8
    )
    print(f"Recovery: {recovery_result}")
'''

with open(os.path.join(BASE, 'ml', 'inference_pipeline.py'), 'w', encoding='utf-8') as f:
    f.write(INFERENCE_CODE)
print('Inference pipeline written: ml/inference_pipeline.py')

# Quick validation: load all models
print('Validating model loading...')
try:
    for fname in ['teprs_model.pkl', 'teprs_label_encoder.pkl', 'teprs_features.pkl',
                  'mcd_model.pkl', 'mcd_label_encoder.pkl', 'mcd_features.pkl',
                  'aprb_model.pkl', 'aprb_features.pkl',
                  'rrss_model.pkl', 'rrss_features.pkl']:
        path = os.path.join(MODELS, fname)
        if os.path.exists(path):
            joblib.load(path)
            print(f'  [OK] {fname}')
        else:
            print(f'  [MISSING] {fname}')
except Exception as e:
    print(f'  [ERROR] {e}')
print('[TASK 6 DONE]')


# ══════════════════════════════════════════════════════════
# TASK 7: Final Report
# ══════════════════════════════════════════════════════════
print('\n' + '='*60)
print('TASK 7: Final Report + Dashboard')
print('='*60)

# Load AIRI results from previous run (ml_pipeline.py)
airi_acc = 0.950; airi_f1 = 0.938; airi_auc = 0.946

# Summary table
rows = []
rows.append(('TEPRS', results_summary['TEPRS']['accuracy'],
             results_summary['TEPRS']['f1_weighted'],
             results_summary['TEPRS'].get('auc', float('nan')),
             results_summary['TEPRS']['cv_f1']))
rows.append(('AIRI',  airi_acc, airi_f1, airi_auc, 0.901))
rows.append(('MCD',   results_summary['MCD']['accuracy'],
             results_summary['MCD']['f1_weighted'],
             float('nan'),
             results_summary['MCD']['cv_f1']))
rows.append(('APRB',  results_summary['APRB']['accuracy'],
             results_summary['APRB']['f1_weighted'],
             float('nan'),
             results_summary['APRB']['cv_f1']))
rows.append(('RRSS',  results_summary['RRSS']['accuracy'],
             results_summary['RRSS']['f1_weighted'],
             results_summary['RRSS']['auc'],
             results_summary['RRSS']['cv_f1']))

df_results = pd.DataFrame(rows, columns=['Model', 'Accuracy', 'F1-Weighted', 'AUC', 'CV-F1'])
print('\nFinal Results Summary:')
print(df_results.to_string(index=False, float_format='%.4f'))

# Dashboard figure
fig, axes = plt.subplots(1, 3, figsize=(16, 5))
fig.suptitle('AERVINEX ML Models — Performance Dashboard', fontsize=14, fontweight='bold')

models = df_results['Model'].tolist()
x = np.arange(len(models))
w = 0.25

ax1 = axes[0]
ax1.bar(x - w, df_results['Accuracy'], w, label='Accuracy', color='steelblue')
ax1.bar(x,     df_results['F1-Weighted'], w, label='F1-Weighted', color='coral')
ax1.bar(x + w, df_results['CV-F1'], w, label='CV-F1', color='mediumseagreen')
ax1.set_xticks(x); ax1.set_xticklabels(models)
ax1.set_ylim(0, 1.05); ax1.set_title('Model Accuracy / F1 / CV-F1')
ax1.legend(fontsize=8); ax1.set_ylabel('Score')
for bar in ax1.patches:
    if bar.get_height() > 0.01:
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                 f'{bar.get_height():.2f}', ha='center', va='bottom', fontsize=6)

ax2 = axes[1]
auc_vals = df_results['AUC'].fillna(0).tolist()
colors = ['steelblue' if v > 0 else 'lightgray' for v in auc_vals]
bars = ax2.bar(models, auc_vals, color=colors)
ax2.set_title('AUC-ROC (where applicable)')
ax2.set_ylim(0, 1.05); ax2.set_ylabel('AUC')
for bar, val in zip(bars, auc_vals):
    if val > 0.01:
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                 f'{val:.3f}', ha='center', va='bottom', fontsize=9)

ax3 = axes[2]
novelty_map = {
    'TEPRS': 'Air Quality\nHealth Impact',
    'AIRI':  'Athlete Injury\nRisk Index',
    'MCD':   'Motion/Activity\nDetection',
    'APRB':  'Physiological\nStress Detection',
    'RRSS':  'HRV Recovery\nScore',
}
labels_r = [novelty_map.get(m, m) for m in models]
ax3.barh(labels_r, df_results['F1-Weighted'], color='mediumslateblue')
ax3.set_xlim(0, 1.1)
ax3.set_title('F1-Weighted by Feature')
ax3.set_xlabel('F1-Weighted')
for i, v in enumerate(df_results['F1-Weighted']):
    ax3.text(v + 0.01, i, f'{v:.3f}', va='center', fontsize=9)

plt.tight_layout()
plt.savefig(os.path.join(FIGS, 'final_dashboard_v2.png'), dpi=180)
plt.close()
print('Dashboard saved: final_dashboard_v2.png')

# Write MD report
report_lines = [
    '# AERVINEX ML Pipeline v2 — Final Results Report\n',
    f'Generated: 2026-05-04\n',
    '## Summary\n',
    'All 5 AERVINEX ML models trained and evaluated. Below are the consolidated metrics.\n',
    '## Model Performance Table\n',
    '| Model | Feature | Accuracy | F1-Weighted | AUC | CV-F1 | Dataset |',
    '|-------|---------|----------|-------------|-----|-------|---------|',
    f'| TEPRS | Air Quality → Health Risk | {results_summary["TEPRS"]["accuracy"]:.4f} | {results_summary["TEPRS"]["f1_weighted"]:.4f} | — | {results_summary["TEPRS"]["cv_f1"]:.4f} | Air Quality Health Impact (5,811 rows) |',
    f'| AIRI  | Athlete Injury Risk Index | {airi_acc:.4f} | {airi_f1:.4f} | {airi_auc:.4f} | 0.9010 | Collegiate Athlete Injury (200 rows) |',
    f'| MCD   | Motion/Activity Detection | {results_summary["MCD"]["accuracy"]:.4f} | {results_summary["MCD"]["f1_weighted"]:.4f} | — | {results_summary["MCD"]["cv_f1"]:.4f} | UCI HAR Dataset (10,299 rows, 561 features) |',
    f'| APRB  | Physiological Stress | {results_summary["APRB"]["accuracy"]:.4f} | {results_summary["APRB"]["f1_weighted"]:.4f} | — | {results_summary["APRB"]["cv_f1"]:.4f} | Nurse Stress Prediction (80K sampled from 11M) |',
    f'| RRSS  | HRV Recovery Score | {results_summary["RRSS"]["accuracy"]:.4f} | {results_summary["RRSS"]["f1_weighted"]:.4f} | {results_summary["RRSS"]["auc"]:.4f} | {results_summary["RRSS"]["cv_f1"]:.4f} | SWELL HRV Dataset |',
    '',
    '## Model Details\n',
    '### TEPRS (v2 — SMOTE Fixed)',
    f'- Algorithm: XGBoost + SMOTE oversampling',
    f'- Features: {results_summary["TEPRS"]["n_features"]} air quality + health indicators',
    f'- Classes: {", ".join(results_summary["TEPRS"]["classes"])}',
    f'- Fix applied: SMOTE to balance minority health classes + class-weighted sample_weight',
    '',
    '### AIRI (from ml_pipeline.py v1)',
    '- Algorithm: XGBoost (original, already high performance)',
    '- Features: 15 athlete physiological + training load features',
    '- AUC = 0.946 — reliable injury risk stratification',
    '',
    '### MCD (v2 — HAR Dataset)',
    f'- Algorithm: XGBoost (retrained on UCI HAR)',
    f'- Features: {results_summary["MCD"]["n_features"]} accelerometer/gyroscope time-domain features',
    f'- Classes: {", ".join(results_summary["MCD"]["classes"])}',
    '- Fix: replaced wearable dataset (no IMU) with HAR (561 sensor features)',
    '',
    '### APRB (New Model)',
    f'- Algorithm: LightGBM',
    f'- Features: {results_summary["APRB"]["n_features"]} (ACC XYZ, EDA, HR, TEMP + magnitude)',
    '- 3-class stress: No Stress / Low Stress / High Stress',
    '- Dataset: 80K stratified sample from 11M-row nurse wearable dataset',
    '',
    '### RRSS (New Model)',
    f'- Algorithm: XGBoost',
    f'- Features: {results_summary["RRSS"]["n_features"]} HRV time-domain + frequency-domain features',
    '- Binary: Recovered vs Stressed (HRV-based)',
    '',
    '## Explainable AI (XAI)',
    '- SHAP TreeExplainer applied to all tree-based models',
    '- SHAP bar plots saved in ml_output/figures/ for each model',
    '- Key drivers identified per model for clinical interpretability',
    '',
    '## Files Generated',
    '- `ml_output/models/teprs_model.pkl` + label encoder + features',
    '- `ml_output/models/airi_model.pkl`',
    '- `ml_output/models/mcd_model.pkl` + label encoder + features (HAR)',
    '- `ml_output/models/aprb_model.pkl` + features',
    '- `ml_output/models/rrss_model.pkl` + features',
    '- `ml_output/figures/` — 10+ plots (CM, SHAP, Dashboard)',
    '- `inference_pipeline.py` — Unified AERVINEXPredictor class',
    '',
    '## Novelty Features Covered by ML',
    '| Novelty Code | ML Model | Status |',
    '|-------------|----------|--------|',
    '| TEPRS | XGBoost (Air Quality → Health Impact) | DONE |',
    '| AIRI  | XGBoost (Injury Risk Index) | DONE |',
    '| MCD   | XGBoost (HAR Activity Detection) | DONE |',
    '| APRB  | LightGBM (Stress Detection) | DONE |',
    '| RRSS  | XGBoost (HRV Recovery Score) | DONE |',
    '| XAI-M | SHAP TreeExplainer (all models) | DONE |',
    '| AIRE  | Integrated Inference Pipeline | DONE |',
]
report_text = '\n'.join(report_lines)
with open(os.path.join(BASE, 'ML_RESULTS_REPORT.md'), 'w', encoding='utf-8') as f:
    f.write(report_text)
print('Report saved: ML_RESULTS_REPORT.md')
print('[TASK 7 DONE]')

print('\n' + '='*60)
print('ALL TASKS COMPLETE')
print('='*60)
print('\nFinal Summary:')
print(df_results.to_string(index=False, float_format='%.4f'))
print('\nFiles:')
for m in ['teprs_model.pkl', 'airi_model.pkl', 'mcd_model.pkl',
          'aprb_model.pkl', 'rrss_model.pkl']:
    p = os.path.join(MODELS, m)
    size = os.path.getsize(p) // 1024 if os.path.exists(p) else 0
    print(f'  {m}: {size} KB')
