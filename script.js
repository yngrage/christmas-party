const EVENT = {
  mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=18.8715876%2C73.2919792',
  whatsappNumber: '919137842768',
  startsAt: new Date('2026-12-26T20:00:00+05:30')
};

document.querySelectorAll('#map-link').forEach(link => link.href = EVENT.mapUrl);

// Gentle snowfall canvas: capped particle count keeps phones cool.
const canvas = document.querySelector('#snow-canvas');
const ctx = canvas.getContext('2d');
let flakes = [], pointerX = 0, frame;
function resizeSnow() {
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = innerWidth * ratio; canvas.height = innerHeight * ratio;
  canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : Math.min(65, Math.round(innerWidth / 16));
  flakes = Array.from({length: count}, () => ({x: Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*2.2+.6,v:Math.random()*.55+.25,s:Math.random()*.45+.15}));
}
function snowFrame() {
  ctx.clearRect(0,0,innerWidth,innerHeight); ctx.fillStyle='rgba(255,248,237,.72)';
  for (const f of flakes) { ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.fill(); f.y+=f.v; f.x+=Math.sin(f.y/55)*f.s+pointerX*.0005; if(f.y>innerHeight+4){f.y=-4;f.x=Math.random()*innerWidth;} }
  frame=requestAnimationFrame(snowFrame);
}
resizeSnow(); snowFrame(); addEventListener('resize',resizeSnow,{passive:true});
addEventListener('pointermove',e=>{pointerX=e.clientX-innerWidth/2},{passive:true});

// Cinematic entry, shown once per browser tab. Skip and enter lead to the same invite.
const intro=document.querySelector('#christmas-intro');
function enterInvite(){intro.classList.add('is-hidden');sessionStorage.setItem('christmasIntroSeen','yes');setTimeout(()=>intro.remove(),1100);}
if(sessionStorage.getItem('christmasIntroSeen')||(location.hash&&location.hash!=='#home')){
  intro.remove();
  sessionStorage.setItem('christmasIntroSeen','yes');
}
document.querySelector('#enter-magic').addEventListener('click',enterInvite);
document.querySelector('#skip-intro').addEventListener('click',enterInvite);

// Countdown to the event in Indian Standard Time.
const countdown=document.querySelector('#countdown');
function updateCountdown(){
  const ms=EVENT.startsAt-Date.now();
  if(ms<=0){countdown.innerHTML='<strong>THE MAGIC IS HERE — SEE YOU TONIGHT!</strong>';return;}
  const vals=[Math.floor(ms/86400000),Math.floor(ms/3600000)%24,Math.floor(ms/60000)%60,Math.floor(ms/1000)%60];
  countdown.querySelectorAll('b').forEach((n,i)=>n.textContent=String(vals[i]).padStart(2,'0'));
}
updateCountdown();setInterval(updateCountdown,1000);

// Surprise Santa after a randomized, non-repeat delay, only once the guest explores.
const santa=document.querySelector('#santa-surprise'); let explored=false, santaShown=false;
const showSanta=()=>{if(explored&&!santaShown&&currentSlide<2){santaShown=true;santa.classList.add('is-visible');santa.setAttribute('aria-hidden','false');}};
const santaTimer=setTimeout(showSanta,50000+Math.random()*30000);
addEventListener('scroll',()=>{explored=true;if(Date.now()>performance.timeOrigin+50000)showSanta();},{passive:true});
document.querySelector('#santa-close').addEventListener('click',()=>{santa.classList.remove('is-visible');santa.setAttribute('aria-hidden','true');clearTimeout(santaTimer);});
const toast=document.querySelector('#magic-toast');let toastTimer;
function message(text){toast.textContent=text;toast.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),3600);}
document.querySelector('#santa-magic').addEventListener('click',()=>{message('Christmas magic sent. See you at the party.');santa.classList.remove('is-visible');});
document.querySelector('#gift-surprise').addEventListener('click',()=>message('Your gift: one extra helping of Christmas pudding.'));
document.querySelectorAll('[data-sound="bell"]').forEach(b=>b.addEventListener('click',()=>{b.classList.add('ringing');setTimeout(()=>b.classList.remove('ringing'),650);message('A little Christmas cheer for you.');}));
document.querySelector('.hero-art').addEventListener('click',e=>{if(e.target.closest('button'))return;message('A little sparkle for your Christmas wish.');});

