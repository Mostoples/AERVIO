/* Extract object-literal entries dari cluster-*.md, dedupe with existing
   DICT in i18n.js, output merged JS snippet siap di-paste.
   Usage: node scripts/merge-i18n-clusters.js
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const I18N = path.join(ROOT, 'public', 'js', 'i18n.js');

// 1. Load existing DICT keys from i18n.js so we can dedupe
const i18nSrc = fs.readFileSync(I18N, 'utf8');
const existingKeys = new Set();
const keyRe = /^\s*'((?:[^'\\]|\\.)*)':\s*'/gm;
let m;
while ((m = keyRe.exec(i18nSrc))) existingKeys.add(m[1].replace(/\\'/g, "'"));
console.log(`Existing DICT keys: ${existingKeys.size}`);

// 2. Parse each cluster file
const clusters = ['a', 'b', 'c', 'd'];
const merged = new Map(); // key -> value
const skipped = { duplicate: 0, malformed: 0 };

clusters.forEach(c => {
  const file = path.join(DOCS, `i18n-strings-cluster-${c}.md`);
  if (!fs.existsSync(file)) {
    console.log(`Skipping cluster ${c.toUpperCase()} (not found)`);
    return;
  }
  const src = fs.readFileSync(file, 'utf8');
  // Match `'key': 'value',` patterns within ```js blocks
  // Robust: handle escaped quotes within key/value
  const entryRe = /'((?:[^'\\]|\\.)*)':\s*'((?:[^'\\]|\\.)*)',?\s*(?:\/\/.*)?$/gm;
  let count = 0;
  while ((m = entryRe.exec(src))) {
    const key = m[1].replace(/\\'/g, "'");
    const val = m[2].replace(/\\'/g, "'");
    if (!key || !val) { skipped.malformed++; continue; }
    if (existingKeys.has(key)) { skipped.duplicate++; continue; }
    if (merged.has(key)) { skipped.duplicate++; continue; }
    merged.set(key, val);
    count++;
  }
  console.log(`Cluster ${c.toUpperCase()}: ${count} new entries`);
});

console.log(`\nTotal merged unique: ${merged.size}`);
console.log(`Skipped duplicates: ${skipped.duplicate}`);
console.log(`Skipped malformed: ${skipped.malformed}`);

// 3. Output: emit JS object literal entries
const lines = [];
lines.push('');
lines.push('    // ══════════════════════════════════════════════════════════');
lines.push('    // EXPANSION BATCH v3 — Auto-merged from 4 cluster extractions');
lines.push('    // Generated: ' + new Date().toISOString().slice(0, 10));
lines.push('    // Total new entries: ' + merged.size);
lines.push('    // ══════════════════════════════════════════════════════════');
lines.push('');

// Sort by key length ascending for nicer diff, then alpha
const sorted = [...merged.entries()].sort((a, b) => {
  if (a[0].length !== b[0].length) return a[0].length - b[0].length;
  return a[0].localeCompare(b[0]);
});

sorted.forEach(([k, v]) => {
  const escapedK = k.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const escapedV = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  lines.push(`    '${escapedK}': '${escapedV}',`);
});

const outPath = path.join(DOCS, 'i18n-merged-dict.js');
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`\nWritten: ${outPath} (${lines.length} lines)`);
