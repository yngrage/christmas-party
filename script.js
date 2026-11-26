const EVENT = {
  mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=18.8715876%2C73.2919792',
  whatsappNumber: '919137842768',
  startsAt: new Date('2026-12-26T20:00:00+05:30')
};

const deck = document.querySelector('#story-deck');
const slides = [...document.querySelectorAll('.story-slide')];
const slideCount = document.querySelector('#slide-count');
const pageRoutes = ['#home', '#details', '#rsvp'];
let currentSlide = 0;

function slideIndexForHash(hash) {
  const id = hash.replace(/^#/, '');
  if (id === 'rsvp' || id === 'slide-three') return 2;
  if (id === 'details' || id === 'location' || id === 'slide-two') return 1;
  return 0;
}
function renderSlideNavigation() {
  slideCount.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  document.querySelector('#previous-slide').disabled = currentSlide === 0;
  document.querySelector('#next-slide').disabled = currentSlide === slides.length - 1;
}
function goToSlide(index, { behavior = 'smooth', updateRoute = true } = {}) {
  currentSlide = Math.max(0, Math.min(slides.length - 1, index));
  deck.scrollTo({ top: currentSlide * deck.clientHeight, behavior });
  slides[currentSlide].scrollTop = 0;
  renderSlideNavigation();
  if (updateRoute && location.hash !== pageRoutes[currentSlide]) {
    history.replaceState(null, '', pageRoutes[currentSlide]);
  }
}

document.querySelector('#previous-slide').addEventListener('click', () => goToSlide(currentSlide - 1));
document.querySelector('#next-slide').addEventListener('click', () => goToSlide(currentSlide + 1));
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  event.preventDefault();
  goToSlide(slideIndexForHash(link.getAttribute('href')));
});
addEventListener('hashchange', () => goToSlide(slideIndexForHash(location.hash), { updateRoute: false }));
const initialSlide = slideIndexForHash(location.hash);
requestAnimationFrame(() => goToSlide(initialSlide, { behavior: 'auto', updateRoute: false }));

// Map links always point to the verified venue pin. The embedded preview is a visual aid;
// the button opens directions in Google Maps on phones and desktop browsers.
document.querySelectorAll('#map-link, .detail-item-link').forEach(link => {
  link.href = EVENT.mapUrl;
  link.target = '_blank';
  link.rel = 'noopener';
});

// Lightweight snowfall with a reduced-motion and canvas fallback.
const canvas = document.querySelector('#snow-canvas');
const ctx = canvas?.getContext('2d');
let flakes = [];
let pointerX = 0;
function resizeSnow() {
  if (!ctx) return;
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : Math.min(55, Math.round(innerWidth / 18));
  flakes = Array.from({ length: count }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 2 + 0.6, v: Math.random() * 0.5 + 0.25 }));
}
function snowFrame() {
  if (!ctx) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.fillStyle = 'rgba(255,248,237,.68)';
  for (const flake of flakes) {
    ctx.beginPath(); ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2); ctx.fill();
    flake.y += flake.v;
    flake.x += Math.sin(flake.y / 55) * 0.25 + pointerX * 0.00035;
    if (flake.y > innerHeight + 4) { flake.y = -4; flake.x = Math.random() * innerWidth; }
  }
  requestAnimationFrame(snowFrame);
}
resizeSnow(); snowFrame();
addEventListener('resize', resizeSnow, { passive: true });
addEventListener('pointermove', event => { pointerX = event.clientX - innerWidth / 2; }, { passive: true });

// Welcome overlay appears on a fresh visit; direct RSVP links open straight to the form.
const intro = document.querySelector('#christmas-intro');
function enterInvite() {
  intro.classList.add('is-hidden');
  sessionStorage.setItem('christmasIntroSeen', 'yes');
  setTimeout(() => intro.remove(), 950);
}
if (location.hash || sessionStorage.getItem('christmasIntroSeen')) intro.remove();
document.querySelector('#enter-magic').addEventListener('click', enterInvite);
document.querySelector('#skip-intro').addEventListener('click', enterInvite);

