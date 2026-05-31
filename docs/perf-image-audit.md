# Performance — Image Asset Audit

Date: 2026-05-31
Scope: `public/` directory raster assets.

## Findings

`find public -name "*.png" -o -name "*.jpg"` returns **zero** matches.
All visual assets currently shipped are vector (`icon-192.svg`, `icon-512.svg`,
and inline `<svg>` markup inside HTML). The PWA manifest references only the
two SVG icons.

## Recommendation matrix (forward-looking)

| Asset class                              | Current | Target | Notes                                                  |
|------------------------------------------|---------|--------|--------------------------------------------------------|
| App icon 192/512                         | SVG     | SVG    | Keep — already optimal, cache-busted via SW.            |
| OG / social share image                  | SVG     | WebP   | Most social crawlers ignore SVG `og:image`; ship a 1200x630 WebP **and** a JPEG fallback when marketing assets exist. |
| Future hero photography / testimonials   | n/a     | AVIF + WebP fallback | Use `<picture>` with `type="image/avif"` then `type="image/webp"` then JPEG. |
| Future blog illustrations                | n/a     | WebP / AVIF | Target 80% quality, max 1600px wide, `loading="lazy"` + explicit `width`/`height`. |
| Screenshots in docs                      | n/a     | WebP   | Avoid PNG unless the screenshot has UI text needing lossless rendering. |

## Action checklist when raster images are introduced

- [ ] Run `cwebp -q 80 input.png -o output.webp` (or Squoosh CLI).
- [ ] Provide AVIF via `avifenc --min 24 --max 32`.
- [ ] Add `width` and `height` attributes to prevent CLS.
- [ ] Use `loading="lazy"` for below-the-fold images.
- [ ] Use `decoding="async"`.
- [ ] If image is critical hero, add `fetchpriority="high"` and `<link rel="preload" as="image">`.

## Conclusion

No raster optimization is required today. This document tracks the policy for
when raster assets are added.
