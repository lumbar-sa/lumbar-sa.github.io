const CONFIG={
 endpoint:'https://script.google.com/macros/s/AKfycbxxBGHE4mZ5iDdplvvaFxVhrHoOMETyRoafgk8iG-DGx9vhY27JgFhc3VHFBO22hu4x0w/exec',
 sku:'LUMBAR-GEL-20G',
 receiverSku:'LUMBAR-GEL-20G',
 product:'Lumbar Spine Cooling Gel',
 offers:{
  1:{label:'عبوة واحدة',price:173,quantity:1},
  2:{label:'عبوتان',price:198,quantity:2},
  3:{label:'3 عبوات',price:218,quantity:3}
 }
};
// Snapchat Pixel: initialize once per page; Purchase fires only after the order request is queued.
(function initSnapPixel(){
 const pixelId='233915bf-25f6-4119-9362-701fe3212185';
 if(window.__lumbarSnapPixelInit)return;window.__lumbarSnapPixelInit=true;
 (function(w,d,t,u,n,a,m){if(w.snaptr)return;n=w.snaptr=function(){n.handleRequest?n.handleRequest.apply(n,arguments):n.queue.push(arguments)};n.queue=[];a=d.createElement(t);a.async=true;a.src=u;m=d.getElementsByTagName(t)[0];m.parentNode.insertBefore(a,m)})(window,document,'script','https://sc-static.net/scevent.min.js');
 window.snaptr('init',pixelId);
 window.snaptr('track','PAGE_VIEW');
})();
const form=document.getElementById('order-form');
const total=document.getElementById('summary-total');
const offerSummary=document.getElementById('summary-offer');
const status=document.getElementById('form-message');
function currentOffer(){const code=Number(new FormData(form).get('offer')||1);return {code,...CONFIG.offers[code]};}
function updateSummary(){const o=currentOffer();offerSummary.textContent=o.label;total.textContent=o.price+' ريال';}
form.addEventListener('change',updateSummary);
const phoneInput=form.elements.phone;
const phoneError=document.getElementById('phone-error');
phoneInput.addEventListener('input',()=>{phoneInput.removeAttribute('aria-invalid');phoneError.textContent='';});
function normalizeSaudiPhone(v){
 let s=String(v||'').trim().replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[\s()\-\u200e\u200f\u061c]/g,'');
 if(s.startsWith('+966'))s='0'+s.slice(4);else if(s.startsWith('00966'))s='0'+s.slice(5);else if(s.startsWith('966'))s='0'+s.slice(3);else if(/^5\d{8}$/.test(s))s='0'+s;
 return /^05\d{8}$/.test(s)?s:null;
}
function getUtm(o){
 const q=Object.fromEntries(new URLSearchParams(window.location.search));
 return {utm_source:q.utm_source||'snapchat',utm_medium:q.utm_medium||'landing-page',utm_campaign:q.utm_campaign||'lumbar-cooling-gel',utm_term:q.utm_term||('bundle-'+o.code),utm_content:q.utm_content||'lumbar-sa.github.io'};
}
function showSuccess(o){
 let modal=document.getElementById('success-modal');
 if(!modal){modal=document.createElement('div');modal.id='success-modal';modal.className='success-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.innerHTML='<div class="success-card"><div class="check">✓</div><h2>تم إرسال طلبك</h2><p>سنتواصل معك على رقم الجوال لتأكيد البيانات قبل الشحن.</p><strong id="success-offer"></strong><strong id="success-price"></strong><button type="button">حسنًا</button></div>';document.body.appendChild(modal);modal.querySelector('button').addEventListener('click',()=>modal.classList.remove('visible'));}
 modal.querySelector('#success-offer').textContent=o.label;modal.querySelector('#success-price').textContent=o.price+' ريال';modal.classList.add('visible');
}
form.addEventListener('submit',async e=>{
 e.preventDefault();status.textContent='';
 const fd=new FormData(form),name=String(fd.get('name')||'').trim(),phone=normalizeSaudiPhone(fd.get('phone')),address=String(fd.get('address')||'').trim(),o=currentOffer();
 if(name.length<2){status.textContent='يرجى كتابة الاسم الكامل.';return;}
 if(!phone){phoneError.textContent='رقم الهاتف غير صحيح';phoneInput.setAttribute('aria-invalid','true');phoneInput.focus();return;}
 phoneError.textContent='';phoneInput.removeAttribute('aria-invalid');
 if(address.length<2){status.textContent='يرجى كتابة المدينة.';return;}
 const btn=form.querySelector('.submit');btn.disabled=true;btn.textContent='جارٍ إرسال طلبك…';
 const tx='LUMBAR-'+Date.now()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
 const payload={
  transactionId:tx,product:CONFIG.product,name,phone,address,
  offerCode:o.code,offer:o.label,price:o.price,unitPrice:o.price,totalPrice:o.price,orderTotal:o.price,amount:o.price,sellingPrice:o.price,offerPrice:o.price,
  country:'SA',sku:CONFIG.receiverSku,receiverSku:CONFIG.receiverSku,productSku:CONFIG.sku,currency:'SAR',
  quantity:o.quantity,pageUrl:window.location.href,source:'Lumbar Cooling Gel Landing Page',utm:getUtm(o)
 };
 try{
  const body=JSON.stringify(payload);let queued=false;
  if(navigator.sendBeacon){try{queued=navigator.sendBeacon(CONFIG.endpoint,new Blob([body],{type:'text/plain;charset=utf-8'}));}catch(_){}}
  if(!queued){if(navigator.onLine===false)throw new Error('offline');fetch(CONFIG.endpoint,{method:'POST',mode:'no-cors',keepalive:true,headers:{'Content-Type':'text/plain;charset=utf-8'},body}).catch(()=>{});queued=true;}
  if(queued && !window.__lumbarPurchaseTracked){window.__lumbarPurchaseTracked=true;try{if(typeof window.snaptr==='function')window.snaptr('track','PURCHASE',{price:o.price,currency:'SAR',transaction_id:tx});}catch(pixelError){console.warn('Snap Pixel Purchase event failed',pixelError);}}
  btn.textContent='تم إرسال الطلب ✓';status.textContent='تم إرسال طلبك. سنتواصل معك للتأكيد قبل الشحن.';showSuccess(o);
 }catch(err){btn.disabled=false;btn.textContent='تأكيد الطلب — الدفع عند الاستلام';status.textContent='تعذر إرسال الطلب الآن. تحقق من اتصال الإنترنت وحاول مرة أخرى.';}
});
document.addEventListener('click',e=>{const a=e.target.closest('a[href="#order"]');if(!a)return;e.preventDefault();const target=document.getElementById('order');if(target){target.scrollIntoView({behavior:'auto',block:'start'});requestAnimationFrame(()=>target.scrollIntoView({behavior:'auto',block:'start'}));}});

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
  const check=()=>{const r=checkout.getBoundingClientRect();sticky.classList.toggle('checkout-in-view',r.top<window.innerHeight&&r.bottom>0)};
  window.addEventListener('scroll',check,{passive:true});window.addEventListener('resize',check);check();
 }
})();

updateSummary();