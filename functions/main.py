"""
AERVINEX Cloud Functions — ML Inference API
Endpoints: predict_teprs, predict_airi, predict_aprb, predict_rrss, predict_all
"""
import json, traceback
from firebase_functions import https_fn
from firebase_admin import initialize_app

initialize_app()

# ── Lazy-loaded predictor (cached across warm invocations) ──────────────
_predictor = None

def _get_predictor():
    global _predictor
    if _predictor is None:
        from inference_pipeline import AERVINEXPredictor
        _predictor = AERVINEXPredictor()
    return _predictor

# ── SHAP helper ──────────────────────────────────────────────────────────
def _shap_contributions(model, X, feature_names):
    try:
        import shap, numpy as np
        explainer = shap.TreeExplainer(model)
        sv = explainer.shap_values(X)
        if isinstance(sv, list):
            sv = sv[1] if len(sv) > 1 else sv[0]
        vals = sv[0] if hasattr(sv, '__len__') and len(sv.shape) > 1 else sv
        contribs = {str(f): float(v) for f, v in zip(feature_names, vals)}
        # Sort by absolute value, top 6
        top = sorted(contribs.items(), key=lambda x: abs(x[1]), reverse=True)[:6]
        return dict(top)
    except Exception:
        return {}

# ── CORS helper ──────────────────────────────────────────────────────────
_CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def _ok(data: dict):
    return https_fn.Response(
        response=json.dumps({'ok': True, **data}),
        status=200,
        headers={**_CORS, 'Content-Type': 'application/json'}
    )

def _err(msg: str, code: int = 500):
    return https_fn.Response(
        response=json.dumps({'ok': False, 'error': msg}),
        status=code,
        headers={**_CORS, 'Content-Type': 'application/json'}
    )

def _preflight():
    return https_fn.Response(response='', status=204, headers=_CORS)

# ════════════════════════════════════════════════════════════════════════
# F2 — TEPRS: Environment → Health Risk Score
# ════════════════════════════════════════════════════════════════════════
@https_fn.on_request()
def predict_teprs(req: https_fn.Request) -> https_fn.Response:
    if req.method == 'OPTIONS':
        return _preflight()
    try:
        p = _get_predictor()
        d = req.get_json(silent=True) or {}
        # Fill missing env pollutants with safe defaults
        params = {
            'aqi':         float(d.get('aqi',  d.get('pm25', 15) * 4)),
            'pm25':        float(d.get('pm25', 15)),
            'pm10':        float(d.get('pm10', d.get('pm25', 15) * 1.8)),
            'no2':         float(d.get('no2',  0)),
            'so2':         float(d.get('so2',  0)),
            'o3':          float(d.get('o3',   0)),
            'temperature': float(d.get('temperature', 30)),
            'humidity':    float(d.get('humidity', 70)),
            'wind_speed':  float(d.get('wind_speed', 5)),
        }
        result = p.predict_air_health(**params)
        # SHAP (only if requested)
        shap_vals = {}
        if d.get('include_shap'):
            import numpy as np
            X = np.array([[params[f] if f in params else 0
                           for f in ['AQI','PM2.5','PM10','NO2','SO2','O3',
                                     'Temperature','Humidity','Wind Speed']]])
            shap_vals = _shap_contributions(p._teprs_model, X,
                ['AQI','PM2.5','PM10','NO2','SO2','O3','Temp','Humidity','Wind'])
        return _ok({**result, 'shap': shap_vals, 'inputs': params})
    except Exception as e:
        return _err(str(e))


# ════════════════════════════════════════════════════════════════════════
# F8 — AIRI: Athlete Injury Risk Index
# ════════════════════════════════════════════════════════════════════════
@https_fn.on_request()
def predict_airi(req: https_fn.Request) -> https_fn.Response:
    if req.method == 'OPTIONS':
        return _preflight()
    try:
        p = _get_predictor()
        d = req.get_json(silent=True) or {}
        params = {
            'age':                 int(d.get('age', 25)),
            'height_cm':           float(d.get('height_cm', 170)),
            'weight_kg':           float(d.get('weight_kg', 65)),
            'training_intensity':  float(d.get('training_intensity', 70)),
            'training_hours_pw':   float(d.get('training_hours_pw', 5)),
            'recovery_days_pw':    float(d.get('recovery_days_pw', 2)),
            'match_count_pw':      float(d.get('match_count_pw', 1)),
            'rest_between_events': float(d.get('rest_between_events', 1)),
            'fatigue_score':       float(d.get('fatigue_score', 30)),
            'performance_score':   float(d.get('performance_score', 70)),
            'team_contribution':   float(d.get('team_contribution', 0.5)),
            'load_balance':        float(d.get('load_balance', 80)),
            'acl_risk':            float(d.get('acl_risk', 0)),
            'position':            str(d.get('position', 'midfielder')),
            'gender':              str(d.get('gender', 'male')),
        }
        result = p.predict_injury_risk(**params)
        shap_vals = {}
        if d.get('include_shap'):
            import numpy as np
            pos_enc = {'goalkeeper':0,'defender':1,'midfielder':2,'forward':3}.get(params['position'],2)
            gen_enc = 0 if params['gender']=='female' else 1
            X = np.array([[params['age'],params['height_cm'],params['weight_kg'],
                           params['training_intensity'],params['training_hours_pw'],
                           params['recovery_days_pw'],params['match_count_pw'],
                           params['rest_between_events'],params['fatigue_score'],
                           params['performance_score'],params['team_contribution'],
                           params['load_balance'],params['acl_risk'],pos_enc,gen_enc]])
            shap_vals = _shap_contributions(p._airi_model, X,
                ['Age','Height','Weight','Intensity','Hours/wk','Recovery Days',
                 'Matches/wk','Rest','Fatigue','Performance','Team','Load Bal','ACL Risk',
                 'Position','Gender'])
        return _ok({**result, 'shap': shap_vals})
    except Exception as e:
        return _err(str(e))


