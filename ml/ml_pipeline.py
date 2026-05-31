"""
AERVINEX ML Pipeline
==================
Tiga model inti:
  1. TEPRS Classifier   — Air Quality → Health Impact Class (Env risk)
  2. AIRI Classifier    — Athlete Injury Risk Index (Sport Science)
  3. Activity Detector  — Wearable Sports → Activity Status (Context Discriminator)

+ SHAP Explainability (XAI-M) untuk setiap model
"""

import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
import shap
import os, joblib
from pathlib import Path

from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler, label_binarize
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    roc_auc_score, roc_curve, auc, f1_score
)
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE   = Path("C:/Users/mosto/Desktop/aervio")
DATA   = BASE / "data"
OUT    = BASE / "ml_output"
MODELS = OUT / "models"
FIGS   = OUT / "figures"

for d in [OUT, MODELS, FIGS]:
    d.mkdir(parents=True, exist_ok=True)

PALETTE = ["#2196F3", "#4CAF50", "#FF9800", "#F44336", "#9C27B0"]
sns.set_theme(style="whitegrid", palette=PALETTE)

def save_fig(name):
    path = FIGS / f"{name}.png"
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  [saved] {path.name}")

# ══════════════════════════════════════════════════════════════════════════════
# MODEL 1: TEPRS — Air Quality → Health Impact Classification
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("MODEL 1: TEPRS — Air Quality & Health Impact Classifier")
print("="*60)

df_aq = pd.read_csv(DATA / "air-quality/air_quality_health_impact_data.csv")
print(f"Dataset shape: {df_aq.shape}")
print(df_aq["HealthImpactClass"].value_counts().sort_index())

# ─── EDA Plot ─────────────────────────────────────────────────────────────────
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
fig.suptitle("Air Quality & Health Impact — EDA", fontsize=14, fontweight="bold")

env_features = ["AQI", "PM2_5", "PM10", "NO2", "Temperature", "Humidity"]
for ax, col in zip(axes.flatten(), env_features):
    ax.hist(df_aq[col].dropna(), bins=40, color=PALETTE[0], edgecolor="white", alpha=0.85)
    ax.set_title(col)
    ax.set_xlabel(col)
    ax.set_ylabel("Count")
plt.tight_layout()
save_fig("1a_aq_eda_distributions")

# Correlation heatmap
fig, ax = plt.subplots(figsize=(10, 8))
num_cols = ["AQI","PM10","PM2_5","NO2","SO2","O3","Temperature","Humidity",
            "RespiratoryCases","CardiovascularCases","HealthImpactScore"]
corr = df_aq[num_cols].corr()
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(corr, mask=mask, annot=True, fmt=".2f", cmap="coolwarm",
            linewidths=0.5, ax=ax, vmin=-1, vmax=1)
ax.set_title("Correlation Heatmap — Air Quality Features", fontweight="bold")
plt.tight_layout()
save_fig("1b_aq_correlation_heatmap")

# ─── Preprocessing ────────────────────────────────────────────────────────────
features_aq = ["AQI","PM2_5","PM10","NO2","SO2","O3","Temperature","Humidity",
                "WindSpeed","RespiratoryCases","CardiovascularCases","HospitalAdmissions"]
target_aq   = "HealthImpactClass"

X_aq = df_aq[features_aq].copy()
y_aq = df_aq[target_aq].astype(int)

# Map classes to label
class_map = {0:"Baik", 1:"Sedang", 2:"Tidak Sehat", 3:"Sangat Tidak Sehat", 4:"Berbahaya"}
y_labels  = y_aq.map(class_map)

X_train_aq, X_test_aq, y_train_aq, y_test_aq = train_test_split(
    X_aq, y_aq, test_size=0.2, random_state=42, stratify=y_aq
)

scaler_aq = StandardScaler()
X_train_aq_sc = scaler_aq.fit_transform(X_train_aq)
X_test_aq_sc  = scaler_aq.transform(X_test_aq)

# ─── Train & Compare Models ───────────────────────────────────────────────────
models_aq = {
    "Random Forest":   RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1),
    "XGBoost":         XGBClassifier(n_estimators=200, random_state=42, eval_metric="mlogloss", verbosity=0),
    "LightGBM":        LGBMClassifier(n_estimators=200, random_state=42, verbosity=-1),
    "Gradient Boost":  GradientBoostingClassifier(n_estimators=100, random_state=42),
    "Logistic Reg":    LogisticRegression(max_iter=1000, random_state=42),
}

