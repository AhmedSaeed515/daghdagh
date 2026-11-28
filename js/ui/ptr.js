// Pull-to-refresh: a deliberate long pull from the very top, held for a moment, on menu screens only. Never during a question or a room.
(function(){
var TH=130,HOLD=700,DEAD=28,el=null,sy=0,sx=0,on=false,dy=0,armedAt=0,armed=false,cancelled=false;
function safe(){return !!document.querySelector('.tabs')&&!document.querySelector('.bar i[data-s]')&&!document.getElementById('obar')&&!(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName));}
function atTop(t){for(var n=t;n&&n!==document.body;n=n.parentNode){if(n.nodeType===1&&n.scrollTop>0)return false;}return (window.scrollY||0)<=0;}
function ui(){if(el)return el;el=document.createElement('div');el.id='ptr';el.setAttribute('aria-hidden','true');el.innerHTML='<svg viewBox="0 0 7 7" width="21" height="21" shape-rendering="crispEdges"><path d="M3 0h1v5H3zM1 3h1v1H1zM2 4h1v1H2zM4 4h1v1H4zM5 3h1v1H5z" fill="currentColor"/></svg><span class="pm">'+new Array(9).join('<i></i>')+'</span><b>اسحب لتحت</b>';document.body.appendChild(el);return el;}
function draw(){var e=ui(),p=Math.min(1,dy/TH),n=Math.round(p*8),s=e.querySelectorAll('.pm i');for(var i=0;i<8;i++)s[i].className=i<n?'f':'';
 e.style.transform='translate(-50%,'+(Math.min(dy,TH)*0.45-40)+'px)';e.className='on'+(armed?' ar':'');
 e.querySelector('b').textContent=armed?'سيب عشان يتحدّث':(p>=1?'كمّل ماسك...':'اسحب لتحت');}
function hide(){if(el){el.className='';el.style.transform='translate(-50%,-60px)';}on=false;dy=0;armed=false;armedAt=0;}
document.addEventListener('touchstart',function(e){on=false;cancelled=false;if(e.touches.length!==1||!safe()||!atTop(e.target))return;sy=e.touches[0].clientY;sx=e.touches[0].clientX;on=true;dy=0;armed=false;},{passive:true});
document.addEventListener('touchmove',function(e){if(!on)return;var t=e.touches[0],y=t.clientY-sy,x=t.clientX-sx;
 if(y<=0||Math.abs(x)>y*0.6){if(y<-6||Math.abs(x)>40){hide();on=false;}return;}
 if(!safe()||!atTop(e.target)&&dy===0){hide();return;}
 if(y<DEAD){return;}dy=y-DEAD;if(dy>=TH){if(!armedAt)armedAt=Date.now();armed=Date.now()-armedAt>=HOLD;}else{armedAt=0;armed=false;}draw();},{passive:true});
setInterval(function(){if(on&&dy>=TH&&armedAt&&!armed&&Date.now()-armedAt>=HOLD){armed=true;draw();}},100);
function end(){if(!on)return;var go=armed&&safe();hide();if(go){ui().className='on ar go';setTimeout(function(){location.reload();},120);}}
document.addEventListener('touchend',end,{passive:true});document.addEventListener('touchcancel',function(){hide();},{passive:true});
})();
