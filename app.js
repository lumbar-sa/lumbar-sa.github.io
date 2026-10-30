const CONFIG={
 endpoint:'https://script.google.com/macros/s/AKfycbxxBGHE4mZ5iDdplvvaFxVhrHoOMETyRoafgk8iG-DGx9vhY27JgFhc3VHFBO22hu4x0w/exec',
 sku:'LUMBAR-GEL-20G',
 receiverSku:'LUMBAR-GEL-20G',
 product:'Lumbar Spine Cooling Gel',
 pixelId:'233915bf-25f6-4119-9362-701fe3212185',
 offers:{
  1:{label:'عبوة واحدة',price:173,quantity:1},
  2:{label:'عبوتان',price:198,quantity:2},
  3:{label:'3 عبوات',price:218,quantity:3}
 }
};

// Snapchat Pixel: initialize once and record the main e-commerce funnel events.
(function initSnapPixel(){
 if(window.__lumbarSnapPixelInit)return;
 window.__lumbarSnapPixelInit=true;
 (function(w,d,t,u,n,a,m){
  if(w.snaptr)return;
  n=w.snaptr=function(){n.handleRequest?n.handleRequest.apply(n,arguments):n.queue.push(arguments)};
  n.queue=[];a=d.createElement(t);a.async=true;a.src=u;
  m=d.getElementsByTagName(t)[0];m.parentNode.insertBefore(a,m);
 })(window,document,'script','https://sc-static.net/scevent.min.js');
 window.snaptr('init',CONFIG.pixelId);
 window.snaptr('track','PAGE_VIEW');
 window.snaptr('track','VIEW_CONTENT',{
  item_ids:[CONFIG.sku],
  item_category:'Personal Care',
  price:CONFIG.offers[1].price,
  number_items:1,
  currency:'SAR'
 });
})();
function trackSnap(eventName,params){
 try{
  if(typeof window.snaptr!=='function'){
   console.warn('Snap Pixel is not initialized; event not sent:',eventName);
   return false;
  }
  const eventParams=params&&typeof params==='object'?params:{};
  window.snaptr('track',eventName,eventParams);
  console.info('[Snap Pixel] event queued:',eventName,eventParams);
  return true;
 }catch(err){console.error('[Snap Pixel] event failed:',eventName,err);return false;}
}

const form=document.getElementById('order-form');
const total=document.getElementById('summary-total');
const offerSummary=document.getElementById('summary-offer');
const status=document.getElementById('form-message');
function currentOffer(){
 const code=Number(new FormData(form).get('offer')||1);
 return {code,...CONFIG.offers[code]};
}
function updateSummary(){
 const o=currentOffer();
 offerSummary.textContent=o.label;
 total.textContent=o.price+' ريال';
}
form.addEventListener('change',e=>{
 updateSummary();
 if(e.target&&e.target.name==='offer'){
  const o=currentOffer();
  trackSnap('ADD_CART',{
   item_ids:[CONFIG.sku],
   item_category:'Personal Care',
   number_items:o.quantity,
   price:o.price,
   currency:'SAR'
  });
 }
});
const phoneInput=form.elements.phone;
const phoneError=document.getElementById('phone-error');
phoneInput.addEventListener('input',()=>{
 phoneInput.removeAttribute('aria-invalid');
 phoneError.textContent='';
});
function normalizeSaudiPhone(v){
 let s=String(v||'').trim().replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[\\s()\\-\\u200e\\u200f\\u061c]/g,'');
 if(s.startsWith('+966'))s='0'+s.slice(4);
 else if(s.startsWith('00966'))s='0'+s.slice(5);
 else if(s.startsWith('966'))s='0'+s.slice(3);
 else if(/^5\\d{8}$/.test(s))s='0'+s;
 return /^05\\d{8}$/.test(s)?s:null;
}
function getUtm(o){
 const q=Object.fromEntries(new URLSearchParams(window.location.search));
 return {
  utm_source:q.utm_source||'snapchat',
  utm_medium:q.utm_medium||'landing-page',
  utm_campaign:q.utm_campaign||'lumbar-cooling-gel',
  utm_term:q.utm_term||('bundle-'+o.code),
  utm_content:q.utm_content||'lumbar-sa.github.io'
 };
}
function showSuccess(o){
 let modal=document.getElementById('success-modal');
 if(!modal){
  modal=document.createElement('div');modal.id='success-modal';modal.className='success-modal';
  modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
  modal.innerHTML='<div class="success-card"><div class="check">✓</div><h2>تم إرسال طلبك</h2><p>سنتواصل معك على رقم الجوال لتأكيد البيانات قبل الشحن.</p><strong id="success-offer"></strong><strong id="success-price"></strong><button type="button">حسنًا</button></div>';
  document.body.appendChild(modal);
  modal.querySelector('button').addEventListener('click',()=>modal.classList.remove('visible'));
 }
 modal.querySelector('#success-offer').textContent=o.label;
 modal.querySelector('#success-price').textContent=o.price+' ريال';
 modal.classList.add('visible');
}

