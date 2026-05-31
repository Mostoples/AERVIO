import pandas as pd
import numpy as np
import json
import warnings
warnings.filterwarnings('ignore')

base = 'C:/Users/mosto/Desktop/aervio/data/kaggle'
out  = 'C:/Users/mosto/Desktop/aervio/public/data/encyclopedia.json'

result = {}

def stats(s):
    s = s.dropna()
    return {
        'mean':   round(float(s.mean()), 2),
        'median': round(float(s.median()), 2),
        'std':    round(float(s.std()), 2),
        'min':    round(float(s.min()), 2),
        'max':    round(float(s.max()), 2),
        'p25':    round(float(s.quantile(0.25)), 2),
        'p75':    round(float(s.quantile(0.75)), 2),
    }

# === 1. AIR QUALITY & HEALTH IMPACT =========================================
print('Processing air quality...')
aq = pd.read_csv(base + '/air-quality-health/air_quality_health_impact_data.csv')

class_labels = {0: 'Baik', 1: 'Sedang', 2: 'Tidak Sehat', 3: 'Sangat Tidak Sehat', 4: 'Berbahaya'}
aq_by_class = {}
for cls, grp in aq.groupby('HealthImpactClass'):
    label = class_labels.get(int(cls), str(int(cls)))
    aq_by_class[label] = {
        'count': int(len(grp)),
        'pm25': stats(grp['PM2_5']),
        'aqi':  stats(grp['AQI']),
        'respiratory_cases':   stats(grp['RespiratoryCases']),
        'cardiovascular_cases': stats(grp['CardiovascularCases']),
        'hospital_admissions': stats(grp['HospitalAdmissions']),
    }

result['air_quality'] = {
    'source': 'Kaggle: Air Quality and Health Impact Dataset',
    'total_records': int(len(aq)),
    'overall': {
        'pm25':     stats(aq['PM2_5']),
        'aqi':      stats(aq['AQI']),
        'pm10':     stats(aq['PM10']),
        'no2':      stats(aq['NO2']),
        'so2':      stats(aq['SO2']),
        'o3':       stats(aq['O3']),
        'temp':     stats(aq['Temperature']),
        'humidity': stats(aq['Humidity']),
        'wind':     stats(aq['WindSpeed']),
    },
    'by_health_class': aq_by_class,
    'correlations': {
        'pm25_vs_hospital':    round(float(aq['PM2_5'].corr(aq['HospitalAdmissions'])), 3),
        'aqi_vs_respiratory':  round(float(aq['AQI'].corr(aq['RespiratoryCases'])), 3),
        'temp_vs_hospital':    round(float(aq['Temperature'].corr(aq['HospitalAdmissions'])), 3),
        'no2_vs_cardiovascular': round(float(aq['NO2'].corr(aq['CardiovascularCases'])), 3),
    }
}
print(f'  Done: {len(aq)} rows, {len(aq_by_class)} classes')

# === 2. ATHLETE INJURY ======================================================
print('Processing athlete injury...')
ai = pd.read_csv(base + '/athlete-injury/collegiate_athlete_injury_dataset.csv')

injured = ai[ai['Injury_Indicator'] == 1]
healthy = ai[ai['Injury_Indicator'] == 0]

def group_profile(grp):
    return {
        'count': int(len(grp)),
        'age':                stats(grp['Age']),
        'training_intensity': stats(grp['Training_Intensity']),
        'training_hours':     stats(grp['Training_Hours_Per_Week']),
        'recovery_days':      stats(grp['Recovery_Days_Per_Week']),
        'fatigue_score':      stats(grp['Fatigue_Score']),
        'performance_score':  stats(grp['Performance_Score']),
        'acl_risk':           stats(grp['ACL_Risk_Score']),
        'load_balance':       stats(grp['Load_Balance_Score']),
    }

by_position = {}
for pos, grp in ai.groupby('Position'):
    by_position[pos] = {
        'count':                   int(len(grp)),
        'injury_rate_pct':         round(float(grp['Injury_Indicator'].mean() * 100), 1),
        'avg_fatigue':             round(float(grp['Fatigue_Score'].mean()), 1),
        'avg_training_intensity':  round(float(grp['Training_Intensity'].mean()), 1),
        'avg_recovery_days':       round(float(grp['Recovery_Days_Per_Week'].mean()), 1),
    }

