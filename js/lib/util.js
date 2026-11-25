// Small pure helpers, grouped as static members of one class.
class Util {
  static $ = s => document.querySelector(s);
  static app = () => Util.$("#app");
  static esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  static shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  static norm=t=>String(t).toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/[ىئ]/g,'ي').replace(/ؤ/g,'و').replace(/[^\u0621-\u064Aa-z0-9 ]/g,'').replace(/\s+/g,' ').trim().replace(/^ال/,'').replace(/ ال/g,' ');
}
const {$, app, esc, shuffle, norm} = Util;
