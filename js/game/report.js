// "Report this question": flags a wrong question. The report opens a prefilled GitHub issue
// (free, no server) and the question is hidden from this device's future games.
class QuestionReport {
  static REPO='AhmedSaeed515/daghdagh';
  // Fill these two once the Google Form exists. Empty = fall back to a prefilled GitHub issue.
  // form: the .../formResponse URL. entries: the entry.NNN names of the 4 fields. csv: published responses CSV.
  static CFG={form:'',entries:{id:'',cat:'',q:'',prob:''},csv:''};
  static hash(q){let h=5381;const t=q[2]+'|'+q[3]+'|'+q.slice(4).join('|');for(let i=0;i<t.length;i++)h=((h*33)^t.charCodeAt(i))>>>0;return h.toString(36);}
  static hiddenIds(){return new Set(store.get('hiddenids',[]));}
  static isHidden(q){const id=QuestionReport.hash(q);return QuestionReport.isFlagged(q[2])||QuestionReport.hiddenIds().has(id);}
  static parseCsv(t){const rows=[];let r=[],c='',qt=false;for(let i=0;i<t.length;i++){const ch=t[i];if(qt){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++;}else qt=false;}else c+=ch;}else if(ch==='"')qt=true;else if(ch===','){r.push(c);c='';}else if(ch==='\n'){r.push(c);rows.push(r);r=[];c='';}else if(ch!=='\r')c+=ch;}if(c||r.length){r.push(c);rows.push(r);}return rows;}
  static refresh(){
    const u=QuestionReport.CFG.csv;if(!u||!window.fetch)return;
    fetch(u+(u.includes('?')?'&':'?')+'t='+Date.now()).then(r=>r.text()).then(t=>{
      const rows=QuestionReport.parseCsv(t),h=rows[0]||[];
      const ci=h.findIndex(x=>/question id/i.test(x)),si=h.findIndex(x=>/^status$/i.test(x.trim()));if(ci<0)return;
      const ids=rows.slice(1).filter(r=>r[ci]&&!(si>=0&&/fixed|تم|done/i.test(r[si]||''))).map(r=>r[ci].trim());
      store.set('hiddenids',[...new Set(ids)]);
    }).catch(()=>{});
  }
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
    const C=QuestionReport.CFG;
    if(C.form&&C.entries.id){
      const b=new URLSearchParams();b.set(C.entries.id,QuestionReport.hash(q));b.set(C.entries.cat,q[0]);b.set(C.entries.q,q[2]);b.set(C.entries.prob,'الإجابة المسجلة: '+q[3]);
      fetch(C.form,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:b.toString()}).catch(()=>{});
    }else window.open(QuestionReport.issueUrl(q),'_blank','noopener');
  }
}
window.QuestionReport=QuestionReport;QuestionReport.refresh();
document.addEventListener('click',e=>{const b=e.target.closest('[data-rep]');if(b&&!b.disabled)QuestionReport.report(b);});
