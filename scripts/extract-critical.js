#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * scripts/extract-critical.js
 *
 * Regex-based critical-CSS extractor for the AERVINEX landing
 * shell. No headless browser dependency — fast & deterministic.
 *
 * What it does
 * ------------
 *   1. Reads public/css/aervinex-ui.css.
 *   2. Keeps ONLY the selectors that are known to render
 *      above-the-fold on the dashboard / index pages.
 *   3. Keeps :root + .theme-dark / .theme-light variable blocks
 *      because every downstream rule depends on them.
 *   4. Compresses whitespace and writes the result to
 *      public/css/critical.css.
 *   5. Refuses to emit a file >6 KB (the budget).
 *
 * Usage:
 *   node scripts/extract-critical.js
 *
 * Then in HTML <head>, replace:
 *   <link rel="stylesheet" href="/css/aervinex-ui.css" />
 * with:
 *   <style>{{ inline contents of public/css/critical.css }}</style>
 *   <link rel="preload" href="/css/aervinex-ui.css" as="style"
 *         onload="this.rel='stylesheet'">
 *   <noscript><link rel="stylesheet" href="/css/aervinex-ui.css"></noscript>
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, 'public', 'css', 'aervinex-ui.css');
const OUT  = path.join(ROOT, 'public', 'css', 'critical.css');
const BUDGET_BYTES = 6 * 1024; // 6 KB

// Selectors that must survive — order doesn't matter, we match by token.
// These are the rules that paint within the first viewport of index.html
// (nav, hero, primary buttons) and dashboard.html (top-bar, greeting,
// hero-card, basic typography).
const KEEP_TOKENS = [
  ':root', 'body.theme-dark', 'body.theme-light', '.theme-dark', '.theme-light',
  '*', 'html', 'body', 'button', 'input',
  '.app-shell',
  '.top-bar', '.brand', '.brand-dot', '.brand-name', '.top-bar-actions',
  '.btn-icon', '.btn-pill', '.btn-block',
  '.greeting', '.greet-eyebrow', '.greet-name', '.greet-date',
  '.status-pill', '.status-dot',
  '.card', '.hero-card', '.hero-left', '.hero-label',
  '.ico',
  '.lp-nav', '.lp-nav-inner', '.lp-logo', '.lp-dot', '.lp-nav-cta', '.lp-btn',
  '.lp-hero', '.lp-hero-grid', '.lp-h1', '.lp-lead', '.lp-pill-launch',
  '.lp-container',
  '.sr-only-focusable',
];

function shouldKeep(selector) {
  // Strip pseudo classes / elements for matching
  const bare = selector.replace(/::?[a-z-]+(\([^)]*\))?/g, '').trim();
  if (!bare) return false;
  // Tokenize on commas (selector list) — keep block if any token matches.
  const tokens = bare.split(/[\s>+~,]+/).filter(Boolean);
  return tokens.some(t => KEEP_TOKENS.includes(t));
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function compress(css) {
  return css
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

/**
 * Walks a CSS source string and yields top-level rules
 * (selectorList, body, sourceText). Skips at-rules other
 * than @media (which we recurse into).
 */
function* topLevelRules(css) {
  let i = 0;
  const len = css.length;
  while (i < len) {
    // skip whitespace
    while (i < len && /\s/.test(css[i])) i++;
    if (i >= len) break;

    // at-rule
    if (css[i] === '@') {
      const start = i;
      // find { or ;
      while (i < len && css[i] !== '{' && css[i] !== ';') i++;
      if (css[i] === ';') {
        // simple at-rule (e.g. @charset) — drop
        i++;
        continue;
      }
      // block at-rule — find matching brace
      let depth = 0;
      const blockStart = i;
      for (; i < len; i++) {
        if (css[i] === '{') depth++;
        else if (css[i] === '}') {
          depth--;
          if (depth === 0) { i++; break; }
        }
      }
      const text = css.slice(start, i);
      const head = css.slice(start, blockStart).trim();
      // Only keep @media that targets viewport widths (responsive critical pieces)
      if (/^@media/.test(head)) {
        yield { kind: 'atrule', head, raw: text };
      }
      continue;
    }

    // ordinary rule
    const selStart = i;
    while (i < len && css[i] !== '{') i++;
    if (i >= len) break;
    const selector = css.slice(selStart, i).trim();
    let depth = 1;
    const bodyStart = ++i;
    for (; i < len; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    const body = css.slice(bodyStart, i);
    i++; // consume '}'
    yield { kind: 'rule', selector, body };
  }
}

function extract(srcCss) {
  const src = stripComments(srcCss);
  const out = [];
  for (const rule of topLevelRules(src)) {
    if (rule.kind === 'rule') {
      if (shouldKeep(rule.selector)) {
        out.push(`${rule.selector}{${rule.body}}`);
      }
      continue;
    }
    if (rule.kind === 'atrule') {
      // Recurse into @media: keep its nested rules that pass the filter.
      const inner = rule.raw.slice(rule.raw.indexOf('{') + 1, rule.raw.lastIndexOf('}'));
      const nested = [];
      for (const r of topLevelRules(inner)) {
        if (r.kind === 'rule' && shouldKeep(r.selector)) {
          nested.push(`${r.selector}{${r.body}}`);
        }
      }
      if (nested.length) {
        out.push(`${rule.head}{${nested.join('')}}`);
      }
    }
  }
  return compress(out.join('\n'));
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error('Source CSS not found:', SRC);
    process.exit(2);
  }
  const srcCss = fs.readFileSync(SRC, 'utf8');
  const critical = extract(srcCss);
  const bytes = Buffer.byteLength(critical, 'utf8');

  if (bytes > BUDGET_BYTES) {
    console.error(`Critical CSS is ${bytes} bytes — over budget (${BUDGET_BYTES}).`);
    console.error('Refusing to write. Trim KEEP_TOKENS or split the shell further.');
    process.exit(1);
  }

  const header = `/* Generated by scripts/extract-critical.js — DO NOT EDIT BY HAND. ${new Date().toISOString()} */\n`;
  fs.writeFileSync(OUT, header + critical + '\n', 'utf8');
  console.log(`wrote ${OUT} (${bytes} bytes, budget ${BUDGET_BYTES})`);
}

main();
