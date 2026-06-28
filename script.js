const FORMSPREE_URL = 'https://formspree.io/f/mwvdbrbp';

const artFrame = document.getElementById('artFrame');
const question = document.getElementById('question');
const sub      = document.getElementById('sub');
const btnRow   = document.getElementById('btnRow');
const yesBtn   = document.getElementById('yesBtn');
const noBtn    = document.getElementById('noBtn');
const stageEl  = document.querySelector('.stage');

// ── Cute GIF art using real animated GIFs ──────────────────────
function makeImage(src, alt = '') {
  return `<img src="${src}" alt="${alt}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">`;
}

const ART = {
  shy: makeImage("1.png"),
  panda: makeImage("2.png"),
  sad: makeImage("3.png"),
  beg: makeImage("4.png"),
  hopeful: makeImage("4.png"),
  happy: makeImage("5.png"),
};

const stages = [
  { q: 'Do you love me? 🥺',                              s: 'nvn is all yours',                           art: ART.shy },
  { q: 'Please think again! 😢',                          s: 'Itni jaldi na matt bolo.',                   art: ART.panda },
  { q: 'Ek aur baar Soch lo! 😢',                         s: 'kya aisa kar rahi ho pls man jao 🙏',       art: ART.sad },
  { q: 'beautiful pls Man jao na! Kitna code likh waogi 💞', s: 'bhut gilt baat hai yrr You know the right button looks bigger now...',                 art: ART.beg },
  // { q: 'Last time, I promise! 🙏',                         s: 'You know the right button looks bigger now...', art: ART.hopeful },
];

let noClicks    = 0;
let escapedMode = false;

function setArt(html) {
  artFrame.innerHTML = html;
  artFrame.classList.remove('bump');
  requestAnimationFrame(() => artFrame.classList.add('bump'));
}

[
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png"
].forEach(src => {
  const img = new Image();
  img.src = src;
});


setArt(ART.shy);

function escapeStage() {
  noClicks++;
  const idx = Math.min(noClicks - 1, stages.length - 1);
  const s = stages[idx];

  question.style.opacity = 0;
  sub.style.opacity      = 0;

  setTimeout(() => {
    question.textContent = s.q;
    sub.textContent      = s.s;
    setArt(s.art);
    question.style.opacity = 1;
    sub.style.opacity      = 1;
  }, 160);

  growYesButton();

  if (noClicks >= 3 && !escapedMode) {
    escapedMode = true;
    noBtn.classList.add('escaped');
  }
  noBtn.textContent = noClicks >= 4 ? 'no' : 'No';

  if (escapedMode) placeEscapedButton();
}

function growYesButton() {
  const growth = Math.min(noClicks, 6);
  yesBtn.style.fontSize = (0.82 + growth * 0.06) + 'rem';
  yesBtn.style.padding  = (9 + growth * 2) + 'px ' + (22 + growth * 4) + 'px';
}

function placeEscapedButton() {
  const w = noBtn.offsetWidth  || 60;
  const h = noBtn.offsetHeight || 36;
  const margin = 16;
  const maxX = window.innerWidth  - w - margin;
  const maxY = window.innerHeight - h - margin;
  const x = margin + Math.random() * Math.max(maxX - margin, 40);
  const y = margin + Math.random() * Math.max(maxY - margin, 40);
  noBtn.style.left = x + 'px';
  noBtn.style.top  = y + 'px';
}

function dodgeInRow() {
  const rowRect = btnRow.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const maxX    = Math.max(rowRect.width - btnRect.width, 30);
  const randX   = (Math.random() - 0.5) * 2 * maxX * 0.5;
  const randY   = (Math.random() - 0.5) * 2 * 60;
  noBtn.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
  noBtn.style.transform  = `translate(${randX}px, ${randY}px)`;
}

const canHover = window.matchMedia('(hover: hover)').matches;
if (canHover) {
  noBtn.addEventListener('mouseenter', () => {
    if (escapedMode) placeEscapedButton();
    else dodgeInRow();
  });
}

noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  escapeStage();
  if (escapedMode) placeEscapedButton();
  else dodgeInRow();
});

window.addEventListener('resize', () => {
  if (escapedMode) placeEscapedButton();
});

// ── YES ─────────────────────────────────────────────────────────
yesBtn.addEventListener('click', async () => {
  showFinalState();
  launchConfetti();
  await notifyByEmail();
});

function showFinalState() {
  stageEl.classList.add('is-final');
  setArt(ART.happy);
  question.style.opacity = 0;
  sub.style.opacity      = 0;
  setTimeout(() => {
    question.textContent = 'I know it! You Love me a lot 🐱';
    sub.textContent      = '';
    question.style.opacity = 1;
  }, 160);
}

function launchConfetti() {
  const layer  = document.getElementById('confetti');
  const emojis = ['🎉', '💖', '✨', '🌸', '💌'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('span');
    piece.textContent            = emojis[Math.floor(Math.random() * emojis.length)];
    piece.style.left             = Math.random() * 100 + 'vw';
    piece.style.animationDuration = (2.4 + Math.random() * 1.8) + 's';
    piece.style.fontSize         = (0.9 + Math.random() * 1.1) + 'rem';
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 4500);
  }
}

async function notifyByEmail() {
  if (!FORMSPREE_URL || FORMSPREE_URL.includes('YOUR_FORM_ID')) {
    console.warn('Formspree endpoint not set.');
    return;
  }
  try {
    await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject:               '💌 She clicked Yes!',
        message:               `Yes was clicked after ${noClicks} "No" click(s).`,
        no_clicks_before_yes:  noClicks,
        time:                  new Date().toLocaleString(),
      }),
    });
  } catch (err) {
    console.warn('Could not send notification:', err);
  }
}