// Countdown uses the event's India Standard Time start.
const countdown = document.querySelector('#countdown');
function updateCountdown() {
  if (!countdown) return;
  const remaining = EVENT.startsAt - Date.now();
  if (remaining <= 0) { countdown.innerHTML = '<strong>THE CELEBRATION IS HERE</strong>'; return; }
  const values = [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60];
  countdown.querySelectorAll('b').forEach((item, index) => item.textContent = String(values[index]).padStart(2, '0'));
}
updateCountdown(); setInterval(updateCountdown, 1000);

// Santa is a single, dismissible surprise after a little exploration.
const santa = document.querySelector('#santa-surprise');
const toast = document.querySelector('#magic-toast');
let explored = false, santaShown = false, toastTimer;
function message(value) {
  toast.textContent = value;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}
function showSanta() {
  if (!explored || santaShown || currentSlide > 1) return;
  santaShown = true;
  santa.classList.add('is-visible');
  santa.setAttribute('aria-hidden', 'false');
}
const santaTimer = setTimeout(showSanta, 52000 + Math.random() * 18000);
deck.addEventListener('scroll', () => { explored = true; if (Date.now() > performance.timeOrigin + 52000) showSanta(); }, { passive: true });
document.querySelector('#santa-close').addEventListener('click', () => {
  santa.classList.remove('is-visible'); santa.setAttribute('aria-hidden', 'true'); clearTimeout(santaTimer);
});
document.querySelector('#santa-magic').addEventListener('click', () => {
  message('Christmas magic sent. See you at the party.');
  santa.classList.remove('is-visible'); santa.setAttribute('aria-hidden', 'true');
});

// Music waits for a visitor's tap, as required by mobile browsers.
const audio = document.querySelector('#christmas-audio');
const musicButton = document.querySelector('#music-toggle');
const musicStatus = document.querySelector('#music-status');
const volume = document.querySelector('#music-volume');
audio.volume = Number(volume.value);
volume.addEventListener('input', () => audio.volume = Number(volume.value));
audio.addEventListener('canplay', () => { musicStatus.textContent = 'Let It Snow · ready when you are'; musicButton.disabled = false; });
audio.addEventListener('error', () => { musicStatus.textContent = 'Add your licensed MP3 to play'; musicButton.disabled = true; });
musicButton.addEventListener('click', async () => {
  if (audio.paused) {
    try { await audio.play(); musicButton.textContent = 'Ⅱ'; musicButton.setAttribute('aria-label', 'Pause Christmas music'); musicStatus.textContent = 'Let It Snow · playing'; }
    catch { musicStatus.textContent = 'Music is not available in this browser'; }
  } else {
    audio.pause(); musicButton.textContent = '♫'; musicButton.setAttribute('aria-label', 'Play Christmas music'); musicStatus.textContent = 'Let It Snow · paused';
  }
});

// WhatsApp handoff: visitors review and send the prefilled message themselves.
const form = document.querySelector('#rsvp-form');
const status = document.querySelector('#form-status');
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const details = [
    'Christmas with the Fernandes Family — RSVP',
    `Name: ${data.get('name').trim()}`,
    `Mobile / WhatsApp: ${data.get('contact').trim()}`,
    `Number of people: ${data.get('guests')}`,
    `Staying overnight: ${data.get('overnight')}`,
    data.get('email').trim() ? `Email: ${data.get('email').trim()}` : '',
    data.get('notes').trim() ? `Dietary / accessibility notes: ${data.get('notes').trim()}` : ''
  ].filter(Boolean).join('\n');
  if (!confirm(`Ready to open WhatsApp with this RSVP for the Fernandes Family?\n\n${details}\n\nWhatsApp will open so you can review the message and tap Send.`)) return;
  status.textContent = 'WhatsApp is opening with your RSVP. Review the details and tap Send to reserve your spot.';
  location.assign(`https://wa.me/${EVENT.whatsappNumber}?text=${encodeURIComponent(details)}`);
});
