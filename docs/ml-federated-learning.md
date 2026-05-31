# AERVINEX — Federated Learning Roadmap (Design Doc)

Status: **Stub / future research direction**. Target horizon: AERVINEX v3 (2027).

## Motivation

Personal HRV / PPG / activity baselines vary enormously between
users (age, fitness, ethnicity, comorbidities). A globally-trained
afib / stress classifier captures average behaviour but misses
*per-individual* drift signals — exactly the events we care about.

Federated fine-tuning lets us:
- Keep raw signals on the user's phone (privacy + UU PDP friendly).
- Send only gradient / weight deltas (encrypted) to a coordinator.
- Maintain a global model that adapts as the cohort grows.

## Approach Options

### Option A: TensorFlow Federated (TFF)
- Pros: mature, well-documented, native TF graph.
- Cons: heavy runtime (~80 MB), requires TF Lite + native bridge — not
  viable in a PWA. Needs a Capacitor native shim.

### Option B: Flower (recommended)
- https://flower.dev
- Framework-agnostic (PyTorch / TF / JAX / scikit-learn).
- Server is plain Python; client is a thin HTTP/WebSocket actor.
- We can run the **client in Cloud Function** mode where each user's
  phone uploads features (not raw signals) over Firebase Auth to a
  Cloud Run-hosted Flower server. Compromise privacy ↔ feasibility.

### Option C: On-device LoRA-style adapter
- Keep the global ONNX backbone frozen on the user's device.
- Train a tiny adapter (≤ 5 KB) using user-labelled events.
- Adapter weights stored in `users/{uid}/ml/adapter/{model}` —
  user-private, never aggregated.
- Simplest path; no server training pipeline required.
- Loss: no global learning, but per-user personalisation is the
  primary benefit anyway.

**Decision (preliminary): start with Option C, evaluate Option B at
year 2 once cohort > 5,000 users.**

## Data flow (Option C)

```
User phone (PWA / native shell)
  ├── Inference  : ONNX backbone (afib.onnx) — frozen
  ├── Adapter    : 1-layer linear, 16 weights, on top of backbone logits
  ├── Local label: user taps "false alarm" / "yes I felt it" → label
  ├── SGD step   : 1 example, lr=0.01, on-device JS (no autograd needed)
  └── Sync       : adapter weights encrypted → users/{uid}/ml/adapter/...
```

## Privacy & threat model

- **No raw biosignals leave the device** (Option C).
- Adapter weights ≪ enough to invert raw signal (≤ 16 floats).
- Aggregation server (if Option B): only sees clipped + gaussian-
  noised gradient deltas → differential privacy ε=4 budget per epoch.
- Sybil resistance: tie federated client identity to Firebase Auth UID.

## References

- Bonawitz et al. 2019. "Towards Federated Learning at Scale: System
  Design" — https://arxiv.org/abs/1902.01046
- Beutel et al. 2020. "Flower: A Friendly Federated Learning Framework"
  — https://arxiv.org/abs/2007.14390
- Hu et al. 2021. "LoRA: Low-Rank Adaptation of Large Language Models"
  — https://arxiv.org/abs/2106.09685 (adapter pattern inspiration)

## Open questions

- Power budget: how many local SGD steps before battery impact > 1%?
- Label quality: user-tap labels are noisy; need confidence
  weighting + sleep-time deferred training.
- Cross-device: how do we sync the adapter if the user has phone +
  tablet? (Probably keep separate per device, optional merge prompt.)