# ════════════════════════════════════════════════════════════════════════
# F5 — APRB: Stress Detection (Adaptive Personal Risk Baseline)
# ════════════════════════════════════════════════════════════════════════
@https_fn.on_request()
def predict_aprb(req: https_fn.Request) -> https_fn.Response:
    if req.method == 'OPTIONS':
        return _preflight()
    try:
        p = _get_predictor()
        d = req.get_json(silent=True) or {}
        params = {
            'acc_x': float(d.get('acc_x', 0)),
            'acc_y': float(d.get('acc_y', 0)),
            'acc_z': float(d.get('acc_z', 9.8)),
            'eda':   float(d.get('eda', 2.0)),
            'hr':    float(d.get('hr', 70)),
            'temp':  float(d.get('temp', 36.5)),
        }
        result = p.predict_stress(**params)
        shap_vals = {}
        if d.get('include_shap'):
            import numpy as np
            mag = float(np.sqrt(params['acc_x']**2+params['acc_y']**2+params['acc_z']**2))
            X = np.array([[params['acc_x'],params['acc_y'],params['acc_z'],
                           params['eda'],params['hr'],params['temp'],mag]])
            shap_vals = _shap_contributions(p._aprb_model, X,
                ['Acc-X','Acc-Y','Acc-Z','EDA','HR','Temp','Acc-Mag'])
        return _ok({**result, 'shap': shap_vals})
    except Exception as e:
        return _err(str(e))


# ════════════════════════════════════════════════════════════════════════
# F10 — RRSS: Recovery & Readiness Score (HRV-based)
# ════════════════════════════════════════════════════════════════════════
@https_fn.on_request()
def predict_rrss(req: https_fn.Request) -> https_fn.Response:
    if req.method == 'OPTIONS':
        return _preflight()
    try:
        p = _get_predictor()
        d = req.get_json(silent=True) or {}
        params = {
            'mean_rr':    float(d.get('mean_rr', 850)),
            'median_rr':  float(d.get('median_rr', 840)),
            'sdrr':       float(d.get('sdrr', 45)),
            'rmssd':      float(d.get('rmssd', 38)),
            'sdsd':       float(d.get('sdsd', 30)),
            'sdrr_rmssd': float(d.get('sdrr_rmssd', 1.2)),
            'hr':         float(d.get('hr', 68)),
            'pnn25':      float(d.get('pnn25', 0.3)),
            'pnn50':      float(d.get('pnn50', 0.2)),
            'sd1':        float(d.get('sd1', 27)),
            'sd2':        float(d.get('sd2', 61)),
            'kurt':       float(d.get('kurt', 2.1)),
            'skew':       float(d.get('skew', 0.1)),
            'vlf':        float(d.get('vlf', 120)),
            'lf':         float(d.get('lf', 400)),
            'hf':         float(d.get('hf', 300)),
            'lf_hf':      float(d.get('lf_hf', 1.3)),
            'hf_lf':      float(d.get('hf_lf', 0.77)),
            'sampen':     float(d.get('sampen', 1.5)),
            'higuci':     float(d.get('higuci', 1.8)),
        }
        result = p.predict_recovery(**params)
        shap_vals = {}
        if d.get('include_shap'):
            import numpy as np
            X = np.array([[params[k] for k in ['mean_rr','median_rr','sdrr','rmssd',
                'sdsd','sdrr_rmssd','hr','pnn25','pnn50','sd1','sd2',
                'kurt','skew','vlf','lf','hf','lf_hf','hf_lf','sampen','higuci']]])
            shap_vals = _shap_contributions(p._rrss_model, X,
                ['Mean RR','Median RR','SDRR','RMSSD','SDSD','SDRR/RMSSD',
                 'HR','pNN25','pNN50','SD1','SD2','Kurt','Skew',
                 'VLF','LF','HF','LF/HF','HF/LF','SampEn','Higuci'])
        return _ok({**result, 'shap': shap_vals})
    except Exception as e:
        return _err(str(e))


