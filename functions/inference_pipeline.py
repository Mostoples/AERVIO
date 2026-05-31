"""
AERVINEX Integrated Inference Pipeline — Cloud Functions edition
"""
import numpy as np
import joblib, os

_MODEL_DIR = os.path.join(os.path.dirname(__file__), 'ml_models')

def _load(name):
    return joblib.load(os.path.join(_MODEL_DIR, name))

class AERVINEXPredictor:
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

    def predict_air_health(self, aqi=50, pm25=15, pm10=25, no2=0, so2=0, o3=0,
                           temperature=30, humidity=70, wind_speed=5,
                           resp_cases=0, cardio_cases=0, hosp_admissions=0):
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
        pred  = self._teprs_model.predict(X)[0]
        probs = self._teprs_model.predict_proba(X)[0]
        label = self._teprs_le.inverse_transform([pred])[0]
        return {
            'class': int(pred), 'label': str(label),
            'confidence': float(probs.max()),
            'probabilities': {str(self._teprs_le.inverse_transform([i])[0]): float(p) for i, p in enumerate(probs)},
        }

    def predict_injury_risk(self, age=25, height_cm=170, weight_kg=65,
                            training_intensity=70, training_hours_pw=5,
                            recovery_days_pw=2, match_count_pw=1,
                            rest_between_events=1, fatigue_score=30,
                            performance_score=70, team_contribution=0.5,
                            load_balance=80, acl_risk=0,
                            position='midfielder', gender='male'):
        pos_enc = {'goalkeeper':0,'defender':1,'midfielder':2,'forward':3}.get(str(position).lower(),2)
        gen_enc = 0 if str(gender).lower() == 'female' else 1
        X = np.array([[age, height_cm, weight_kg, training_intensity,
                       training_hours_pw, recovery_days_pw, match_count_pw,
                       rest_between_events, fatigue_score, performance_score,
                       team_contribution, load_balance, acl_risk, pos_enc, gen_enc]])
        pred = self._airi_model.predict(X)[0]
        prob = float(self._airi_model.predict_proba(X)[0][1])
        return {
            'injury_risk': int(pred), 'risk_probability': prob,
            'risk_level': 'HIGH' if prob > 0.7 else 'MEDIUM' if prob > 0.4 else 'LOW',
        }

    def predict_stress(self, acc_x=0, acc_y=0, acc_z=9.8, eda=2.0, hr=70, temp=36.5):
        mag = float(np.sqrt(float(acc_x)**2 + float(acc_y)**2 + float(acc_z)**2))
        feat_map = {'X': acc_x, 'Y': acc_y, 'Z': acc_z,
                    'EDA': eda, 'HR': hr, 'TEMP': temp, 'acc_magnitude': mag}
        X = np.array([[feat_map.get(f, 0) for f in self._aprb_feat]])
        pred  = self._aprb_model.predict(X)[0]
        probs = self._aprb_model.predict_proba(X)[0]
        labels = {0:'No Stress', 1:'Low Stress', 2:'High Stress'}
        return {
            'stress_level': int(pred), 'label': labels.get(int(pred), 'Unknown'),
            'confidence': float(probs.max()),
        }

    def predict_recovery(self, mean_rr=850, median_rr=840, sdrr=45, rmssd=38,
                         sdsd=30, sdrr_rmssd=1.2, hr=68, pnn25=0.3, pnn50=0.2,
                         sd1=27, sd2=61, kurt=2.1, skew=0.1, vlf=120, lf=400,
                         hf=300, lf_hf=1.3, hf_lf=0.77, sampen=1.5, higuci=1.8):
        feat_map = {
            'MEAN_RR':mean_rr, 'MEDIAN_RR':median_rr, 'SDRR':sdrr,
            'RMSSD':rmssd, 'SDSD':sdsd, 'SDRR_RMSSD':sdrr_rmssd,
            'HR':hr, 'pNN25':pnn25, 'pNN50':pnn50, 'SD1':sd1, 'SD2':sd2,
            'KURT':kurt, 'SKEW':skew, 'VLF':vlf, 'LF':lf, 'HF':hf,
            'LF_HF':lf_hf, 'HF_LF':hf_lf, 'sampen':sampen, 'higuci':higuci,
        }
        X = np.array([[feat_map.get(f, 0) for f in self._rrss_feat]])
        pred = self._rrss_model.predict(X)[0]
        prob_recovered = float(self._rrss_model.predict_proba(X)[0][1])
        return {
            'recovered': bool(pred),
            'recovery_score': round(prob_recovered * 100, 1),
            'status': 'RECOVERED' if pred else 'STRESSED',
        }

    def full_assessment(self, env: dict, athlete: dict, stress: dict, hrv: dict) -> dict:
        return {
            'teprs':    self.predict_air_health(**env),
            'airi':     self.predict_injury_risk(**athlete),
            'aprb':     self.predict_stress(**stress),
            'rrss':     self.predict_recovery(**hrv),
        }
