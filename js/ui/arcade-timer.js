// Arcade timer (preview): retro pixel counter above the time bar, modeled on 8-bit animation video timers (fast-forward arrow + stepping number).
(function(){
var F={'0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','11110','00001','00001','10001','01110'],'6':['00110','01000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00010','01100']};
var AR=['10000000000','11000011000','11100011100','11110011110','11100011100','11000011000','10000010000'];
function px(rows,x0,fill){var s='';for(var y=0;y<rows.length;y++)for(var x=0;x<rows[y].length;x++)if(rows[y][x]==='1')s+='<rect x="'+(x0+x)+'" y="'+y+'" width="1" height="1" fill="'+fill+'"/>';return s;}
var AMB='#f2b95c',RED='#ff4a36',ARW='#e9e6dc';
function svg(n,low){var d=String(n).split(''),w=12+d.length*6,h=7,x=11+1,body=px(AR,0,'currentColor');for(var i=0;i<d.length;i++){body+=px(F[d[i]]||F['0'],x,low?RED:AMB);x+=6;}
 return '<svg viewBox="0 0 '+w+' 7" width="'+w*3+'" height="21" shape-rendering="crispEdges">'+body+'</svg>';}
function sync(){var bs=document.querySelectorAll('.bar i[data-s]');for(var i=0;i<bs.length;i++){var b=bs[i],bar=b.parentNode,s=b.getAttribute('data-s'),prev=bar.previousElementSibling;
  if(!prev||!prev.classList||!prev.classList.contains('atm')){prev=document.createElement('div');prev.className='atm';prev.setAttribute('aria-hidden','true');bar.parentNode.insertBefore(prev,bar);}
  if(prev.getAttribute('data-v')!==s){prev.setAttribute('data-v',s);var low=+s<=5;prev.innerHTML='<span class="atn'+(low?' lo':'')+'">'+svg(+s,low)+'</span><span class="atu">ث</span>';}}}
setInterval(sync,200);
})();
