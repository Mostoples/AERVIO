// AERVINEX Aervi AI — Callable function with Gemini API + user context.
// Falls back to "API key not configured" message if GEMINI_API_KEY not set.
//
// Setup:
//   1. Dapat API key di https://aistudio.google.com/app/apikey (gratis tier ada)
//   2. firebase functions:config:set gemini.api_key="YOUR_KEY"
//   3. firebase deploy --only functions:aiChat
//   4. Test di /ai-chat.html

const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();

const SYSTEM_PROMPT = `Kamu adalah Aervi, asisten kesehatan AI dari AERVINEX —
aplikasi monitoring kesehatan lingkungan untuk pelari dan warga urban Indonesia.

Aturan WAJIB:
- Selalu jawab dalam Bahasa Indonesia (kecuali user pakai English).
- Bahasa ramah, ringkas, actionable (max 3-4 paragraf pendek).
- JANGAN beri diagnosis medis. Untuk gejala serius, SELALU rekomendasi konsultasi dokter atau 119 (PSC Kemenkes).
- Konteks: polusi udara Indonesia (PM2.5, PM10, ISPU), iklim tropis (heat index, UV tinggi), kondisi urban (Jakarta/Surabaya/Bandung), wearable monitoring (HR, SpO2, HRV).
- Kalau user tanya outside scope (politik, gossip, dll), redirect ke topik kesehatan.
- Selalu sertakan disclaimer di akhir jawaban medis: "Untuk kepastian, konsultasi dokter."
- Hindari klaim spesifik tanpa sumber. Kalau cite paper/guideline, sebut nama (e.g., "menurut WHO 2021", "GINA Asthma Guidelines").

Format jawaban:
- Pakai paragraf, hindari bullet kecuali user minta list.
- Kalau jawaban data spesifik (HR zone, threshold), kasih angka jelas.
- Akhiri dengan 1 follow-up question kalau relevan.`;

async function getUserContext(uid) {
  if (!uid) return null;
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) return null;
    const u = userDoc.data();
    return {
      age: u.age,
      gender: u.gender,
      city: u.city,
      conditions: u.onboarding?.conditions || [],
      goals: u.onboarding?.goals || [],
      priorities: u.onboarding?.priorities || [],
    };
  } catch (e) {
    console.warn('[aiChat] getUserContext failed:', e.message);
    return null;
  }
}

function buildContextSuffix(ctx) {
  if (!ctx) return '';
  const parts = [];
  if (ctx.age) parts.push(`umur ${ctx.age} tahun`);
  if (ctx.gender) parts.push(ctx.gender.toLowerCase());
  if (ctx.city) parts.push(`tinggal di ${ctx.city}`);
  if (ctx.conditions?.length && !ctx.conditions.includes('none')) {
    parts.push(`kondisi: ${ctx.conditions.join(', ')}`);
  }
  if (ctx.goals?.length) {
    parts.push(`tujuan: ${ctx.goals.join(', ')}`);
  }
  if (!parts.length) return '';
  return `\n\nKonteks user: ${parts.join('; ')}. Personalize jawaban sesuai konteks ini.`;
}

async function callGeminiAPI(messages, apiKey) {
  // Gemini API REST endpoint (free tier: gemini-2.0-flash-exp atau gemini-1.5-flash)
  const model = 'gemini-1.5-flash-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
      topP: 0.95,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  const fetch = (await import('node-fetch')).default || global.fetch;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini API ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) {
    throw new Error('Gemini returned no reply (possibly safety-blocked): ' + JSON.stringify(data).slice(0, 300));
  }
  return reply.trim();
}

exports.aiChat = functions
  .region('asia-southeast2')
  .runWith({ timeoutSeconds: 30, memory: '256MB' })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Login dulu untuk pakai Aervi AI.');
    }
    const uid = context.auth.uid;
    const message = (data?.message || '').toString().trim().slice(0, 1000);
    const history = Array.isArray(data?.history) ? data.history.slice(-20) : [];
    let conversationId = data?.conversationId;

    if (!message) {
      throw new functions.https.HttpsError('invalid-argument', 'Message wajib diisi.');
    }

    // Rate limit per-user (5 calls / minute via Firestore counter)
    try {
      const now = Date.now();
      const limitDoc = admin.firestore().collection('ai_rate_limits').doc(uid);
      const limitSnap = await limitDoc.get();
      const recent = (limitSnap.exists ? limitSnap.data().calls : []).filter(t => now - t < 60_000);
      if (recent.length >= 5) {
        throw new functions.https.HttpsError('resource-exhausted',
          'Terlalu banyak request. Tunggu 1 menit.');
      }
      recent.push(now);
      await limitDoc.set({ calls: recent, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    } catch (e) {
      if (e.code === 'resource-exhausted') throw e;
      console.warn('[aiChat] rate limit check failed (allowing):', e.message);
    }

    // Get API key
    const apiKey = functions.config().gemini?.api_key
                 || process.env.GEMINI_API_KEY
                 || null;
    if (!apiKey) {
      // Graceful fallback — client will use local rule-based reply
      throw new functions.https.HttpsError('failed-precondition',
        'Gemini API key belum dikonfigurasi. Admin harus jalankan: firebase functions:config:set gemini.api_key="YOUR_KEY"');
    }

    // Get user context for personalization
    const userCtx = await getUserContext(uid);
    const ctxSuffix = buildContextSuffix(userCtx);

    // Build conversation: include history + current message
    const messages = [...history, { role: 'user', content: message + ctxSuffix }];

    // Call Gemini
    let reply;
    try {
      reply = await callGeminiAPI(messages, apiKey);
    } catch (e) {
      console.error('[aiChat] Gemini call failed:', e.message);
      throw new functions.https.HttpsError('internal',
        'AI gagal merespon. Coba lagi atau gunakan fitur lain.');
    }

    // Persist conversation
    try {
      if (!conversationId) {
        const newConvo = await admin.firestore().collection('ai_conversations').add({
          uid,
          startedAt: admin.firestore.FieldValue.serverTimestamp(),
          messageCount: 0,
        });
        conversationId = newConvo.id;
      }
      const batch = admin.firestore().batch();
      const convoRef = admin.firestore().collection('ai_conversations').doc(conversationId);
      const userMsgRef = convoRef.collection('messages').doc();
      const botMsgRef = convoRef.collection('messages').doc();
      batch.set(userMsgRef, {
        role: 'user',
        content: message,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      batch.set(botMsgRef, {
        role: 'assistant',
        content: reply,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      batch.update(convoRef, {
        messageCount: admin.firestore.FieldValue.increment(2),
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await batch.commit();
    } catch (e) {
      console.warn('[aiChat] persist failed (still returning reply):', e.message);
    }

    return {
      reply,
      conversationId,
      sources: [], // Future: RAG sources from indexed research papers
    };
  });
