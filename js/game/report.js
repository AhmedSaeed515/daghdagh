// Starred ("reported") questions: tap the star under a question to put it in the reported list.
// Starred questions never appear in any play mode until un-starred. The list lives on this device
// (profile screen > "الأسئلة المبلّغ عنها") and can be copied as text for review.
class QuestionReport {
  static esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  static list(){return store.get('flagged',[]);}
  static isFlagged(text){return QuestionReport.list().includes(text);}
  static isHidden(q){return QuestionReport.isFlagged(q[2]);}
  static find(text){return Q.find(q=>q[2]===text);}
  static label(on){return on?'⭐ متعلّم عليه، اضغط لإلغاء النجمة':'☆ بلّغ عن مشكلة في السؤال';}
  static button(text){
    const on=QuestionReport.isFlagged(text);
    return `<button class="rep ${on?'on':''}" data-rep="${QuestionReport.esc(encodeURIComponent(text))}">${QuestionReport.label(on)}</button>`;
  }
  static toggle(btn){
    const text=decodeURIComponent(btn.dataset.rep);let l=QuestionReport.list();
    l=l.includes(text)?l.filter(t=>t!==text):[...l,text];store.set('flagged',l);
    const on=l.includes(text);btn.classList.toggle('on',on);btn.textContent=QuestionReport.label(on);
  }
  static plain(q){return q[2].replace(/^\u00a7[A-Z]:([^\u00a7]*)\u00a7/,(m,v)=>'['+v+'] ');}
  static card(){
    const n=QuestionReport.list().length;
    return `<button class="mode" data-act="reported"><span class="ic">⭐</span><span class="tx"><b>الأسئلة المبلّغ عنها (${n})</b><small>الأسئلة اللي علّمت عليها. مش بتظهر في اللعب لحد ما تشيل النجمة.</small></span><span class="ch">‹</span></button>`;
  }
  static screen(){
    const items=QuestionReport.list().map(t=>QuestionReport.find(t)).filter(Boolean);
    const rows=items.map(q=>`<div class="panel" style="text-align:right;margin-bottom:10px"><small>${QuestionReport.esc((typeof CATS!=='undefined'&&CATS[q[0]])||q[0])}</small><div class="q sm" style="margin:6px 0">${QuestionReport.esc(QuestionReport.plain(q))}</div><div>✔ ${QuestionReport.esc(q[3])}</div><div style="color:#6b6b6b;font-size:13px">${QuestionReport.esc(q.slice(4).join(' • '))}</div><button class="btn sm ghost" data-unstar="${QuestionReport.esc(encodeURIComponent(q[2]))}">إلغاء النجمة (يرجع للعب)</button></div>`).join('');
    shell(`<div class="panel center"><h2>⭐ الأسئلة المبلّغ عنها</h2><p>${items.length?`${items.length} سؤال مستبعد من اللعب لحد ما تشيل النجمة.`:'مفيش أسئلة معلّم عليها.'}</p>${items.length?'<button class="btn" data-act="copyrep">نسخ القائمة</button>':''}</div>${rows}`);
  }
  static copy(){
    const t=QuestionReport.list().map(x=>QuestionReport.find(x)).filter(Boolean).map((q,i)=>`${i+1}) [${q[0]}] ${QuestionReport.plain(q)} | الصح: ${q[3]} | الباقي: ${q.slice(4).join(' / ')}`).join('\n');
    if(navigator.clipboard)navigator.clipboard.writeText(t).catch(()=>{});
  }
}
window.QuestionReport=QuestionReport;
document.addEventListener('click',e=>{
  const r=e.target.closest('[data-rep]');if(r)return QuestionReport.toggle(r);
  const u=e.target.closest('[data-unstar]');if(u){const t=decodeURIComponent(u.dataset.unstar);store.set('flagged',QuestionReport.list().filter(x=>x!==t));return QuestionReport.screen();}
  const a=e.target.closest('[data-act]');if(!a)return;
  if(a.dataset.act==='reported')QuestionReport.screen();
  else if(a.dataset.act==='copyrep'){QuestionReport.copy();a.textContent='اتنسخت ✔';}
});