results_aq = {}
print("\nTraining models:")
for name, model in models_aq.items():
    X_tr = X_train_aq_sc if name == "Logistic Reg" else X_train_aq
    X_te = X_test_aq_sc  if name == "Logistic Reg" else X_test_aq
    model.fit(X_tr, y_train_aq)
    y_pred = model.predict(X_te)
    acc  = accuracy_score(y_test_aq, y_pred)
    f1   = f1_score(y_test_aq, y_pred, average="weighted")
    cv   = cross_val_score(model, X_tr, y_train_aq, cv=5, scoring="accuracy").mean()
    results_aq[name] = {"Accuracy": acc, "F1 Weighted": f1, "CV Accuracy": cv}
    print(f"  {name:20s} → Acc={acc:.4f}  F1={f1:.4f}  CV={cv:.4f}")

best_name_aq = max(results_aq, key=lambda k: results_aq[k]["F1 Weighted"])
best_aq      = models_aq[best_name_aq]
print(f"\nBest model: {best_name_aq}")

# Model comparison bar chart
fig, ax = plt.subplots(figsize=(10, 5))
res_df = pd.DataFrame(results_aq).T.reset_index().rename(columns={"index":"Model"})
res_melted = res_df.melt(id_vars="Model", var_name="Metric", value_name="Score")
sns.barplot(data=res_melted, x="Model", y="Score", hue="Metric", ax=ax, palette=PALETTE[:3])
ax.set_title("TEPRS — Model Comparison", fontweight="bold")
ax.set_ylim(0.5, 1.05)
ax.set_xlabel(""); ax.legend(loc="lower right")
plt.xticks(rotation=15)
plt.tight_layout()
save_fig("1c_teprs_model_comparison")

# Confusion matrix for best model
y_pred_best_aq = best_aq.predict(X_test_aq)
cm = confusion_matrix(y_test_aq, y_pred_best_aq)
labels = ["Baik", "Sedang", "Tdk Sehat", "Sgt Tdk Sehat", "Bahaya"]
fig, ax = plt.subplots(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=labels,
            yticklabels=labels, ax=ax)
ax.set_xlabel("Predicted"); ax.set_ylabel("Actual")
ax.set_title(f"TEPRS Confusion Matrix — {best_name_aq}", fontweight="bold")
plt.tight_layout()
save_fig("1d_teprs_confusion_matrix")

# ─── SHAP XAI ─────────────────────────────────────────────────────────────────
print(f"\n[XAI] Computing SHAP for TEPRS ({best_name_aq})...")
explainer_aq = shap.TreeExplainer(best_aq)
shap_vals_aq = explainer_aq.shap_values(X_test_aq)

# SHAP summary — multi-class, pick class "Tidak Sehat" (idx 2)
if isinstance(shap_vals_aq, list):
    sv = shap_vals_aq[2]
else:
    sv = shap_vals_aq

fig, ax = plt.subplots(figsize=(10, 6))
shap.summary_plot(sv, X_test_aq, feature_names=features_aq,
                  show=False, plot_type="bar")
plt.title("TEPRS XAI — Feature Importance (SHAP)\nKelas: Tidak Sehat", fontweight="bold")
plt.tight_layout()
save_fig("1e_teprs_shap_bar")

fig, ax = plt.subplots(figsize=(10, 7))
shap.summary_plot(sv, X_test_aq, feature_names=features_aq, show=False)
plt.title("TEPRS XAI — SHAP Beeswarm (Kelas: Tidak Sehat)", fontweight="bold")
plt.tight_layout()
save_fig("1f_teprs_shap_beeswarm")

# ─── Save TEPRS model ─────────────────────────────────────────────────────────
joblib.dump(best_aq,    MODELS / "teprs_model.pkl")
joblib.dump(scaler_aq,  MODELS / "teprs_scaler.pkl")
print(f"[saved] teprs_model.pkl ({best_name_aq})")
print(f"\nClassification Report:\n{classification_report(y_test_aq, y_pred_best_aq, target_names=labels)}")


