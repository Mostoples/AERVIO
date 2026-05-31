/**
 * AERVINEX ML A/B Testing — random assignment + Firestore experiment log.
 * --------------------------------------------------------------
 * Splits each user (sticky by uid) into:
 *   - control:   calibrated-proxy (predictForRisk)
 *   - treatment: onnxruntime model (predictForRiskV2)
 *
 * Logged events go to Firestore `ml_experiments` collection — used for
 * offline analysis (paired AUC, McNemar test) in ml/training/.
 *
 * Public API:
 *   const arm = MLAB.assign(uid, experimentId)  // 'control' | 'treatment'
 *   await MLAB.logPrediction({ uid, experimentId, riskId, arm, predicted, ground_truth? })
 *
 * Assignment is deterministic so the same user always sees the same arm
 * within an experiment — required for valid causal estimates.
 */
(function () {
  'use strict';

  // Cheap FNV-1a hash (string → uint32). Good enough for arm assignment.
  function fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h >>> 0;
  }

  function assign(uid, experimentId, treatmentRatio = 0.5) {
    if (!uid || !experimentId) return 'control';
    const h = fnv1a(`${experimentId}::${uid}`);
    const r = (h % 10000) / 10000;
    return r < treatmentRatio ? 'treatment' : 'control';
  }

  async function logPrediction(rec) {
    try {
      if (!window.firebase || !firebase.firestore) return false;
      const db = firebase.firestore();
      await db.collection('ml_experiments').add({
        ...rec,
        ts: firebase.firestore.FieldValue.serverTimestamp(),
        client_ts: Date.now(),
        ua: navigator.userAgent.slice(0, 200),
      });
      return true;
    } catch (e) {
      console.warn('[MLAB] log failed', e);
      return false;
    }
  }

  // Convenience wrapper used by risk-detail.html pages.
  async function predictWithExperiment({ uid, experimentId, riskId, factors, features }) {
    const arm = assign(uid, experimentId);
    let predicted;
    if (arm === 'treatment' && window.MLClient?.predictForRiskV2) {
      predicted = await window.MLClient.predictForRiskV2(riskId, factors, features);
    } else if (window.MLClient?.predictForRisk) {
      predicted = window.MLClient.predictForRisk(riskId, factors);
    }
    if (predicted) {
      await logPrediction({ uid, experimentId, riskId, arm, predicted });
    }
    return { arm, predicted };
  }

  window.MLAB = { assign, logPrediction, predictWithExperiment };
})();