// Music is opt-in. Add a licensed file named let-it-snow.mp3 beside index.html.
const audio=document.querySelector('#christmas-audio'), musicButton=document.querySelector('#music-toggle'), musicStatus=document.querySelector('#music-status');
audio.src='let-it-snow.mp3'; audio.preload='metadata'; audio.volume=.55; audio.load(); musicStatus.textContent='Let It Snow · ready to play';
document.querySelector('#music-volume').addEventListener('input',e=>audio.volume=Number(e.target.value));
audio.addEventListener('canplay',()=>{musicStatus.textContent='Let It Snow · ready when you are';musicButton.disabled=false;});
audio.addEventListener('error',()=>{musicStatus.textContent='Let It Snow · add licensed MP3';musicButton.disabled=true;});
musicButton.disabled=false;
musicButton.addEventListener('click',async()=>{if(audio.paused){try{await audio.play();musicButton.textContent='Ⅱ';musicButton.setAttribute('aria-label','Pause Christmas music');musicStatus.textContent='Let It Snow · playing';}catch{musicStatus.textContent='Add a licensed MP3 to play';}}else{audio.pause();musicButton.textContent='♫';musicButton.setAttribute('aria-label','Play Christmas music');musicStatus.textContent='Let It Snow · paused';}});

const form=document.querySelector('#rsvp-form'), status=document.querySelector('#form-status');
form.addEventListener('submit',event=>{
  event.preventDefault(); if(!form.reportValidity())return;
  const data=new FormData(form);
  const details=['Christmas with the Fernandes Family — RSVP',`Name: ${data.get('name').trim()}`,`Mobile / WhatsApp: ${data.get('contact').trim()}`,`Number of people: ${data.get('guests')}`,`Staying overnight: ${data.get('overnight')}`,data.get('email').trim()?`Email: ${data.get('email').trim()}`:'',data.get('notes').trim()?`Dietary / accessibility notes: ${data.get('notes').trim()}`:''].filter(Boolean).join('\n');
  if(!confirm(`Ready to send this RSVP to the Fernandes Family on WhatsApp?\n\n${details}\n\nWhatsApp will open so you can review and tap Send.`))return;
  status.textContent='WhatsApp is opening with your RSVP. Review the details and tap Send to reserve your spot.';
  location.assign(`https://wa.me/${EVENT.whatsappNumber}?text=${encodeURIComponent(details)}`);
});

// Fade sections into view as they enter the viewport, while keeping content accessible.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('reveal-ready');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  document.querySelectorAll('main .story-slide').forEach(section => revealObserver.observe(section));
}


// Three-page, touch-friendly invitation deck. Scrolling and swiping snap between pages.
const deck = document.querySelector('#story-deck');
const slides = [...document.querySelectorAll('.story-slide')];
const slideCount = document.querySelector('#slide-count');
let currentSlide = 0;
function goToSlide(index) {
  currentSlide = Math.max(0, Math.min(slides.length - 1, index));
  slides[currentSlide].scrollIntoView({behavior:'smooth',block:'start'});
  renderSlideNavigation();
}
function renderSlideNavigation(){
  slideCount.textContent=`${String(currentSlide+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  document.querySelector('#previous-slide').disabled=currentSlide===0;
  document.querySelector('#next-slide').disabled=currentSlide===slides.length-1;
}
function updateVisibleSlide(){
  const root=deck.getBoundingClientRect();
  currentSlide=slides.reduce((best,slide,index)=>{
    const rect=slide.getBoundingClientRect();
    const visible=Math.max(0,Math.min(rect.bottom,root.bottom)-Math.max(rect.top,root.top));
    const bestRect=slides[best].getBoundingClientRect();
    const bestVisible=Math.max(0,Math.min(bestRect.bottom,root.bottom)-Math.max(bestRect.top,root.top));
    return visible>bestVisible?index:best;
  },0);
  renderSlideNavigation();
}
document.querySelector('#previous-slide').addEventListener('click',()=>goToSlide(currentSlide-1));
document.querySelector('#next-slide').addEventListener('click',()=>goToSlide(currentSlide+1));
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');
  if(!link)return;
  const target=document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1)));
  if(!target)return;
  const index=slides.findIndex(slide=>slide.contains(target));
  if(index<0)return;
  event.preventDefault();
  history.replaceState(null,'',link.getAttribute('href'));
  goToSlide(index);
});
let slideScrollFrame;
deck.addEventListener('scroll',()=>{
  cancelAnimationFrame(slideScrollFrame);
  slideScrollFrame=requestAnimationFrame(updateVisibleSlide);
},{passive:true});
const initialTarget=document.getElementById(decodeURIComponent(location.hash.slice(1)));
const initialIndex=initialTarget?slides.findIndex(slide=>slide.contains(initialTarget)):-1;
goToSlide(initialIndex>=0?initialIndex:0);
