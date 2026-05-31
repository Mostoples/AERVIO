/**
 * webhookDispatcher — Firestore trigger on alerts/{alertId} create.
 * --------------------------------------------------------------
 * If alert.severity meets user's threshold AND user has webhooks
 * configured, POST a JSON payload to each URL.
 *
 * User config schema (users/{uid}.webhooks):
 *   [
 *     { url: 'https://hooks.slack.com/...', minSeverity: 'warning', format: 'slack' },
 *     { url: 'https://discord.com/api/...', minSeverity: 'critical', format: 'discord' },
 *     { url: 'https://api.telegram.org/...', format: 'telegram' }
 *   ]
 */
'use strict';

const SEV_ORDER = { info: 0, warning: 1, critical: 2 };

function payloadFor(format, alert) {
  const title = alert.title || 'AERVINEX Alert';
  const body  = alert.body  || '';
  switch (format) {
    case 'slack':
      return { text: `*${title}*\n${body}` };
    case 'discord':
      return { content: `**${title}**\n${body}` };
    case 'telegram':
      return { text: `${title}\n${body}`, parse_mode: 'Markdown' };
    default:
      return { title, body, severity: alert.severity, riskId: alert.riskId };
  }
}

module.exports = (regional, admin) => regional
  .firestore
  .document('alerts/{alertId}')
  .onCreate(async (snap) => {
    const alert = snap.data() || {};
    const uid = alert.uid;
    if (!uid) return null;

    const userSnap = await admin.firestore().collection('users').doc(uid).get();
    if (!userSnap.exists) return null;
    const hooks = userSnap.data().webhooks;
    if (!Array.isArray(hooks) || !hooks.length) return null;

    const alertSev = SEV_ORDER[alert.severity] ?? 0;

    // node-fetch is lazy-loaded to keep cold start light.
    let fetch;
    try { fetch = require('node-fetch'); }
    catch (_) { console.warn('[webhookDispatcher] node-fetch missing'); return null; }

    const results = [];
    for (const hook of hooks) {
      if (!hook?.url) continue;
      const minSev = SEV_ORDER[hook.minSeverity] ?? 1;
      if (alertSev < minSev) continue;
      try {
        const res = await fetch(hook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadFor(hook.format, alert)),
          timeout: 8000,
        });
        results.push({ url: hook.url, status: res.status });
      } catch (e) {
        results.push({ url: hook.url, error: String(e) });
      }
    }
    await snap.ref.set({ webhooks: results }, { merge: true });
    return null;
  });