# ════════════════════════════════════════════════════════════════════════
# F13 — AIRE: Full Assessment (all models + MCD bridge)
# ════════════════════════════════════════════════════════════════════════
@https_fn.on_request()
def predict_all(req: https_fn.Request) -> https_fn.Response:
    if req.method == 'OPTIONS':
        return _preflight()
    try:
        p = _get_predictor()
        d = req.get_json(silent=True) or {}

        env     = d.get('env', {})
        athlete = d.get('athlete', {})
        stress  = d.get('stress', {})
        hrv     = d.get('hrv', {})

        teprs = p.predict_air_health(
            aqi=float(env.get('aqi', env.get('pm25',15)*4)),
            pm25=float(env.get('pm25',15)),
            pm10=float(env.get('pm10', env.get('pm25',15)*1.8)),
            no2=float(env.get('no2',0)), so2=float(env.get('so2',0)),
            o3=float(env.get('o3',0)),
            temperature=float(env.get('temperature',30)),
            humidity=float(env.get('humidity',70)),
            wind_speed=float(env.get('wind_speed',5))
        )
        airi = p.predict_injury_risk(**{k: athlete[k] for k in athlete})
        aprb = p.predict_stress(**{k: stress[k] for k in stress})
        rrss = p.predict_recovery(**{k: hrv[k] for k in hrv})

        # MCD Bridge: context discrimination
        activity_level = float(d.get('activity_level', 0))
        hour           = int(d.get('hour', 12))
        pm25_val       = float(env.get('pm25', 15))
        uvi_val        = float(env.get('uvi', 4))

        if activity_level > 0.65:
            mcd = {'context': 'EXERCISE', 'label': 'Latihan Fisik', 'adjust_teprs': False}
        elif (hour >= 22 or hour < 6) and activity_level < 0.2:
            mcd = {'context': 'SLEEP', 'label': 'Istirahat/Tidur', 'adjust_teprs': False}
        elif pm25_val > 25 or uvi_val > 7:
            if activity_level > 0.4:
                mcd = {'context': 'COMPOUNDED', 'label': 'Risiko Gabungan', 'adjust_teprs': True}
            else:
                mcd = {'context': 'ENVIRONMENT', 'label': 'Paparan Lingkungan', 'adjust_teprs': False}
        else:
            mcd = {'context': 'UNCERTAIN', 'label': 'Tidak Pasti', 'adjust_teprs': False}

        # Build AIRE recommendations
        teprs_class = teprs['class']
        if mcd['adjust_teprs'] and teprs_class < 3:
            teprs_class += 1

        recommendations = _build_recommendations(teprs_class, rrss, airi, pm25_val, hour)

        return _ok({
            'teprs': teprs, 'airi': airi, 'aprb': aprb, 'rrss': rrss,
            'mcd': mcd, 'teprs_adjusted_class': teprs_class,
            'recommendations': recommendations
        })
    except Exception as e:
        return _err(traceback.format_exc())


def _build_recommendations(teprs_class, rrss, airi, pm25, hour):
    recs = []
    level_labels = {0:'Aman', 1:'Waspada', 2:'Berbahaya', 3:'Kritis'}

    if teprs_class == 0:
        recs.append({'type':'env','icon':'✅','msg':'Kualitas udara baik. Aman untuk aktivitas outdoor.'})
    elif teprs_class == 1:
        recs.append({'type':'env','icon':'⚠️','msg':f'PM2.5 {pm25:.0f} μg/m³. Pertimbangkan masker saat outdoor.'})
    elif teprs_class == 2:
        recs.append({'type':'env','icon':'🟠','msg':f'Polusi tinggi. Batasi aktivitas outdoor, gunakan masker N95.'})
    else:
        recs.append({'type':'env','icon':'🔴','msg':'Kualitas udara berbahaya. Tetap dalam ruangan.'})

    if rrss.get('recovery_score', 50) < 40:
        recs.append({'type':'recovery','icon':'😴','msg':'Pemulihan belum optimal. Istirahat atau latihan ringan saja.'})
    elif rrss.get('recovery_score', 50) >= 75:
        recs.append({'type':'recovery','icon':'💪','msg':'Pemulihan baik. Siap untuk latihan intensitas penuh.'})

    if airi.get('risk_level') == 'HIGH':
        recs.append({'type':'injury','icon':'🦵','msg':'Risiko cedera tinggi. Kurangi intensitas 20%, tambah recovery.'})

    # Time-based recommendation
    if 5 <= hour <= 8:
        recs.append({'type':'timing','icon':'🌅','msg':'Pagi hari: waktu optimal latihan aerobik dan metabolisme lemak.'})
    elif 16 <= hour <= 19:
        recs.append({'type':'timing','icon':'🌇','msg':'Sore hari: suhu tubuh puncak, cocok untuk intensitas tinggi.'})

    return recs
