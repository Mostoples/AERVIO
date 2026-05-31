"""
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
