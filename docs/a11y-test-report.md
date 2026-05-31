# Accessibility Manual Test Report — Skeleton

Date: 2026-05-31
WCAG target: **2.1 AA**
Tester: _fill in name_
Tools: NVDA 2024.x + Firefox 125, VoiceOver (macOS 14) + Safari 17, Chrome
Lighthouse a11y, axe DevTools.

## Scope — 5 critical user flows

1. **Onboarding** — `/index.html` → `/register.html` → `/onboarding.html` → `/dashboard.html`
2. **Risk drill-down** — `/dashboard.html` → `/risk-list.html` → `/risk-detail.html?id=teprs`
3. **Assessment** — `/risk-list.html` → `/assessment.html?id=asma` → submit → history
4. **Profile & settings** — `/dashboard.html` → `/profile.html` → `/edit-profile.html`
5. **Evidence transparency** — `/index.html` → `/evidence.html` → `/ml-results-report.html`

## Per-flow checklist (each item: PASS / FAIL / NA + notes)

### Keyboard navigation
- [ ] All interactive elements reachable via Tab
- [ ] Logical tab order (top → bottom, left → right)
- [ ] Skip-to-content link first focusable element
- [ ] No keyboard trap inside dialogs
- [ ] Visible `:focus-visible` ring on every interactive element
- [ ] Escape closes overlays / drawers
- [ ] Enter / Space activate buttons; Space toggles checkboxes

### Screen reader (NVDA + VoiceOver)
- [ ] Page `<title>` distinguishes route
- [ ] Single `<h1>` per page; heading order does not skip levels
- [ ] Main landmark announced (`<main>`)
- [ ] Nav landmark announced (`<nav>`)
- [ ] Buttons have accessible name (label, aria-label, or text)
- [ ] Form inputs have associated `<label>`
- [ ] Live regions for live values (HR, SpO2) use `aria-live="polite"`
- [ ] Status changes (toast, alerts) announced via `role="status"`
- [ ] Charts have text alternative (`<figcaption>` or `aria-describedby`)

### Color & contrast
- [ ] Body text ≥ 4.5:1 against background
- [ ] Large text ≥ 3:1
- [ ] UI components / focus indicators ≥ 3:1
- [ ] Information not conveyed by color alone (risk pill has text + icon)

### Motion
- [ ] `prefers-reduced-motion: reduce` disables decorative animations
- [ ] No auto-playing video / parallax that cannot be paused

### Forms
- [ ] Required fields indicated in text, not only color
- [ ] Error messages linked to field via `aria-describedby`
- [ ] Inline validation announced

### Mobile / touch
- [ ] Tap targets ≥ 44×44 px
- [ ] Pinch-zoom enabled (`user-scalable=yes` or default — DO NOT set `maximum-scale=1`)
- [ ] Bottom nav not blocking content under iOS keyboard

## Known issues to verify

| Pri | Where | Issue | Status |
|-----|-------|-------|--------|
| P0  | many  | `--text-muted` may not hit 4.5:1 on dark glass aura cards | Fixed via `a11y-tokens.css` |
| P0  | many  | No skip-to-content link | Added to index/dashboard/risk-list/profile/evidence |
| P1  | nav   | `aria-current="page"` missing on bottom-nav active state | TODO |
| P1  | modal | `role="dialog" aria-modal="true"` missing on drawer | TODO |
| P2  | landing | Hero phone float animation triggers vestibular discomfort | Wrapped in `prefers-reduced-motion` |
| P2  | ml-results | ROC / calibration SVG had no text equivalent | `<figcaption>` added |

## Sign-off

- Tested by: _____________________  Date: __________
- Bugs filed: _____________________
- Next retest scheduled: __________

## References

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)
- [Inclusive Components patterns](https://inclusive-components.design/)
