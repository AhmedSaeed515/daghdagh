// Replaces UI emoji with inline SVG icons so they render the same on every phone (no empty boxes). Runs on text nodes only.
(function(){
var P={
chart:'<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
pad:'<rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="15.5" cy="11.5" r=".8"/><circle cx="18" cy="13.5" r=".8"/>',
spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
globe:'<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c3 3 3 16 0 19M12 2.5c-3 3-3 16 0 19"/>',
target:'<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.5"/>',
mask:'<path d="M4 5h16v7a8 8 0 0 1-16 0z"/><circle cx="9" cy="10.5" r="1.3"/><circle cx="15" cy="10.5" r="1.3"/><path d="M9 15.5q3 2 6 0"/>',
spy:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
warn:'<path d="M12 3.5L22 20.5H2z"/><path d="M12 10v5M12 17.6v.4"/>',
dice:'<rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><circle cx="8.5" cy="8.5" r=".9"/><circle cx="15.5" cy="8.5" r=".9"/><circle cx="12" cy="12" r=".9"/><circle cx="8.5" cy="15.5" r=".9"/><circle cx="15.5" cy="15.5" r=".9"/>',
buoy:'<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="4"/><path d="M5.3 5.3l3.9 3.9M14.8 14.8l3.9 3.9M18.7 5.3l-3.9 3.9M9.2 14.8l-3.9 3.9"/>',
cut:'<circle cx="6" cy="6.5" r="2.5"/><circle cx="6" cy="17.5" r="2.5"/><path d="M8 8l12 9M8 16l12-9"/>',
clock:'<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/>',
hour:'<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
fire:'<path d="M12 21c4 0 6.5-2.6 6.5-6 0-3-2-5-3.5-8-1 2-2 3-3 3.5C12 8 11 5 10 3 7.5 6 5.5 9 5.5 15c0 3.4 2.5 6 6.5 6z"/>',
face:'<circle cx="12" cy="12" r="9.5"/><circle cx="9" cy="10" r=".9"/><circle cx="15" cy="10" r=".9"/><path d="M8.5 15q3.5 3 7 0"/>',
shh:'<circle cx="12" cy="12" r="9.5"/><circle cx="9" cy="9.5" r=".9"/><circle cx="15" cy="9.5" r=".9"/><path d="M12 12.5v6M9 16h6"/>',
cool:'<circle cx="12" cy="12" r="9.5"/><path d="M5.5 9.5h13M7 9.5v2.5h3.5V9.5M13.5 9.5V12H17V9.5M8.5 16q3.5 2.5 7 0"/>',
ballot:'<rect x="3" y="12" width="18" height="9" rx="1.5"/><path d="M8 12V8l4-5 4 5v4"/><path d="M9 15.5h6"/>',
ok:'<circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/>',
home:'<path d="M3 11l9-8 9 8M5.5 9.5V21h13V9.5M10 21v-6h4v6"/>',
pen:'<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>',
people:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14c2.8 0 4.5 1.9 4.5 5"/>',
cup:'<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H3.5c0 3 1.5 4.5 3.5 4.8M17 6h3.5c0 3-1.5 4.5-3.5 4.8M12 14v4M8 21h8M9.5 18h5"/>',
spk:'<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"/>',
mute:'<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
bot:'<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M9 12v1.5M15 12v1.5M9.5 16.5h5"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
crown:'<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
hand:'<circle cx="12" cy="7" r="3"/><path d="M6.5 21c0-4 2.4-7 5.5-7s5.5 3 5.5 7M18.5 3.5V9"/>',
tv:'<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
list:'<path d="M9 6h12M9 12h12M9 18h12M3.5 6h.5M3.5 12h.5M3.5 18h.5"/>',
grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
repeat:'<path d="M4 11V9a3 3 0 0 1 3-3h11l-3-3M20 13v2a3 3 0 0 1-3 3H6l3 3"/>',
lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
cam:'<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13.5" r="3.5"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
sliders:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10M4 12h4M12 12h8"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/><circle cx="10" cy="12" r="2"/>',
stop:'<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="M8 12h8"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
talk:'<path d="M4 5h16v11H11l-4 4v-4H4z"/>',
ban:'<circle cx="12" cy="12" r="9.5"/><path d="M5.3 5.3l13.4 13.4"/>',
call:'<path d="M5 3.5h4l1.5 4-2.2 1.4a11 11 0 0 0 5.8 5.8l1.4-2.2 4 1.5v4A2 2 0 0 1 17.5 20 14.5 14.5 0 0 1 4 6.5 2 2 0 0 1 5 3.5z"/>',
refresh:'<path d="M20 11a8 8 0 0 0-14-4L4 9M4 5v4h4M4 13a8 8 0 0 0 14 4l2-2M20 19v-4h-4"/>',
hash:'<path d="M9 4L7 20M17 4l-2 16M4 9h16M3.5 15h16"/>',
bomb:'<circle cx="10.5" cy="14.5" r="6.5"/><path d="M15 9.5l3-3M18 3.5l.5 2.5 2.5.5"/>',
bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.8.7 1 1.4 1 2.1h5c0-.7.2-1.4 1-2.1A6 6 0 0 0 12 3z"/>',
flag:'<path d="M5 21V3M5 4h14l-2.5 4.5L19 13H5"/>',
star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
eye:'<path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'};
var M={'📊':'chart','🎮':'pad','🎉':'spark','📲':'phone','📱':'phone','🌐':'globe','🎯':'target','🎭':'mask','🕵':'spy','⚠':'warn','🎲':'dice','🛟':'buoy','✂':'cut','⏱':'clock','⏳':'hour','🔥':'fire','🤫':'shh','😅':'face','😎':'cool','🗳':'ballot','✅':'ok','🏠':'home','✍':'pen','🤝':'people','🏆':'cup','🔊':'spk','🔇':'mute','🤖':'bot','➕':'plus','👑':'crown','🙋':'hand','📺':'tv','🔟':'list','👥':'people','🗂':'grid','🔁':'repeat','🔒':'lock','📨':'mail','📷':'cam','⚙':'gear','🎛':'sliders','🛑':'stop','✖':'x','❌':'x','🗣':'talk','⛔':'ban','📞':'call','🔄':'refresh','🔢':'hash','💣':'bomb','💡':'bulb','🏁':'flag','⭐':'star','👁':'eye'};
var keys=Object.keys(M).join('|');var RE=new RegExp('('+keys+')[\\uFE0F\\u200D]?','g'),TEST=new RegExp(keys);
var CACHE={};
function svg(n){return CACHE[n]||(CACHE[n]='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+P[n]+'</svg>');}
function fix(t){
 var v=t.nodeValue;if(!v||!TEST.test(v))return;var p=t.parentNode;if(!p)return;var tg=p.nodeName;if(tg==='SCRIPT'||tg==='STYLE'||tg==='TEXTAREA'||tg==='OPTION'||tg==='TITLE'||(p.classList&&p.classList.contains('ei')))return;
 var f=document.createDocumentFragment(),last=0,m;RE.lastIndex=0;
 while((m=RE.exec(v))){if(m.index>last)f.appendChild(document.createTextNode(v.slice(last,m.index)));var s=document.createElement('span');s.className='ei';s.setAttribute('aria-hidden','true');s.innerHTML=svg(M[m[1]]);f.appendChild(s);last=RE.lastIndex;}
 if(last<v.length)f.appendChild(document.createTextNode(v.slice(last)));p.replaceChild(f,t);}
function scan(n){if(n.nodeType===3){fix(n);return;}if(n.nodeType!==1)return;if(!TEST.test(n.textContent||''))return;var w=document.createTreeWalker(n,4,null),a=[],x;while((x=w.nextNode()))a.push(x);a.forEach(fix);}
var q=null;
function go(){q=null;scan(document.body);}
new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];if(m.type==='characterData')fix(m.target);else for(var j=0;j<m.addedNodes.length;j++)scan(m.addedNodes[j]);}}).observe(document.body,{childList:true,subtree:true,characterData:true});
scan(document.body);
})();
