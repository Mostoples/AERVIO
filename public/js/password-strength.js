// ============================================================
// AERVINEX — Password Strength Meter (lightweight, zero-dep)
// 4-level rating (0=weak ... 3=very strong) zxcvbn-inspired but
// heuristic only (no dictionary). Use:
//   const r = AervinexPasswordStrength.score('myP@ss123');
//   r.level, r.label, r.color, r.suggestions
// To wire to UI:
//   AervinexPasswordStrength.attach(inputEl, meterContainerEl);
// ============================================================

(function () {
  'use strict';

  // Common-weakness heuristics
  var COMMON = [
    'password', 'qwerty', '123456', '12345678', '111111', 'iloveyou',
    'admin', 'welcome', 'monkey', 'dragon', 'letmein', 'aervinex',
    'aervio', 'jakarta', 'indonesia'
  ];

  function score(pwd) {
    if (!pwd) {
      return { level: 0, label: 'Kosong', color: '#666', suggestions: ['Masukkan password'] };
    }

    var s = 0;
    var sug = [];

    // Length tiers
    if (pwd.length >= 8) s++; else sug.push('Minimal 8 karakter');
    if (pwd.length >= 12) s++;
    if (pwd.length >= 16) s++;

    // Character class diversity
    var hasLower = /[a-z]/.test(pwd);
    var hasUpper = /[A-Z]/.test(pwd);
    var hasDigit = /\d/.test(pwd);
    var hasSym = /[^A-Za-z0-9]/.test(pwd);
    var classes = (hasLower?1:0) + (hasUpper?1:0) + (hasDigit?1:0) + (hasSym?1:0);
    if (classes >= 2) s++;
    if (classes >= 3) s++;
    if (classes < 3) sug.push('Campur huruf besar, kecil, angka, simbol');

    // Penalize common words / repeats / sequential
    var lower = pwd.toLowerCase();
    for (var i = 0; i < COMMON.length; i++) {
      if (lower.indexOf(COMMON[i]) !== -1) {
        s -= 2;
        sug.push('Hindari kata umum seperti "' + COMMON[i] + '"');
        break;
      }
    }
    if (/^(.)\1+$/.test(pwd)) { s -= 2; sug.push('Hindari karakter berulang'); }
    if (/0123|1234|2345|3456|4567|5678|6789|abcd|qwerty/i.test(pwd)) {
      s -= 1; sug.push('Hindari urutan keyboard / angka');
    }

    // Clamp to 0..3
    var level = Math.max(0, Math.min(3, s - 1));
    var labels = ['Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
    var colors = ['#ff5c7c', '#f7b955', '#5fd5b8', '#00e5d4'];

    if (sug.length === 0 && level < 3) sug.push('Tambah panjang untuk lebih aman');

    return {
      level: level,
      label: labels[level],
      color: colors[level],
      suggestions: sug
    };
  }

  function renderMeter(container, result) {
    if (!container) return;
    var bars = '';
    for (var i = 0; i < 4; i++) {
      var on = i <= result.level;
      bars += '<span class="aervinex-pwd-bar" style="' +
        'flex:1;height:4px;border-radius:2px;background:' +
        (on ? result.color : 'rgba(255,255,255,0.08)') + '"></span>';
    }
    container.innerHTML = ''; // safe — building from trusted vars below
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:4px;margin-top:6px';
    wrap.innerHTML = bars;
    container.appendChild(wrap);
    var label = document.createElement('div');
    label.style.cssText = 'font-size:11px;color:' + result.color + ';margin-top:4px;font-weight:600';
    label.textContent = 'Kekuatan: ' + result.label;
    container.appendChild(label);
    if (result.suggestions && result.suggestions.length) {
      var hint = document.createElement('div');
      hint.style.cssText = 'font-size:10.5px;color:var(--text-muted,#888);margin-top:2px';
      hint.textContent = result.suggestions[0];
      container.appendChild(hint);
    }
  }

  function attach(input, container) {
    if (!input || !container) return;
    var handler = function () {
      var r = score(input.value);
      renderMeter(container, r);
    };
    input.addEventListener('input', handler);
    input.addEventListener('change', handler);
    handler();
  }

  window.AervinexPasswordStrength = {
    score: score,
    renderMeter: renderMeter,
    attach: attach,
    // Minimum acceptable level for register form (level >= 1 = "Cukup")
    MIN_ACCEPTABLE_LEVEL: 1
  };
})();
