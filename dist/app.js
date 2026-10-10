import {products, sanitiseCart, updateQuantity, cartCount, cartTotal, recommend} from './store.js?v=6';
import {t, number, price, localizedProduct, toggleLanguage} from './i18n.js?v=6';
import {mountHeroDepth} from './hero-depth.js';

const q = selector => document.querySelector(selector);
q('.bean-scene').innerHTML = '<img class="discovery-art" src="assets/discovery-v2.webp" alt="" width="1536" height="1024" loading="lazy">';
const panel = q('#site-panel'), content = q('#panel-content');
const safe = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const read = (key, fallback) => {try {return JSON.parse(localStorage.getItem(key)) ?? fallback;} catch {return fallback;}};
const save = (key, value) => {try {localStorage.setItem(key, JSON.stringify(value));} catch {/* The current session remains usable without storage. */}};
let cart = sanitiseCart(read('brww-bag', []));
let preferences = read('brww-preferences', {name:'', coffee:'latte'});
if (!preferences || typeof preferences !== 'object') preferences = {name:'', coffee:'latte'};
preferences.name = typeof preferences.name === 'string' ? preferences.name.slice(0,40) : '';
let currentPanel = '', quizAnswers = [], quizStep = 0, quizFinished = false, lastFocus = null, toastTimer;
const catalog = () => products.map(localizedProduct);
const product = id => {const found = products.find(item => item.id === id); return found && localizedProduct(found);};
const title = (eyebrow, text) => `<p class="panel-eyebrow">${safe(eyebrow)}</p><h2 id="panel-title" tabindex="-1">${safe(text)}</h2>`;
const productItem = p => `<div class="panel-item"><img src="${p.image}" alt="${p.name}" width="52" height="76"><div class="item-copy"><h3>${p.name}</h3><p>${p.note}</p><strong>${price(p.cents)}</strong></div><button class="add-button" data-add="${p.id}" aria-label="${t('product.add', {name:p.name})}">+</button></div>`;