# ══════════════════════════════════════════════════════════════════════════════
# MODEL 2: AIRI — Athlete Injury Risk Index Classifier
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("MODEL 2: AIRI — Athlete Injury Risk Index Classifier")
print("="*60)

df_inj = pd.read_csv(DATA / "athlete-injury/collegiate_athlete_injury_dataset.csv")
print(f"Dataset shape: {df_inj.shape}")
print(df_inj["Injury_Indicator"].value_counts())

# ─── EDA Plot ─────────────────────────────────────────────────────────────────
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
fig.suptitle("Athlete Injury Dataset — EDA", fontsize=14, fontweight="bold")
inj_features_vis = ["Training_Intensity","Training_Hours_Per_Week","Fatigue_Score",
                     "Recovery_Days_Per_Week","ACL_Risk_Score","Load_Balance_Score"]
for ax, col in zip(axes.flatten(), inj_features_vis):
    df_inj.boxplot(column=col, by="Injury_Indicator", ax=ax,
                   boxprops=dict(color=PALETTE[0]),
                   medianprops=dict(color=PALETTE[3]))
    ax.set_title(col, fontsize=9)
    ax.set_xlabel("Injury (0=No, 1=Yes)")
plt.suptitle("Injury Indicator vs. Key Features", fontweight="bold")
plt.tight_layout()
save_fig("2a_airi_eda_boxplots")

# Injury rate by position
fig, ax = plt.subplots(figsize=(10, 4))
inj_rate = df_inj.groupby("Position")["Injury_Indicator"].mean().sort_values(ascending=False)
inj_rate.plot(kind="bar", ax=ax, color=PALETTE[3], edgecolor="white")
ax.set_title("Injury Rate by Position", fontweight="bold")
ax.set_ylabel("Injury Rate")
ax.set_xlabel("")
plt.xticks(rotation=30)
plt.tight_layout()
save_fig("2b_airi_injury_by_position")

# ─── Preprocessing ────────────────────────────────────────────────────────────
le_pos = LabelEncoder()
le_gen = LabelEncoder()
df_inj["Position_enc"] = le_pos.fit_transform(df_inj["Position"])
df_inj["Gender_enc"]   = le_gen.fit_transform(df_inj["Gender"])

features_inj = ["Age","Height_cm","Weight_kg","Training_Intensity",
                 "Training_Hours_Per_Week","Recovery_Days_Per_Week",
                 "Match_Count_Per_Week","Rest_Between_Events_Days",
                 "Fatigue_Score","Performance_Score","Team_Contribution_Score",
                 "Load_Balance_Score","ACL_Risk_Score","Position_enc","Gender_enc"]
target_inj = "Injury_Indicator"

X_inj = df_inj[features_inj]
y_inj = df_inj[target_inj]

X_train_inj, X_test_inj, y_train_inj, y_test_inj = train_test_split(
    X_inj, y_inj, test_size=0.2, random_state=42, stratify=y_inj
)

# ─── Train & Compare Models ───────────────────────────────────────────────────
models_inj = {
    "Random Forest":  RandomForestClassifier(n_estimators=200, random_state=42),
    "XGBoost":        XGBClassifier(n_estimators=200, random_state=42, eval_metric="logloss", verbosity=0),
    "LightGBM":       LGBMClassifier(n_estimators=200, random_state=42, verbosity=-1),
    "Gradient Boost": GradientBoostingClassifier(n_estimators=100, random_state=42),
}

results_inj = {}
print("\nTraining models:")
for name, model in models_inj.items():
    model.fit(X_train_inj, y_train_inj)
    y_pred = model.predict(X_test_inj)
    acc = accuracy_score(y_test_inj, y_pred)
    f1  = f1_score(y_test_inj, y_pred, average="weighted")
    cv  = cross_val_score(model, X_inj, y_inj, cv=5, scoring="accuracy").mean()
    results_inj[name] = {"Accuracy": acc, "F1 Weighted": f1, "CV Accuracy": cv}
    print(f"  {name:20s} → Acc={acc:.4f}  F1={f1:.4f}  CV={cv:.4f}")