by_gender = {}
for g, grp in ai.groupby('Gender'):
    by_gender[g] = {
        'count':           int(len(grp)),
        'injury_rate_pct': round(float(grp['Injury_Indicator'].mean() * 100), 1),
        'avg_fatigue':     round(float(grp['Fatigue_Score'].mean()), 1),
    }

result['athlete_injury'] = {
    'source': 'Kaggle: Collegiate Athlete Injury Dataset',
    'total_records': int(len(ai)),
    'injury_rate_pct': round(float(ai['Injury_Indicator'].mean() * 100), 1),
    'injured': group_profile(injured),
    'healthy':  group_profile(healthy),
    'by_position': by_position,
    'by_gender': by_gender,
    'risk_correlations': {
        'fatigue':           round(float(ai['Fatigue_Score'].corr(ai['Injury_Indicator'])), 3),
        'training_intensity': round(float(ai['Training_Intensity'].corr(ai['Injury_Indicator'])), 3),
        'acl_risk':          round(float(ai['ACL_Risk_Score'].corr(ai['Injury_Indicator'])), 3),
        'load_balance':      round(float(ai['Load_Balance_Score'].corr(ai['Injury_Indicator'])), 3),
        'recovery_days':     round(float(ai['Recovery_Days_Per_Week'].corr(ai['Injury_Indicator'])), 3),
    }
}
print(f'  Done: {len(ai)} rows — {len(injured)} injured ({result["athlete_injury"]["injury_rate_pct"]}%)')

# === 3. WEARABLE SPORTS HEALTH ==============================================
print('Processing wearable sports...')
ws = pd.read_csv(base + '/wearable-sports/wearable_sports_health_dataset.csv')

by_activity = {}
for act, grp in ws.groupby('Activity_Status'):
    by_activity[act] = {
        'count': int(len(grp)),
        'hr':    stats(grp['Heart_Rate']),
        'spo2':  stats(grp['Blood_Oxygen']),
        'temp':  stats(grp['Body_Temperature']),
        'steps': stats(grp['Step_Count']),
    }

result['wearable_health'] = {
    'source': 'Kaggle: Wearable Sports Health Monitoring Dataset',
    'total_records': int(len(ws)),
    'overall': {
        'hr':    stats(ws['Heart_Rate']),
        'spo2':  stats(ws['Blood_Oxygen']),
        'temp':  stats(ws['Body_Temperature']),
        'steps': stats(ws['Step_Count']),
    },
    'by_activity': by_activity,
}
print(f'  Done: {len(ws)} rows, {len(by_activity)} activity types')

# === 4. HRV SWELL ===========================================================
print('Processing HRV SWELL (large dataset)...')
hrv = pd.read_csv(base + '/hrv-swell/hrv dataset/data/final/train.csv')

hrv_by_cond = {}
for cond, grp in hrv.groupby('condition'):
    hrv_by_cond[str(cond)] = {
        'count':   int(len(grp)),
        'hr':      stats(grp['HR']),
        'mean_rr': stats(grp['MEAN_RR']),
        'rmssd':   stats(grp['RMSSD']),
        'sdrr':    stats(grp['SDRR']),
        'pnn25':   stats(grp['pNN25']),
        'pnn50':   stats(grp['pNN50']),
        'sd1':     stats(grp['SD1']),
        'sd2':     stats(grp['SD2']),
        'lf_hf':   stats(grp['LF_HF']),
        'sampen':  stats(grp['sampen']),
        'higuci':  stats(grp['higuci']),
    }

result['hrv_reference'] = {
    'source': 'Kaggle: SWELL Heart Rate Variability Dataset',
    'total_records': int(len(hrv)),
    'overall': {
        'hr':    stats(hrv['HR']),
        'rmssd': stats(hrv['RMSSD']),
        'sdrr':  stats(hrv['SDRR']),
        'pnn50': stats(hrv['pNN50']),
        'lf_hf': stats(hrv['LF_HF']),
        'sampen':stats(hrv['sampen']),
        'higuci':stats(hrv['higuci']),
    },
    'by_condition': hrv_by_cond,
}
print(f'  Done: {len(hrv)} rows, {len(hrv_by_cond)} conditions: {list(hrv_by_cond.keys())}')

# === SAVE ===================================================================
with open(out, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

import os
size_kb = os.path.getsize(out) / 1024
print(f'\nDONE. encyclopedia.json => {size_kb:.1f} KB')
