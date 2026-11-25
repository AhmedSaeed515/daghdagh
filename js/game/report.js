// "Report this question": flags a wrong question. The report opens a prefilled GitHub issue
// (free, no server) and the question is hidden from this device's future games.
class QuestionReport {
  static REPO='AhmedSaeed515/daghdagh';
  static esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  static flagged(){return new Set(store.get('flagged',[]));}
  static isFlagged(text){return QuestionReport.flagged().has(text);}
  static find(text){return Q.find(q=>q[2]===text);}
  static button(text){
    const done=QuestionReport.isFlagged(text);
    return `<button class="rep" data-rep="${QuestionReport.esc(encodeURIComponent(text))}" ${done?'disabled':''}>${done?'✔ اتبلّغ، شكراً':'🚩 بلّغ عن السؤال'}</button>`;
  }
  static issueUrl(q){
    const txt=q[2].replace(/^\u00a7[A-Z]:([^\u00a7]*)\u00a7/,(m,v)=>'['+v+'] ');
    const cat=(typeof CATS!=='undefined'&&CATS[q[0]])||q[0];
    const body=['**بلاغ عن سؤال غلط أو ناقص**','',`- الفئة: ${cat} (${q[0]})`,`- الصعوبة: ${q[1]}`,`- السؤال: ${txt}`,`- الإجابة المسجّلة كصح: ${q[3]}`,`- باقي الاختيارات: ${q.slice(4).join(' | ')}`,'',`- raw: ${q[2]}`,'','المشكلة (اختياري): '].join('\n');
    const title='بلاغ: '+txt.slice(0,70);
    return `https://github.com/${QuestionReport.REPO}/issues/new?labels=question-report&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  }
  static report(btn){
    const text=decodeURIComponent(btn.dataset.rep),q=QuestionReport.find(text);if(!q)return;
    const f=QuestionReport.flagged();f.add(text);store.set('flagged',[...f]);
    btn.textContent='✔ اتبلّغ، شكراً';btn.disabled=true;
    window.open(QuestionReport.issueUrl(q),'_blank','noopener');
  }
}
window.QuestionReport=QuestionReport;
document.addEventListener('click',e=>{const b=e.target.closest('[data-rep]');if(b&&!b.disabled)QuestionReport.report(b);});
