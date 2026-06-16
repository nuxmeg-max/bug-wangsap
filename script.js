/* ═══════════════════════════════════════════
   POPUP
═══════════════════════════════════════════ */
function closePopup() {
  const overlay = document.getElementById('popup');
  overlay.style.animation = 'fadeOut .3s ease forwards';
  setTimeout(() => overlay.remove(), 300);
}

/* ═══════════════════════════════════════════
   RUNTIME COUNTER
═══════════════════════════════════════════ */
let seconds = 0;
setInterval(() => {
  seconds++;
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  document.getElementById('runtime').textContent = `${h}:${m}:${s}`;
}, 1000);

/* ═══════════════════════════════════════════
   USER COUNT (RANDOM DRIFT)
═══════════════════════════════════════════ */
let baseCount = 2847;
setInterval(() => {
  baseCount += Math.floor(Math.random() * 5) - 2;
  if (baseCount < 2800) baseCount = 2800;
  document.getElementById('user-count').textContent = baseCount.toLocaleString('id');
}, 3500);

/* ═══════════════════════════════════════════
   BATTERY
═══════════════════════════════════════════ */
async function initBattery() {
  const valEl  = document.getElementById('battery-val');
  const fillEl = document.getElementById('battery-fill');
  const iconEl = document.getElementById('bat-icon');

  function render(level) {
    const pct = Math.round(level * 100);
    valEl.textContent  = pct + '%';
    fillEl.style.width = pct + '%';

    // change icon based on level
    iconEl.className = 'fa-solid card-icon ' + (
      pct > 75 ? 'fa-battery-full' :
      pct > 50 ? 'fa-battery-three-quarters' :
      pct > 25 ? 'fa-battery-half' :
                 'fa-battery-quarter'
    );
  }

  try {
    const bat = await navigator.getBattery();
    render(bat.level);
    bat.addEventListener('levelchange', () => render(bat.level));
  } catch {
    // fallback: random 55–90%
    const pct = (55 + Math.floor(Math.random() * 36)) / 100;
    render(pct);
  }
}

initBattery();

/* ═══════════════════════════════════════════
   BUG SELECTOR
═══════════════════════════════════════════ */
document.querySelectorAll('.bug-option').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.bug-option').forEach(x => x.classList.remove('selected'));
    el.classList.add('selected');
  });
});

/* ═══════════════════════════════════════════
   AUDIO
═══════════════════════════════════════════ */
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const tones = [880, 660, 1100, 440, 880];
    tones.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain.gain.linearRampToValueAtTime(0, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  } catch (_) {}

  const audio = document.getElementById('send-sound');
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}

function playSuccess() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.14;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch (_) {}
}

/* ═══════════════════════════════════════════
   PROGRESS LOG MESSAGES
═══════════════════════════════════════════ */
const LOG_MSGS = [
  '> connecting to exploit server...',
  '> authenticating payload...',
  '> bypassing WA security layer...',
  '> injecting malformed packet...',
  '> targeting device...',
  '> deploying exploit module...',
  '> finalizing attack...',
  '> done.',
];

/* ═══════════════════════════════════════════
   SEND BUG
═══════════════════════════════════════════ */
function sendBug() {
  const phoneEl   = document.getElementById('phone-input');
  const selectedEl = document.querySelector('.bug-option.selected');
  const btn       = document.getElementById('send-btn');
  const progWrap  = document.getElementById('progress-wrap');
  const progFill  = document.getElementById('progress-fill');
  const progText  = document.getElementById('progress-text');
  const progPct   = document.getElementById('progress-pct');
  const progLog   = document.getElementById('progress-log');
  const resultBox = document.getElementById('result-box');
  const resultMsg = document.getElementById('result-msg');

  const phone = phoneEl.value.trim();

  // Validation
  if (!phone || phone.length < 8) {
    phoneEl.style.animation = 'shake .4s ease';
    phoneEl.style.borderColor = 'rgba(255,77,158,0.5)';
    setTimeout(() => {
      phoneEl.style.animation = '';
      phoneEl.style.borderColor = '';
    }, 500);
    return;
  }

  const bugType = selectedEl
    ? selectedEl.querySelector('.bug-name').textContent
    : 'App Crash';

  // Play sound
  playBeep();

  // Set loading UI
  btn.classList.add('loading');
  btn.innerHTML = '<i class="fa-solid fa-spinner" style="animation:spin 1s linear infinite"></i><span>PROCESSING...</span>';
  btn.disabled = true;

  resultBox.classList.remove('show');
  progWrap.classList.add('show');
  progFill.style.width = '0%';
  progPct.textContent  = '0%';
  progLog.textContent  = '';

  let prog    = 0;
  let msgIdx  = -1;

  const tick = setInterval(() => {
    prog += (Math.random() * 3.5) + 0.8;
    if (prog > 100) prog = 100;

    progFill.style.width = prog + '%';
    progPct.textContent  = Math.floor(prog) + '%';

    const newIdx = Math.min(
      Math.floor(prog / (100 / LOG_MSGS.length)),
      LOG_MSGS.length - 1
    );

    if (newIdx !== msgIdx) {
      msgIdx = newIdx;
      progText.textContent = LOG_MSGS[msgIdx].replace('> ', '').replace('...', '').trim();
      progLog.textContent  = LOG_MSGS[msgIdx];
    }

    if (prog >= 100) {
      clearInterval(tick);
      setTimeout(finish, 400);
    }
  }, 85);

  function finish() {
    progWrap.classList.remove('show');
    resultBox.classList.add('show');
    resultMsg.textContent =
      `Bug "${bugType}" berhasil dikirim ke nomor +62${phone}.`;

    btn.classList.remove('loading');
    btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i><span>KIRIM LAGI</span>';
    btn.disabled  = false;

    playSuccess();
  }
}