let checkoutStarted=false;
document.addEventListener('click',e=>{
 const targetElement=e.target instanceof Element?e.target:null;
 const a=targetElement&&targetElement.closest('a[href="#order"]');
 if(!a)return;
 e.preventDefault();
 if(!checkoutStarted){
  checkoutStarted=true;
  const o=currentOffer();
  trackSnap('START_CHECKOUT',{
   item_ids:[CONFIG.sku],
   item_category:'Personal Care',
   number_items:o.quantity,
   price:o.price,
   currency:'SAR'
  });
 }
 const target=document.getElementById('order');
 if(target){
  target.scrollIntoView({behavior:'auto',block:'start'});
  requestAnimationFrame(()=>target.scrollIntoView({behavior:'auto',block:'start'}));
 }
});

let orderSubmitting=false;
form.addEventListener('submit',async e=>{
 e.preventDefault();
 if(orderSubmitting)return;
 status.textContent='';
 const fd=new FormData(form);
 const name=String(fd.get('name')||'').trim();
 const phone=normalizeSaudiPhone(fd.get('phone'));
 const address=String(fd.get('address')||'').trim();
 const o=currentOffer();
 if(name.length<2){status.textContent='يرجى كتابة الاسم الكامل.';return;}
 if(!phone){
  phoneError.textContent='رقم الهاتف غير صحيح';
  phoneInput.setAttribute('aria-invalid','true');
  phoneInput.focus();return;
 }
 phoneError.textContent='';phoneInput.removeAttribute('aria-invalid');
 if(address.length<2){status.textContent='يرجى كتابة المدينة.';return;}

 orderSubmitting=true;
 const btn=form.querySelector('.submit');
 btn.disabled=true;btn.textContent='جارٍ إرسال طلبك…';
 const tx='LUMBAR-'+Date.now()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
 const payload={
  transactionId:tx,product:CONFIG.product,name,phone,address,
  offerCode:o.code,offer:o.label,price:o.price,unitPrice:o.price,totalPrice:o.price,
  orderTotal:o.price,amount:o.price,sellingPrice:o.price,offerPrice:o.price,
  country:'SA',sku:CONFIG.receiverSku,receiverSku:CONFIG.receiverSku,
  productSku:CONFIG.sku,currency:'SAR',quantity:o.quantity,
  pageUrl:window.location.href,source:'Lumbar Cooling Gel Landing Page',utm:getUtm(o)
 };
 try{
  // Opaque no-cors completion is not a server-side acknowledgement of the Sheet write.
  const response=await fetch(CONFIG.endpoint,{
   method:'POST',mode:'no-cors',keepalive:true,
   headers:{'Content-Type':'text/plain;charset=utf-8'},
   body:JSON.stringify(payload)
  });
  if(!response||response.type!=='opaque')throw new Error('Unexpected order endpoint response');

  if(!window.__lumbarPurchaseTransactions)window.__lumbarPurchaseTransactions=new Set();
  if(!window.__lumbarPurchaseTransactions.has(tx)){
   window.__lumbarPurchaseTransactions.add(tx);
   trackSnap('PURCHASE',{
    item_ids:[CONFIG.sku],
    item_category:'Personal Care',
    number_items:o.quantity,
    price:o.price,
    currency:'SAR',
    transaction_id:tx
   });
  }
  btn.textContent='تم إرسال الطلب ✓';
  status.textContent='تم إرسال طلبك. سنتواصل معك للتأكيد قبل الشحن.';
  showSuccess(o);
 }catch(err){
  orderSubmitting=false;
  btn.disabled=false;
  btn.textContent='تأكيد الطلب — الدفع عند الاستلام';
  status.textContent='تعذر إرسال الطلب الآن. تحقق من اتصال الإنترنت وحاول مرة أخرى.';
  console.error('Order submission failed:',err);
 }
});

// Hide the floating order link while the checkout section is visible.
(function manageStickyOrder(){
 const sticky=document.querySelector('.sticky-order');
 const checkout=document.querySelector('.offer-section');
 if(!sticky||!checkout)return;
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>sticky.classList.toggle('checkout-in-view',entry.isIntersecting));
  },{threshold:0.08});
  observer.observe(checkout);
 }else{
  const check=()=>{
   const r=checkout.getBoundingClientRect();
   sticky.classList.toggle('checkout-in-view',r.top<window.innerHeight&&r.bottom>0);
  };
  window.addEventListener('scroll',check,{passive:true});
  window.addEventListener('resize',check);check();
 }
})();
updateSummary();
