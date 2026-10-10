import {products,money,sanitiseCart,updateQuantity,cartCount,cartTotal,recommend} from './store.js';
import {beans} from './beans.js';

const q=s=>document.querySelector(s);
q('.bean-scene').innerHTML=beans.map((bean,index)=>`<img class="bean airborne-bean" src="${bean.src}" alt="" width="${bean.width}" height="${bean.height}" style="--x:${bean.x}rem;--y:${bean.y}rem;--w:${bean.width}rem;--h:${bean.height}rem;--delay:${index*.16}s">`).join('')+'<img class="spoon" src="assets/spoon.webp" alt="" width="480" height="130">';
const panel=q('#site-panel'),content=q('#panel-content');
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* The current session remains usable when browser storage is disabled. */}};
let cart=sanitiseCart(read('brww-bag',[]));
let preferences=read('brww-preferences',{name:'',coffee:'latte'});
if(!preferences||typeof preferences!=='object')preferences={name:'',coffee:'latte'};
let currentPanel='',quizAnswers=[],quizStep=0,lastFocus=null,toastTimer;
const product=id=>products.find(p=>p.id===id);
const title=(eyebrow,text)=>`<p class="panel-eyebrow">${eyebrow}</p><h2 id="panel-title" tabindex="-1">${text}</h2>`;
const productItem=p=>`<div class="panel-item"><img src="${p.image}" alt="${p.name}" width="52" height="76"><div class="item-copy"><h3>${p.name}</h3><p>${p.note}</p><strong>${money(p.cents)}</strong></div><button class="add-button" data-add="${p.id}" aria-label="Add ${p.name} to your bag">+</button></div>`;
function toast(text){q('.toast').textContent=text;q('.toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>q('.toast').classList.remove('visible'),2500);}
function updateBag(){save('brww-bag',cart);const count=cartCount(cart);q('.cart-count').textContent=count;q('.cart-count').hidden=!count;q('.cart-toggle').setAttribute('aria-label',`Open shopping bag, ${count} ${count===1?'item':'items'}`);}
function focusTitle(){content.querySelector('#panel-title')?.focus({preventScroll:true});}
function openPanel(type){if(!panel.open)lastFocus=document.activeElement;currentPanel=type;renderPanel(type);if(!panel.open)panel.showModal();document.body.style.overflow='hidden';focusTitle();}
function closePanel(){panel.close();}
panel.addEventListener('close',()=>{document.body.style.overflow='';currentPanel='';lastFocus?.focus({preventScroll:true});});
panel.addEventListener('click',event=>{if(event.target===panel){const r=panel.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closePanel();}});
q('.panel-close').addEventListener('click',closePanel);

function renderPanel(type){
  if(type==='cart'){
    content.innerHTML=title('Made for your moment','Your coffee bag')+(cart.length?`<div class="panel-items">${cart.map(row=>{const p=product(row.id);return `<div class="panel-item"><img src="${p.image}" alt="${p.name}"><div class="item-copy"><h3>${p.name}</h3><p>${money(p.cents)} each</p></div><div class="quantity"><button data-quantity="${p.id}" data-change="-1" aria-label="Remove one ${p.name}">−</button><span aria-label="Quantity">${row.quantity}</span><button data-quantity="${p.id}" data-change="1" aria-label="Add one ${p.name}" ${row.quantity>=99?'disabled':''}>+</button></div></div>`;}).join('')}</div><div class="cart-total"><span>Subtotal</span><strong>${money(cartTotal(cart))}</strong></div><button class="button primary" data-dialog="order">Review your order</button><p><button class="back-button" data-close>Keep exploring</button></p>`:`<div class="panel-empty"><p>A little inspiration starts with a great cup. Choose your favourite from our coffee selection.</p><button class="button primary" data-menu>Explore Coffee</button></div>`);
  }else if(type==='menu'){
    content.innerHTML=title('The BRWW selection','Find your favourite')+`<p>Three favourites. One perfect coffee moment.</p><div class="panel-items">${products.map(productItem).join('')}</div><button class="button outline-button" data-dialog="cart">View your bag</button>`;
  }else if(type==='reviews'){
    content.innerHTML=title('Coffee collection','A taste worth discovering')+`<div class="panel-items">${products.map(p=>`<div class="panel-item"><img src="${p.image}" alt="${p.name}"><div class="item-copy"><h3>${p.name}</h3><div class="rating-large" aria-label="${p.rating} out of 5">★★★★★</div><p>${p.rating} / 5 · ${p.note}</p></div></div>`).join('')}</div><button class="button primary" data-dialog="menu">Explore the selection</button>`;
  }else if(type==='preferences'){
    content.innerHTML=title('Your daily ritual',preferences.name?`Hello, ${safe(preferences.name)}.`:'Make it your own.')+`<p>Keep your favourite coffee close.</p><form id="preferences-form"><label>Your name<input name="name" maxlength="40" autocomplete="given-name" placeholder="How should we call you?" value="${safe(preferences.name||'')}"></label><div class="panel-options">${products.map(p=>`<label class="option-button"><input style="width:auto;margin:0 9px 0 0" type="radio" name="coffee" value="${p.id}" ${preferences.coffee===p.id?'checked':''}>${p.name}</label>`).join('')}</div><button class="button primary" type="submit">Save my favourite</button><small>Your preference stays on this device.</small></form>`;
  }else if(type==='quiz'){
    quizAnswers=[];quizStep=0;renderQuiz();
  }else if(type==='order'){
    if(!cart.length){renderPanel('cart');currentPanel='cart';return;}
    content.innerHTML=title('Your selection','A moment to savour')+`<div class="panel-items">${cart.map(row=>{const p=product(row.id);return `<div class="panel-item"><div class="item-copy"><h3>${row.quantity} × ${p.name}</h3></div><strong>${money(p.cents*row.quantity)}</strong></div>`;}).join('')}</div><div class="cart-total"><span>Total</span><strong>${money(cartTotal(cart))}</strong></div><p class="checkout-note">This is a coffee selection preview. Orders and payments are not submitted.</p><button class="button primary" data-dialog="cart">Back to your bag</button>`;
  }else if(type==='news'){
    content.innerHTML=title('Coffee notes','The art of a better cup')+`<p>Start with fresh coffee. Notice the aroma before your first sip. Give yourself a moment to discover the texture, the warmth, and the flavours that make your favourite special.</p><p>For a gentler cup, explore the creamy latte. For a balance of espresso and foam, choose cappuccino. And for a little chocolate indulgence, meet mocha.</p><button class="button primary" data-dialog="quiz">Find your coffee</button>`;
  }
}
const questions=[
  {title:'What flavour draws you in?',options:[['classic','The classic taste of coffee'],['chocolate','A little chocolate indulgence']]},
  {title:'How do you like your cup?',options:[['balanced','Balanced, with an airy layer of foam'],['creamy','Smooth, milky, and wonderfully creamy']]},
  {title:'When is your coffee moment?',options:[['morning','A slow morning'],['afternoon','An afternoon pause'],['evening','Something to savour after dinner']]}
];
function renderQuiz(){const step=questions[quizStep];content.innerHTML=title('Find your coffee',step.title)+`<div class="quiz-progress" aria-label="Question ${quizStep+1} of 3">${questions.map((_,i)=>`<span class="${i<=quizStep?'done':''}"></span>`).join('')}</div><div class="panel-options">${step.options.map(([id,label])=>`<button class="option-button" data-answer="${id}">${label}</button>`).join('')}</div>${quizStep?'<button class="back-button" data-quiz-back>Back</button>':''}`;focusTitle();}
function showResult(){const p=product(recommend(quizAnswers));content.innerHTML=title('Your perfect match',p.name)+`<div class="quiz-result"><img src="${p.image}" alt="${p.name}" width="110" height="165"><div><p>${p.note}</p><strong>${money(p.cents)}</strong></div></div><button class="button primary" data-add="${p.id}" data-result>Add to your bag</button><p><button class="back-button" data-dialog="quiz">Take the test again</button></p>`;preferences.coffee=p.id;save('brww-preferences',preferences);focusTitle();}

document.addEventListener('click',event=>{
  const el=event.target.closest('button,a');if(!el)return;
  if(el.dataset.add){const p=product(el.dataset.add);if(!p)return;cart=updateQuantity(cart,p.id,1);updateBag();toast(`${p.name} added to your bag`);el.classList.add('added');setTimeout(()=>el.classList.remove('added'),400);return;}
  if(el.dataset.quantity){const {quantity,change}=el.dataset;cart=updateQuantity(cart,quantity,Number(change));updateBag();renderPanel('cart');content.querySelector(`[data-quantity="${quantity}"][data-change="${change}"]`)?.focus();return;}
  if(el.dataset.dialog){openPanel(el.dataset.dialog);return;}
  if(el.dataset.rating){openPanel('reviews');return;}
  if(el.hasAttribute('data-close')){closePanel();return;}
  if(el.hasAttribute('data-order')){if(cart.length)openPanel('cart');else{q('#menu').scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth'});toast('Choose a coffee to begin');}return;}
  if(el.hasAttribute('data-menu')){closePanel();q('#menu').scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth'});return;}
  if(el.dataset.answer){quizAnswers[quizStep]=el.dataset.answer;if(quizStep<2){quizStep++;renderQuiz();}else showResult();return;}
  if(el.hasAttribute('data-quiz-back')){quizStep=Math.max(0,quizStep-1);quizAnswers=quizAnswers.slice(0,quizStep);renderQuiz();return;}
  if(el.closest('.main-nav')||el.classList.contains('wordmark')){document.body.classList.remove('nav-open');q('.mobile-toggle').setAttribute('aria-expanded','false');q('.mobile-toggle').setAttribute('aria-label','Open navigation');}
});
document.addEventListener('submit',event=>{
  if(event.target.id!=='preferences-form')return;event.preventDefault();const data=new FormData(event.target);preferences={name:String(data.get('name')||'').trim().slice(0,40),coffee:product(data.get('coffee'))?.id||'latte'};save('brww-preferences',preferences);closePanel();toast('Your coffee preference is saved');
});
q('.mobile-toggle').addEventListener('click',()=>{const open=document.body.classList.toggle('nav-open');q('.mobile-toggle').setAttribute('aria-expanded',String(open));q('.mobile-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('nav-open');q('.mobile-toggle').setAttribute('aria-expanded','false');q('.mobile-toggle').setAttribute('aria-label','Open navigation');}});

const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const cup=q('#turning-cup'),about=q('.about'),marquee=q('.marquee span');
let lastFrame=-1,ticking=false,framesReady=false;
const frameImages=[];
function preloadFrames(){if(framesReady||reduceMotion.matches)return;framesReady=true;for(let i=0;i<24;i++){const image=new Image();image.src=`assets/cup-turn/${String(i).padStart(2,'0')}.webp`;frameImages.push(image);}}
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))preloadFrames();},{rootMargin:'600px'});observer.observe(about);
function drawScroll(){
  ticking=false;const scale=parseFloat(getComputedStyle(document.documentElement).fontSize);
  const r=about.getBoundingClientRect();const progress=Math.max(0,Math.min(1,(innerHeight*.62-r.top)/(r.height*.8)));
  const frame=reduceMotion.matches?12:Math.round(progress*23);
  if(frame!==lastFrame){cup.src=`assets/cup-turn/${String(frame).padStart(2,'0')}.webp`;lastFrame=frame;}
  if(!reduceMotion.matches){marquee.style.transform=`translateX(${-157*scale-Math.min(scrollY,1300)*.11}px)`;const drift=Math.max(-9,Math.min(9,(q('.discovery').getBoundingClientRect().top-innerHeight*.5)*.025));q('.bean-scene').style.setProperty('--drift',`${drift}px`);}
}
function queueScroll(){if(!ticking){ticking=true;requestAnimationFrame(drawScroll);}}
addEventListener('scroll',queueScroll,{passive:true});addEventListener('resize',queueScroll);reduceMotion.addEventListener('change',()=>{preloadFrames();queueScroll();});
updateBag();drawScroll();
