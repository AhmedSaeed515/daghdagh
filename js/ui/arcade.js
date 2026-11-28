// Arcade background preview: pixel stars + pixel rockets with particle flames. Light on CPU: low-res canvas, 30fps cap, pauses when hidden, static with reduced motion.
(function(){
if(document.documentElement.classList.contains('noarc'))return;
var S=3,cv=document.createElement('canvas');cv.id='arcbg';
cv.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:0;pointer-events:none;image-rendering:pixelated';
document.body.insertBefore(cv,document.body.firstChild);
var g=cv.getContext('2d'),W=0,H=0,stars=[],rk=[],P=[],MAXP=150,fr=0,last=0,run=false;
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var SP=['...W...','..WWW..','..WWW..','.WWBWW.','.WWBWW.','.WWWWW.','RWWWWWR','RWWWWWR','R.WWW.R'];
var COL={W:'#f4f1e8',B:'#4cc9f0',R:'#ff4a36'};
var FL=['#ffffff','#ffe66d','#ffb703','#ff7a1a','#ff4a36','#8a2a20'];
function rnd(a,b){return a+Math.random()*(b-a)}
function size(){var w=Math.ceil(innerWidth/S),h=Math.ceil(innerHeight/S);if(w===W&&h===H)return;W=cv.width=w;H=cv.height=h;stars=[];for(var i=0;i<Math.round(W*H/260);i++)stars.push({x:rnd(0,W)|0,y:rnd(0,H)|0,p:rnd(0,6.28),c:Math.random()<.2?'#ffb703':(Math.random()<.4?'#4cc9f0':'#f4f1e8')});}
function mk(i,init){var sc=i%2?1:1;return{x:rnd(10,W-18)|0,y:init?rnd(H*.2,H):H+24,v:rnd(.45,.9),dr:rnd(-.08,.08),k:0};}
function init(){size();rk=[];var n=W<110?3:4;for(var i=0;i<n;i++)rk.push(mk(i,true));P=[];}
function emit(r){for(var j=0;j<2;j++){if(P.length>=MAXP)return;P.push({x:r.x+6+rnd(-2,2),y:r.y+18,vx:rnd(-.12,.12),vy:rnd(.35,.7)+r.v*.5,l:0,m:rnd(12,22)|0});}}
function draw(){
 g.clearRect(0,0,W,H);
 for(var i=0;i<stars.length;i++){var s=stars[i];if(Math.sin(s.p+fr*.05)>-.5){g.fillStyle=s.c;g.fillRect(s.x,s.y,1,1);}}
 for(i=0;i<P.length;i++){var p=P[i],t=p.l/p.m;g.fillStyle=FL[Math.min(5,(t*6)|0)];g.fillRect(p.x|0,p.y|0,t>.6?1:2,t>.6?1:2);}
 for(i=0;i<rk.length;i++){var r=rk[i];for(var y=0;y<SP.length;y++){var row=SP[y];for(var x=0;x<7;x++){var c=row[x];if(c!=='.'){g.fillStyle=COL[c];g.fillRect((r.x+x*2)|0,(r.y+y*2)|0,2,2);}}}}
}
function step(){
 fr++;
 for(var i=0;i<rk.length;i++){var r=rk[i];r.y-=r.v;r.x+=r.dr;if(r.y<-22||r.x<-8||r.x>W+8)rk[i]=mk(i,false);else if(fr%2===0)emit(r);}
 for(i=P.length-1;i>=0;i--){var p=P[i];p.l++;p.x+=p.vx;p.y+=p.vy;if(p.l>=p.m)P.splice(i,1);}
}
function loop(t){if(!run)return;requestAnimationFrame(loop);if(t-last<33)return;last=t;step();draw();}
function start(){if(run||reduce)return;run=true;requestAnimationFrame(loop);}
function stop(){run=false;}
init();draw();
if(reduce){for(var k=0;k<40;k++)step();draw();}
addEventListener('resize',function(){size();draw();});
document.addEventListener('visibilitychange',function(){document.hidden?stop():start();});
start();
})();
