---
name: ML Model Issue
about: Lapor masalah prediksi ML (false positive/negative, calibration, drift)
title: '[ML] '
labels: ml, needs-triage
assignees: ''
---

## Model Affected
<!-- e.g., predictAFib, predictHeatstroke, predictCVFitness -->

## Issue Type
- [ ] False positive (predicted HIGH, actually LOW)
- [ ] False negative (predicted LOW, actually HIGH)
- [ ] Calibration off (probabilities not realistic)
- [ ] Output crash/error
- [ ] Performance regression vs previous version
- [ ] Drift detected

## Input Vector
```json
{
  "factors": [
    { "metric": "rmssd", "val": ... },
    ...
  ]
}
```

## Expected Output
- **Expected risk_pct**: <!-- e.g., 25-35% -->
- **Expected risk_class**: <!-- 0 = LOW / 1 = HIGH -->
- **Justification**: <!-- Why expected? clinical reasoning -->

## Actual Output
```json
{
  "risk_pct": ...,
  "risk_class": ...,
  "model": "..."
}
```

## Environment
- **AERVINEX version**: <!-- check footer or git commit -->
- **ml-client.js version**: <!-- check calibration map header -->
- **Calibration map version**: <!-- v1 / v2 -->
- **Browser/device**: <!-- impacts only if behavior differs across runtime -->

## Reproducibility
- [ ] Reproducible 100% with this input
- [ ] Reproducible kadang (~X%)
- [ ] Hanya 1× kejadian

## Steps to Reproduce
1.
2.

## Additional Context
<!-- Related Firestore document IDs (sanitize PII), session details, etc -->

## Disclaimer Acknowledgment
- [ ] Saya paham AERVINEX adalah wellness tool, bukan alat medis. Issue ini dilaporkan untuk improvement model, bukan untuk klaim klinis.