function toast(text) {
  q('.toast').textContent = text;
  q('.toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => q('.toast').classList.remove('visible'), 2500);
}
function updateBag() {
  save('brww-bag', cart);
  const count = cartCount(cart);
  q('.cart-count').textContent = number(count);
  q('.cart-count').hidden = !count;
  q('.cart-toggle').setAttribute('aria-label', t(count === 1 ? 'bag.labelOne' : 'bag.label', {count:number(count)}));
}
function updateNavigationLabel() {
  q('.mobile-toggle').setAttribute('aria-label', t(document.body.classList.contains('nav-open') ? 'nav.close' : 'nav.open'));
}
function closeNavigation() {
  document.body.classList.remove('nav-open');
  q('.mobile-toggle').setAttribute('aria-expanded','false');
  updateNavigationLabel();
}
function focusTitle() {content.querySelector('#panel-title')?.focus({preventScroll:true});}
function openPanel(type) {
  if (!panel.open) lastFocus = document.activeElement;
  closeNavigation();
  currentPanel = type;
  renderPanel(type);
  if (!panel.open) panel.showModal();
  document.body.style.overflow = 'hidden';
  focusTitle();
}
function closePanel() {panel.close();}
panel.addEventListener('close', () => {document.body.style.overflow = ''; currentPanel = ''; lastFocus?.focus({preventScroll:true});});
panel.addEventListener('click', event => {
  if (event.target !== panel) return;
  const r = panel.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closePanel();
});
q('.panel-close').addEventListener('click', closePanel);

function renderPanel(type) {
  if (type === 'cart') {
    content.innerHTML = title(t('bag.eyebrow'), t('bag.title')) + (cart.length ?
      `<div class="panel-items">${cart.map(row => {
        const p = product(row.id);
        return `<div class="panel-item"><img src="${p.image}" alt="${p.name}"><div class="item-copy"><h3>${p.name}</h3><p>${t('product.each',{price:price(p.cents)})}</p></div><div class="quantity"><button data-quantity="${p.id}" data-change="-1" aria-label="${t('product.removeOne',{name:p.name})}">−</button><span aria-label="${t('bag.quantity')}">${number(row.quantity)}</span><button data-quantity="${p.id}" data-change="1" aria-label="${t('product.addOne',{name:p.name})}" ${row.quantity >= 99 ? 'disabled' : ''}>+</button></div></div>`;
      }).join('')}</div><div class="cart-total"><span>${t('bag.subtotal')}</span><strong>${price(cartTotal(cart))}</strong></div><button class="button primary" data-dialog="order">${t('bag.review')}</button><p><button class="back-button" data-close>${t('bag.explore')}</button></p>` :
      `<div class="panel-empty"><p>${t('bag.empty')}</p><button class="button primary" data-menu>${t('hero.explore')}</button></div>`);
  } else if (type === 'menu') {
    content.innerHTML = title(t('menu.eyebrow'),t('menu.title')) + `<p>${t('menu.intro')}</p><div class="panel-items">${catalog().map(productItem).join('')}</div><button class="button outline-button" data-dialog="cart">${t('menu.viewBag')}</button>`;
  } else if (type === 'reviews') {
    content.innerHTML = title(t('reviews.eyebrow'),t('reviews.title')) + `<div class="panel-items">${catalog().map(p => `<div class="panel-item"><img src="${p.image}" alt="${p.name}"><div class="item-copy"><h3>${p.name}</h3><div class="rating-large" aria-label="${t('rating.label',{rating:number(Number(p.rating))})}">★★★★★</div><p>${t('rating.label',{rating:number(Number(p.rating))})} · ${p.note}</p></div></div>`).join('')}</div><button class="button primary" data-dialog="menu">${t('reviews.explore')}</button>`;
  } else if (type === 'preferences') {
    content.innerHTML = title(t('preferences.eyebrow'),preferences.name ? t('preferences.greeting',{name:preferences.name}) : t('preferences.title')) + `<p>${t('preferences.intro')}</p><form id="preferences-form"><label>${t('preferences.name')}<input name="name" maxlength="40" autocomplete="given-name" dir="auto" placeholder="${t('preferences.placeholder')}" value="${safe(preferences.name)}"></label><div class="panel-options">${catalog().map(p => `<label class="option-button"><input type="radio" name="coffee" value="${p.id}" ${preferences.coffee === p.id ? 'checked' : ''}>${p.name}</label>`).join('')}</div><button class="button primary" type="submit">${t('preferences.save')}</button><small>${t('preferences.local')}</small></form>`;
  } else if (type === 'quiz') {
    quizAnswers = []; quizStep = 0; quizFinished = false; renderQuiz();
  } else if (type === 'order') {
    if (!cart.length) {renderPanel('cart'); currentPanel = 'cart'; return;}
    content.innerHTML = title(t('order.eyebrow'),t('order.title')) + `<div class="panel-items">${cart.map(row => {
      const p = product(row.id);
      return `<div class="panel-item"><div class="item-copy"><h3>${number(row.quantity)} × ${p.name}</h3></div><strong>${price(p.cents * row.quantity)}</strong></div>`;
    }).join('')}</div><div class="cart-total"><span>${t('order.total')}</span><strong>${price(cartTotal(cart))}</strong></div><p class="checkout-note">${t('order.preview')}</p><button class="button primary" data-dialog="cart">${t('order.back')}</button>`;
  } else if (type === 'news') {
    content.innerHTML = title(t('news.eyebrow'),t('news.title')) + `<p>${t('news.first')}</p><p>${t('news.second')}</p><button class="button primary" data-dialog="quiz">${t('quiz.find')}</button>`;
  }
}
const questions = [
  {title:'quiz.1.title', options:[['classic','quiz.1.classic'],['chocolate','quiz.1.chocolate']]},
  {title:'quiz.2.title', options:[['balanced','quiz.2.balanced'],['creamy','quiz.2.creamy']]},
  {title:'quiz.3.title', options:[['morning','quiz.3.morning'],['afternoon','quiz.3.afternoon'],['evening','quiz.3.evening']]}
];
function renderQuiz() {
  const step = questions[quizStep];
  content.innerHTML = title(t('quiz.find'),t(step.title)) + `<div class="quiz-progress" aria-label="${t('quiz.progress',{step:number(quizStep + 1)})}">${questions.map((_,i) => `<span class="${i <= quizStep ? 'done' : ''}"></span>`).join('')}</div><div class="panel-options">${step.options.map(([id,label]) => `<button class="option-button" data-answer="${id}">${t(label)}</button>`).join('')}</div>${quizStep ? `<button class="back-button" data-quiz-back>${t('quiz.back')}</button>` : ''}`;
  focusTitle();
}
function showResult() {
  quizFinished = true;
  const p = product(recommend(quizAnswers));
  content.innerHTML = title(t('quiz.match'),p.name) + `<div class="quiz-result"><img src="${p.image}" alt="${p.name}" width="110" height="165"><div><p>${p.note}</p><strong>${price(p.cents)}</strong></div></div><button class="button primary" data-add="${p.id}" data-result>${t('quiz.add')}</button><p><button class="back-button" data-dialog="quiz">${t('quiz.again')}</button></p>`;
  preferences.coffee = p.id; save('brww-preferences',preferences); focusTitle();
}

document.addEventListener('click', event => {
  const el = event.target.closest('button,a'); if (!el) return;
  if (el.hasAttribute('data-language-switch')) {
    toggleLanguage(); updateBag(); updateNavigationLabel();
    q('.toast').classList.remove('visible'); q('.toast').textContent = ''; clearTimeout(toastTimer);
    if (panel.open) {if(currentPanel === 'quiz') {if(quizFinished)showResult(); else renderQuiz();} else renderPanel(currentPanel);}
    return;
  }
  if (el.dataset.add) {
    const p = product(el.dataset.add); if (!p) return;
    cart = updateQuantity(cart,p.id,1); updateBag(); toast(t('product.added',{name:p.name}));
    el.classList.add('added'); setTimeout(() => el.classList.remove('added'),400); return;
  }
  if (el.dataset.quantity) {
    const {quantity,change} = el.dataset;
    cart = updateQuantity(cart,quantity,Number(change)); updateBag(); renderPanel('cart');
    const nextFocus=content.querySelector(`[data-quantity="${quantity}"][data-change="${change}"]`);
    if(nextFocus)nextFocus.focus(); else focusTitle(); return;
  }
  if (el.dataset.dialog) {openPanel(el.dataset.dialog); return;}
  if (el.dataset.rating) {openPanel('reviews'); return;}
  if (el.hasAttribute('data-close')) {closePanel(); return;}
  if (el.hasAttribute('data-order')) {
    if(cart.length)openPanel('cart'); else {q('#menu').scrollIntoView({behavior:reduceMotion.matches ? 'instant' : 'smooth'}); toast(t('order.choose'));} return;
  }
  if (el.hasAttribute('data-menu')) {closePanel(); q('#menu').scrollIntoView({behavior:reduceMotion.matches ? 'instant' : 'smooth'}); return;}
  if (el.dataset.answer) {quizAnswers[quizStep]=el.dataset.answer; if(quizStep<2){quizStep++;renderQuiz();} else showResult(); return;}
  if (el.hasAttribute('data-quiz-back')) {quizStep=Math.max(0,quizStep-1); quizAnswers=quizAnswers.slice(0,quizStep); renderQuiz(); return;}
  if (el.closest('.main-nav') || el.classList.contains('wordmark')) closeNavigation();
});
document.addEventListener('submit', event => {
  if(event.target.id !== 'preferences-form')return;
  event.preventDefault(); const data=new FormData(event.target);
  preferences={name:String(data.get('name') || '').trim().slice(0,40), coffee:product(data.get('coffee'))?.id || 'latte'};
  save('brww-preferences',preferences); closePanel(); toast(t('preferences.saved'));
});
q('.mobile-toggle').addEventListener('click', () => {
  const open=document.body.classList.toggle('nav-open');
  q('.mobile-toggle').setAttribute('aria-expanded',String(open)); updateNavigationLabel();
});
document.addEventListener('keydown', event => {if(event.key === 'Escape')closeNavigation();});

const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
mountHeroDepth(q('.hero'),q('.hero-art'),reduceMotion);
const discoveryArt=q('.discovery-art');
let discoveryVisible=false;
function updateDiscoveryMotion(){discoveryArt.classList.toggle('motion-running',discoveryVisible&&!document.hidden);}
const discoveryObserver=new IntersectionObserver(entries=>{discoveryVisible=entries[0].isIntersecting;updateDiscoveryMotion();},{rootMargin:'50px'});
discoveryObserver.observe(discoveryArt);
document.addEventListener('visibilitychange',updateDiscoveryMotion);
const cup=q('#turning-cup'),about=q('.about'),cupContainer=q('.cup-scene'),marquee=q('.marquee span');
const benefits=[...document.querySelectorAll('.benefit')];
benefits.forEach(el=>el.classList.add('scroll-reveal'));
let ticking=false,modelRequested=false,cupVisible=false;
const cupPoster='assets/cup-poster-v3.webp',cupAnimation='assets/cup-animation-v3.webp';
const cupVideo=document.createElement('video');
cupVideo.className='cup-video';cupVideo.muted=true;cupVideo.loop=true;cupVideo.playsInline=true;
cupVideo.setAttribute('muted','');cupVideo.setAttribute('playsinline','');cupVideo.setAttribute('aria-hidden','true');
cupVideo.preload='none';cupVideo.poster=cupPoster;cupContainer.append(cupVideo);
let videoFailed=new URLSearchParams(location.search).get('cup-renderer')==='webp',playPending=false;
function imageFallback(){videoFailed=true;cupContainer.classList.remove('video-ready');updateCupFallback();}
cupVideo.addEventListener('error',imageFallback);
cupVideo.addEventListener('playing',()=>{
  if(cupContainer.classList.contains('webgl-ready')||!cupVisible||document.hidden||reduceMotion.matches){cupVideo.pause();return;}
  cupContainer.classList.add('video-ready');cupContainer.dataset.renderer='pre-rendered-video';
});
function updateCupFallback(){
  const fallback=!cupContainer.classList.contains('webgl-ready');
  const animated=fallback&&cupVisible&&!document.hidden&&!reduceMotion.matches;
  cupContainer.dataset.motion=reduceMotion.matches?'reduced':cupVisible&&!document.hidden?'running':'paused';
  if(!fallback||!animated){cupVideo.pause();cupContainer.classList.remove('video-ready');}
  if(animated&&modelRequested&&cupContainer.dataset.renderer?.startsWith('pre-rendered')&&!videoFailed){
    if(!cupVideo.getAttribute('src'))cupVideo.src='assets/cup-animation-v3.mp4';
    if(cupVideo.paused&&!playPending){playPending=true;cupVideo.play().catch(error=>{if(error.name!=='AbortError')imageFallback();}).finally(()=>{playPending=false;});}
  }
  const next=animated&&videoFailed?cupAnimation:cupPoster;
  if(cup.getAttribute('src')!==next)cup.src=next;
}
function loadCup(){
  if(modelRequested)return;modelRequested=true;
  if(['image','webp'].includes(new URLSearchParams(location.search).get('cup-renderer'))){
    cupContainer.dataset.renderer='pre-rendered';updateCupFallback();return;
  }
  import('./cup-scene.js').then(async({mountCup})=>{
    const model=await mountCup(cupContainer);
    if(!model){cupContainer.dataset.renderer='pre-rendered';cupContainer.dataset.fallbackReason='webgl2-unavailable';}
    updateCupFallback();
  }).catch(error=>{
    cupContainer.dataset.renderer='pre-rendered';cupContainer.dataset.fallbackReason='renderer-load-failed';
    console.warn('BRWW: using the pre-rendered cup animation.',error);updateCupFallback();
  });
}
const cupLoader=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))loadCup();},{rootMargin:'600px'});cupLoader.observe(about);
const cupVisibility=new IntersectionObserver(entries=>{cupVisible=entries[0].isIntersecting;updateCupFallback();},{rootMargin:'80px'});cupVisibility.observe(cupContainer);
cupContainer.addEventListener('cup-renderer-change',updateCupFallback);
document.addEventListener('visibilitychange',updateCupFallback);
function drawScroll(){
  ticking=false;const scale=parseFloat(getComputedStyle(document.documentElement).fontSize);
  for(const el of benefits){
    const r=el.getBoundingClientRect();
    if(reduceMotion.matches||r.top<innerHeight*.84)el.classList.add('revealed');
    else if(r.top>innerHeight*1.04)el.classList.remove('revealed');
  }
  if(!reduceMotion.matches)marquee.style.transform=`translateX(${-157*scale-Math.min(scrollY,1300)*.11}px)`;
}
function queueScroll(){if(!ticking){ticking=true;requestAnimationFrame(drawScroll);}}
addEventListener('scroll',queueScroll,{passive:true});addEventListener('resize',queueScroll);
reduceMotion.addEventListener('change',()=>{updateCupFallback();queueScroll();});
updateBag();drawScroll();
