// Room code chip in the header while an online game runs. Tap to copy.
(function(){
function code(){try{var o=window.__ONL,r=o&&o.debug&&o.debug().room;return r&&r.code?String(r.code):'';}catch(e){return '';}}
var pend=false;
function upd(){pend=false;var c=code(),top=document.querySelector('.lg .top'),ex=document.querySelector('.rchip');
 if(!c||!top||document.querySelector('.roomc')||document.querySelector('.tabs')){if(ex)ex.remove();return;}
 if(ex&&ex.parentNode===top&&ex.getAttribute('data-c')===c)return;if(ex)ex.remove();
 var b=document.createElement('button');b.className='rchip';b.setAttribute('data-c',c);b.setAttribute('aria-label','كود الغرفة '+c+' (دوس للنسخ)');b.innerHTML='<small>كود</small><span>'+c.replace(/[^A-Z0-9]/gi,'')+'</span>';
 b.addEventListener('click',function(e){e.stopPropagation();var s=b.querySelector('small');function ok(){s.textContent='اتنسخ';setTimeout(function(){s.textContent='كود';},1200);}
  try{navigator.clipboard.writeText(c).then(ok,ok);}catch(x){ok();}});
 var t=top.querySelector('.tlt,.logo');if(t&&t.nextSibling)top.insertBefore(b,t.nextSibling);else top.appendChild(b);}
function q(){if(pend)return;pend=true;requestAnimationFrame(upd);}
new MutationObserver(q).observe(document.body,{childList:true,subtree:true});setInterval(q,1500);
})();
