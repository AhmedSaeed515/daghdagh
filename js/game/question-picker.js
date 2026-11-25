// Picks the questions for one game: balanced across the chosen categories, no repeated
// question text, at most a few per template family. Remembers what was already shown.
class QuestionPicker {
  constructor({Q,store,norm,shuffle}){this.Q=Q;this.store=store;this.norm=norm;this.shuffle=shuffle;}
  pick(cats,diff,n){
    const {Q,store,norm,shuffle}=this;
    const seen=new Set(this.store.get('seen',[]));
    const pool=this.Q.map((q,i)=>({q,i})).filter(({q})=>cats.includes(q[0])&&(diff===0||q[1]===diff));
    let fresh=pool.filter(p=>!seen.has(p.i));
    if(fresh.length<n){ // reset seen for this pool
      const ids=new Set(pool.map(p=>p.i));this.store.set('seen',[...seen].filter(i=>!ids.has(i)));fresh=pool;
    }
    // Balanced pick: rotate through the chosen categories, never repeat the same
    // question text, and limit how many questions of one template family a game gets.
    const stripped=t=>t.replace(/^\u00a7[A-Z]:[^\u00a7]*\u00a7\s*/,'');
    const media=t=>/^\u00a7[A-Z]:/.test(t);
    const famOf=q=>q[0]+'|'+this.norm(stripped(q[2])).split(' ').slice(0,3).join(' ');
    const byCat={};this.shuffle(fresh).forEach(p=>{(byCat[p.q[0]]=byCat[p.q[0]]||[]).push(p)});
    let picked=[];const texts=new Set(),fams={};
    for(const cap of [2,4,1e9]){
      let progress=true;
      while(picked.length<n&&progress){
        progress=false;
        for(const c of this.shuffle(Object.keys(byCat))){
          if(picked.length>=n)break;
          const list=byCat[c];
          const k=list.findIndex(p=>{const t=stripped(p.q[2]);return (media(p.q[2])||!texts.has(t))&&(media(p.q[2])||(fams[famOf(p.q)]||0)<cap);});
          if(k<0)continue;
          const [p]=list.splice(k,1);picked.push(p);texts.add(stripped(p.q[2]));fams[famOf(p.q)]=(fams[famOf(p.q)]||0)+1;progress=true;
        }
      }
    }
    if(picked.length<n){const rest=this.shuffle(this.Q.map((q,i)=>({q,i})).filter(p=>!picked.some(x=>x.i===p.i)));picked.push(...rest.slice(0,n-picked.length));}
    picked=this.shuffle(picked);
    this.store.set('seen',[...new Set([...this.store.get('seen',[]),...picked.map(p=>p.i)])]);
    return picked.map(p=>{const q=p.q;return {cat:q[0],diff:q[1],text:q[2],right:q[3],wrong:q.slice(4)}});
  }
}