best_name_inj = max(results_inj, key=lambda k: results_inj[k]["F1 Weighted"])
best_inj      = models_inj[best_name_inj]
print(f"\nBest model: {best_name_inj}")

# Model comparison
fig, ax = plt.subplots(figsize=(10, 5))
res_df2 = pd.DataFrame(results_inj).T.reset_index().rename(columns={"index":"Model"})
res_m2  = res_df2.melt(id_vars="Model", var_name="Metric", value_name="Score")
sns.barplot(data=res_m2, x="Model", y="Score", hue="Metric", ax=ax, palette=PALETTE[:3])
ax.set_title("AIRI — Model Comparison", fontweight="bold")
ax.set_ylim(0.5, 1.05)
ax.set_xlabel(""); ax.legend(loc="lower right")
plt.xticks(rotation=15)
plt.tight_layout()
save_fig("2c_airi_model_comparison")

# Confusion matrix
y_pred_best_inj = best_inj.predict(X_test_inj)
cm2 = confusion_matrix(y_test_inj, y_pred_best_inj)
fig, ax = plt.subplots(figsize=(6, 5))
sns.heatmap(cm2, annot=True, fmt="d", cmap="Reds",
            xticklabels=["No Injury","Injury"], yticklabels=["No Injury","Injury"], ax=ax)
ax.set_xlabel("Predicted"); ax.set_ylabel("Actual")
ax.set_title(f"AIRI Confusion Matrix — {best_name_inj}", fontweight="bold")
plt.tight_layout()
save_fig("2d_airi_confusion_matrix")

# ROC Curve
y_prob_inj = best_inj.predict_proba(X_test_inj)[:,1]
fpr, tpr, _ = roc_curve(y_test_inj, y_prob_inj)
roc_auc = auc(fpr, tpr)
fig, ax = plt.subplots(figsize=(7, 5))
ax.plot(fpr, tpr, color=PALETTE[3], lw=2, label=f"AUC = {roc_auc:.4f}")
ax.plot([0,1],[0,1], "--", color="gray", lw=1)
ax.set_xlabel("False Positive Rate"); ax.set_ylabel("True Positive Rate")
ax.set_title(f"AIRI ROC Curve — {best_name_inj}", fontweight="bold")
ax.legend(loc="lower right")
plt.tight_layout()
save_fig("2e_airi_roc_curve")

# ─── SHAP XAI ─────────────────────────────────────────────────────────────────
print(f"\n[XAI] Computing SHAP for AIRI ({best_name_inj})...")
explainer_inj = shap.TreeExplainer(best_inj)
shap_vals_inj = explainer_inj.shap_values(X_test_inj)

sv_inj = shap_vals_inj[1] if isinstance(shap_vals_inj, list) else shap_vals_inj

fig, ax = plt.subplots(figsize=(10, 6))
shap.summary_plot(sv_inj, X_test_inj, feature_names=features_inj, show=False, plot_type="bar")
plt.title("AIRI XAI — Feature Importance (SHAP)\nKelas: Injury = 1", fontweight="bold")
plt.tight_layout()
save_fig("2f_airi_shap_bar")

fig, ax = plt.subplots(figsize=(10, 7))
shap.summary_plot(sv_inj, X_test_inj, feature_names=features_inj, show=False)
plt.title("AIRI XAI — SHAP Beeswarm (Injury Risk)", fontweight="bold")
plt.tight_layout()
save_fig("2g_airi_shap_beeswarm")

# ─── Save AIRI model ──────────────────────────────────────────────────────────
joblib.dump(best_inj, MODELS / "airi_model.pkl")
print(f"[saved] airi_model.pkl ({best_name_inj})")
print(f"\nClassification Report:\n{classification_report(y_test_inj, y_pred_best_inj, target_names=['No Injury','Injury'])}")


# ══════════════════════════════════════════════════════════════════════════════
# MODEL 3: Activity Detector (MCD) — Wearable Sports → Activity Status
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("MODEL 3: MCD — Activity Status Classifier (Context Discriminator)")
print("="*60)

df_ws = pd.read_csv(DATA / "wearable-sports/wearable_sports_health_dataset.csv")
print(f"Dataset shape: {df_ws.shape}")
print(df_ws["Activity_Status"].value_counts())

