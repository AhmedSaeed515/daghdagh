/* Daghdagh name/answer filter. Editable word list; normalization strips marks, unifies letter forms, collapses repeats. */
(function(){
const LONG=['شرموط','عرص','متناك','منيوك','منيك','ابن المتناك','ابن الكلب','ولاد الكلب','ولاد الزنا','ابن الزنا','قحبه','قحبة','خنيث','معرص','ابن الشرموطه','كسمك','كس امك','fuck','shit','bitch','asshole','pussy','nigg','whore','slut','porn'];
const SHORT=['كس','زب','خول','طيز','زبي','عير','نيك','شاذ','dick','sex'];
function norm(s){return String(s||'').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/(.)\1+/g,'$1');}
const nl=LONG.map(norm),ns=SHORT.map(norm);
window.lgzBad=function(t){
  const a=norm(t);if(!a)return false;
  const flat=a.replace(/[^a-z\u0621-\u064a0-9]/g,'');
  for(const w of nl){const x=w.replace(/[^a-z\u0621-\u064a0-9]/g,'');if(x&&(flat.indexOf(x)>=0))return true;}
  const toks=a.split(/[^a-z\u0621-\u064a0-9]+/).filter(Boolean);
  return toks.some(k=>ns.indexOf(k)>=0);
};
})();
