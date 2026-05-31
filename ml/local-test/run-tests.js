/* Local Node.js test runner — loads browser files into a fake window
   and runs AervinexMLTest.runAll() to identify weak models.
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PUB = path.join(__dirname, '..', '..', 'public');

// Fake browser globals
const sandbox = {
  window: {},
  console,
  Math,
  JSON,
  Date,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Error,
  TypeError,
  RangeError,
  Symbol,
  Map,
  Set,
  Promise,
  setTimeout,
  clearTimeout,
};
sandbox.window.MLClient = {};
sandbox.MLClient = sandbox.window.MLClient;
// Utils stub used by predictTEPRS etc
sandbox.Utils = {
  clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
};
sandbox.window.Utils = sandbox.Utils;
sandbox.global = sandbox;
vm.createContext(sandbox);

function loadInto(file) {
  const src = fs.readFileSync(path.join(PUB, 'js', file), 'utf8');
  vm.runInContext(src, sandbox, { filename: file });
}

loadInto('ml-client.js');
loadInto('ml-test-runner.js');

const Test = sandbox.window.AervinexMLTest || sandbox.AervinexMLTest;
if (!Test) {
  console.error('AervinexMLTest not loaded.');
  process.exit(1);
}

const report = Test.runAll(2000, 42);
const out = {
  summary: {
    totalTests: report.totalTests,
    casesPerTest: report.casesPerTest,
    avgAccuracy: report.avgAccuracy,
    avgF1: report.avgF1,
    avgAUC: report.avgAUC,
    avgECE: report.avgECE,
  },
  models: report.results.map(r => ({
    id: r.riskId,
    accuracy: r.accuracy,
    f1: r.f1,
    precision: r.precision,
    recall: r.recall,
    auc: r.auc,
    ece: r.ece,
    specificity: r.specificity,
    positiveRate: r.positiveRate,
    tp: r.tp, fp: r.fp, tn: r.tn, fn: r.fn,
    source: r.source,
  })),
};

// Sort by accuracy ascending = worst first
out.models.sort((a, b) => a.accuracy - b.accuracy);

console.log('\n===== AERVINEX ML TEST — RANKED BY ACCURACY (ASC) =====\n');
console.log(`Avg Accuracy: ${(out.summary.avgAccuracy * 100).toFixed(1)}%`);
console.log(`Avg F1:       ${(out.summary.avgF1 * 100).toFixed(1)}%`);
console.log(`Avg AUC:      ${out.summary.avgAUC.toFixed(3)}`);
console.log(`Avg ECE:      ${out.summary.avgECE.toFixed(3)}\n`);

console.log('Model                       Acc%   F1%    Prec%  Rec%   AUC    ECE    pos%');
console.log('───────────────────────────────────────────────────────────────────────────');
out.models.forEach(m => {
  const id = m.id.padEnd(26);
  const acc = (m.accuracy * 100).toFixed(1).padStart(5);
  const f1 = (m.f1 * 100).toFixed(1).padStart(5);
  const pre = (m.precision * 100).toFixed(1).padStart(5);
  const rec = (m.recall * 100).toFixed(1).padStart(5);
  const auc = m.auc.toFixed(3).padStart(6);
  const ece = m.ece.toFixed(3).padStart(6);
  const pos = (m.positiveRate * 100).toFixed(1).padStart(5);
  console.log(`${id} ${acc}  ${f1}  ${pre}  ${rec}  ${auc} ${ece}  ${pos}`);
});

// Save JSON
const outPath = path.join(__dirname, 'results.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`\nSaved: ${outPath}`);