# Parse Blood Pressure → Systolic/Diastolic
bp = df_ws["Blood_Pressure"].str.split("/", expand=True)
df_ws["BP_Systolic"]  = pd.to_numeric(bp[0], errors="coerce")
df_ws["BP_Diastolic"] = pd.to_numeric(bp[1], errors="coerce")

# ─── EDA Plot ─────────────────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 4, figsize=(16, 5))
fig.suptitle("Wearable Sports Dataset — EDA by Activity Status", fontsize=13, fontweight="bold")
for ax, col in zip(axes, ["Heart_Rate","Body_Temperature","Blood_Oxygen","Step_Count"]):
    df_ws.boxplot(column=col, by="Activity_Status", ax=ax)
    ax.set_title(col); ax.set_xlabel("")
plt.tight_layout()
save_fig("3a_ws_eda_activity_boxplots")

# Distribution of Heart Rate
fig, ax = plt.subplots(figsize=(10, 5))
for act in df_ws["Activity_Status"].unique():
    subset = df_ws[df_ws["Activity_Status"] == act]["Heart_Rate"]
    ax.hist(subset, bins=30, alpha=0.6, label=act, edgecolor="white")
ax.set_title("Heart Rate Distribution by Activity Status", fontweight="bold")
ax.set_xlabel("Heart Rate (bpm)"); ax.set_ylabel("Count")
ax.legend()
plt.tight_layout()
save_fig("3b_ws_hr_distribution")

# ─── Preprocessing ────────────────────────────────────────────────────────────
le_act = LabelEncoder()
df_ws["Activity_enc"] = le_act.fit_transform(df_ws["Activity_Status"])

features_ws = ["Heart_Rate","Body_Temperature","Blood_Oxygen","Step_Count",
               "BP_Systolic","BP_Diastolic"]
df_ws_clean = df_ws[features_ws + ["Activity_enc"]].dropna()

X_ws = df_ws_clean[features_ws]
y_ws = df_ws_clean["Activity_enc"]

X_train_ws, X_test_ws, y_train_ws, y_test_ws = train_test_split(
    X_ws, y_ws, test_size=0.2, random_state=42, stratify=y_ws
)

# ─── Train & Compare Models ───────────────────────────────────────────────────
models_ws = {
    "Random Forest":  RandomForestClassifier(n_estimators=200, random_state=42),
    "XGBoost":        XGBClassifier(n_estimators=200, random_state=42, eval_metric="mlogloss", verbosity=0),
    "LightGBM":       LGBMClassifier(n_estimators=200, random_state=42, verbosity=-1),
    "Gradient Boost": GradientBoostingClassifier(n_estimators=100, random_state=42),
}

results_ws = {}
print("\nTraining models:")
for name, model in models_ws.items():
    model.fit(X_train_ws, y_train_ws)
    y_pred = model.predict(X_test_ws)
    acc = accuracy_score(y_test_ws, y_pred)
    f1  = f1_score(y_test_ws, y_pred, average="weighted")
    cv  = cross_val_score(model, X_ws, y_ws, cv=5, scoring="accuracy").mean()
    results_ws[name] = {"Accuracy": acc, "F1 Weighted": f1, "CV Accuracy": cv}
    print(f"  {name:20s} → Acc={acc:.4f}  F1={f1:.4f}  CV={cv:.4f}")

best_name_ws = max(results_ws, key=lambda k: results_ws[k]["F1 Weighted"])
best_ws      = models_ws[best_name_ws]
print(f"\nBest model: {best_name_ws}")

# Model comparison
fig, ax = plt.subplots(figsize=(10, 5))
res_df3 = pd.DataFrame(results_ws).T.reset_index().rename(columns={"index":"Model"})
res_m3  = res_df3.melt(id_vars="Model", var_name="Metric", value_name="Score")
sns.barplot(data=res_m3, x="Model", y="Score", hue="Metric", ax=ax, palette=PALETTE[:3])
ax.set_title("MCD (Activity Detector) — Model Comparison", fontweight="bold")
ax.set_ylim(0.5, 1.05)
ax.set_xlabel(""); ax.legend(loc="lower right")
plt.xticks(rotation=15)
plt.tight_layout()
save_fig("3c_mcd_model_comparison")

