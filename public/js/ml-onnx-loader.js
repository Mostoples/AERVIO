/**
 * AERVINEX ML — onnxruntime-web lazy loader + risk-routing dispatcher.
 * --------------------------------------------------------------
 * Loads ONNX models on demand from /models/{name}.onnx, runs inference
 * client-side via onnxruntime-web (WebAssembly backend, no GPU needed).
 *
 * Public API:
 *   await MLClient.loadOnnxModel('afib')         → boolean
 *   await MLClient.predictOnnx('afib', features) → { risk_pct, ... }
 *   MLClient.predictForRiskV2(riskId, factors)   → ONNX if loaded, else proxy
 *
 * Integration: this file extends window.MLClient (must load AFTER ml-client.js).
 */
(function () {
  'use strict';

  const CDN_ORT = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort.min.js';
  const MODEL_BASE = '/models';

  // Feature key order MUST match what train_*.py wrote during export.
  // Keep this map in sync with ml/training/export_onnx.py.
  const FEATURE_SPECS = {
    afib: ['rmssd', 'sdnn', 'pnn50', 'sd1', 'sd2', 'sampen', 'cosen',
           'meanRR', 'sdsd', 'lf', 'hf', 'lfHf', 'higuci', 'kurt', 'skew'],
    respiratory: ['delta_rhr', 'sleep_deviation_min', 'steps_drop_pct',
                  'spo2_drop', 'cough_count_24h'],
  };

  const sessions = {};   // riskId → ort.InferenceSession
  let ortReady = null;   // Promise<window.ort>

  function loadOrt() {
    if (ortReady) return ortReady;
    ortReady = new Promise((resolve, reject) => {
      if (window.ort) return resolve(window.ort);
      const s = document.createElement('script');
      s.src = CDN_ORT;
      s.async = true;
      s.onload = () => {
        // WASM path tells ORT where to find its threads-blob.
        if (window.ort && window.ort.env) {
          window.ort.env.wasm.wasmPaths =
            'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
        }
        resolve(window.ort);
      };
      s.onerror = () => reject(new Error('Failed to load onnxruntime-web from CDN.'));
      document.head.appendChild(s);
    });
    return ortReady;
  }

  async function loadOnnxModel(riskId) {
    if (sessions[riskId]) return true;
    try {
      const ort = await loadOrt();
      const url = `${MODEL_BASE}/${riskId}.onnx`;
      // HEAD probe — model may not be deployed yet.
      const probe = await fetch(url, { method: 'HEAD' });
      if (!probe.ok) {
        console.info(`[MLOnnx] no model at ${url} (status ${probe.status}); using proxy.`);
        return false;
      }
      const session = await ort.InferenceSession.create(url, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });
      sessions[riskId] = session;
      console.info(`[MLOnnx] loaded model: ${riskId}`);
      return true;
    } catch (e) {
      console.warn(`[MLOnnx] load failed for ${riskId}:`, e);
      return false;
    }
  }

  function featuresToTensor(ort, riskId, features) {
    const spec = FEATURE_SPECS[riskId];
    if (!spec) throw new Error(`No FEATURE_SPECS for ${riskId}`);
    const row = spec.map((k) => {
      const v = features?.[k];
      return typeof v === 'number' && Number.isFinite(v) ? v : 0;
    });
    return new ort.Tensor('float32', Float32Array.from(row), [1, spec.length]);
  }

  async function predictOnnx(riskId, features) {
    const session = sessions[riskId];
    if (!session) {
      const ok = await loadOnnxModel(riskId);
      if (!ok) return null;
    }
    const ort = await loadOrt();
    const tensor = featuresToTensor(ort, riskId, features);
    const inputName = sessions[riskId].inputNames[0];
    const out = await sessions[riskId].run({ [inputName]: tensor });
    // XGBoost via onnxmltools produces 'probabilities' (sklearn-onnx) or
    // 'output_probability'. Try the common names.
    const candidates = ['probabilities', 'output_probability', 'label_probability'];
    let probArr = null;
    for (const k of candidates) {
      if (out[k]) {
        probArr = out[k].data;
        break;
      }
    }
    if (!probArr) {
      // Fall back to first output.
      const firstKey = Object.keys(out)[0];
      probArr = out[firstKey]?.data;
    }
    if (!probArr || !probArr.length) return null;
    // Binary classifier → use class-1 prob.
    const p1 = probArr.length >= 2 ? probArr[1] : probArr[0];
    return {
      risk_pct: Math.round(p1 * 1000) / 10,
      source: 'onnx',
      model: riskId,
    };
  }

  // Wait until ml-client.js has set up window.MLClient, then attach methods.
  function attach() {
    if (!window.MLClient) {
      // Re-try on next tick — ml-client.js may not have loaded yet.
      return setTimeout(attach, 30);
    }
    const M = window.MLClient;
    M.loadOnnxModel = loadOnnxModel;
    M.predictOnnx = predictOnnx;

    // v2 dispatcher: try ONNX first, fall back to proxy.
    M.predictForRiskV2 = async function (riskId, factors, featuresOverride) {
      if (sessions[riskId] && featuresOverride) {
        const out = await predictOnnx(riskId, featuresOverride);
        if (out) return out;
      }
      // Proxy fallback (synchronous).
      const proxy = M.predictForRisk ? M.predictForRisk(riskId, factors) : null;
      return proxy ? { ...proxy, source: 'proxy' } : null;
    };
  }
  attach();
})();