# Confusion matrix
y_pred_best_ws = best_ws.predict(X_test_ws)
cm3 = confusion_matrix(y_test_ws, y_pred_best_ws)
act_labels = le_act.classes_
fig, ax = plt.subplots(figsize=(8, 6))
sns.heatmap(cm3, annot=True, fmt="d", cmap="Greens",
            xticklabels=act_labels, yticklabels=act_labels, ax=ax)
ax.set_xlabel("Predicted"); ax.set_ylabel("Actual")
ax.set_title(f"MCD Confusion Matrix — {best_name_ws}", fontweight="bold")
plt.xticks(rotation=30); plt.yticks(rotation=0)
plt.tight_layout()
save_fig("3d_mcd_confusion_matrix")

# ─── SHAP XAI ─────────────────────────────────────────────────────────────────
print(f"\n[XAI] Computing SHAP for MCD ({best_name_ws})...")
explainer_ws = shap.TreeExplainer(best_ws)
shap_vals_ws = explainer_ws.shap_values(X_test_ws)

sv_ws = shap_vals_ws[0] if isinstance(shap_vals_ws, list) else shap_vals_ws

fig, ax = plt.subplots(figsize=(9, 5))
shap.summary_plot(sv_ws, X_test_ws, feature_names=features_ws, show=False, plot_type="bar")
plt.title("MCD XAI — Feature Importance (SHAP)", fontweight="bold")
plt.tight_layout()
save_fig("3e_mcd_shap_bar")

# ─── Save MCD model ───────────────────────────────────────────────────────────
joblib.dump(best_ws,  MODELS / "mcd_model.pkl")
joblib.dump(le_act,   MODELS / "mcd_label_encoder.pkl")
print(f"[saved] mcd_model.pkl ({best_name_ws})")
print(f"\nClassification Report:\n{classification_report(y_test_ws, y_pred_best_ws, target_names=act_labels)}")


# ══════════════════════════════════════════════════════════════════════════════
# SUMMARY DASHBOARD
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("GENERATING SUMMARY DASHBOARD")
print("="*60)

fig = plt.figure(figsize=(18, 6))
gs  = gridspec.GridSpec(1, 3, figure=fig, wspace=0.4)
fig.suptitle("AERVINEX ML Pipeline — Model Summary Dashboard", fontsize=15, fontweight="bold")

summary = {
    "TEPRS\n(Air Quality Risk)": results_aq[best_name_aq],
    "AIRI\n(Injury Risk)":       results_inj[best_name_inj],
    "MCD\n(Activity Detect)":    results_ws[best_name_ws],
}

for idx, (title, metrics) in enumerate(summary.items()):
    ax = fig.add_subplot(gs[idx])
    keys   = list(metrics.keys())
    values = list(metrics.values())
    bars   = ax.bar(keys, values, color=PALETTE[:3], edgecolor="white", width=0.5)
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
                f"{val:.3f}", ha="center", va="bottom", fontsize=10, fontweight="bold")
    ax.set_title(title, fontweight="bold", fontsize=11)
    ax.set_ylim(0, 1.15)
    ax.set_ylabel("Score")
    ax.set_xlabel("")
    ax.tick_params(axis="x", labelsize=8)

plt.tight_layout()
save_fig("0_AERVINEX_summary_dashboard")

# ─── Print Final Summary ───────────────────────────────────────────────────────
print("\n" + "="*60)
print("FINAL SUMMARY — AERVINEX ML PIPELINE")
print("="*60)

for model_name, result_dict, best in [
    ("TEPRS (Air Quality)", results_aq, best_name_aq),
    ("AIRI (Injury Risk)",  results_inj, best_name_inj),
    ("MCD (Activity)",      results_ws,  best_name_ws),
]:
    r = result_dict[best]
    print(f"\n{model_name}")
    print(f"  Best Algorithm : {best}")
    print(f"  Accuracy       : {r['Accuracy']:.4f}")
    print(f"  F1 Weighted    : {r['F1 Weighted']:.4f}")
    print(f"  CV Accuracy    : {r['CV Accuracy']:.4f}")

print(f"\nOutput:")
print(f"  Models  → {MODELS}")
print(f"  Figures → {FIGS}")
print(f"\n{'='*60}")
print("Pipeline selesai.")
