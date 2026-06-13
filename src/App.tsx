import { useState, useRef } from 'react';
import { FileText, Plus, Lock, Unlock, Eye, EyeOff, Download, Trash2, Bell, X, AlertTriangle } from 'lucide-react';
import { format, differenceInDays, parseISO, isPast } from 'date-fns';

interface Contract { id:string; name:string; party:string; type:string; startDate:string; endDate:string; notes:string; fileName:string; fileData:string; fileType:string; createdAt:number; }
const TYPES=['Service Agreement','NDA','Employment','Lease','Purchase','Partnership','License','Other'];
const SAVE='cv2_contracts_v1';
const load=():Contract[]=>{try{return JSON.parse(localStorage.getItem(SAVE)||'[]')}catch{return[]}};

export default function App() {
  const [locked,   setLocked]   = useState(true);
  const [input,    setInput]    = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [isNew,    setIsNew]    = useState(!localStorage.getItem('cv2_hash'));
  const [error,    setError]    = useState('');
  const [contracts,setContracts]= useState<Contract[]>([]);
  const [showAdd,  setShowAdd]  = useState(false);
  const [selected, setSelected] = useState<Contract|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const unlock = async (e:React.FormEvent) => {
    e.preventDefault(); setError('');
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input+'cv2_salt_v1'));
    const h = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    if (isNew) {
      if (input.length<4) { setError('Min 4 characters'); return; }
      if (input!==confirm) { setError("Passwords don't match"); return; }
      localStorage.setItem('cv2_hash', h);
      setContracts(load()); setIsNew(false); setLocked(false);
    } else {
      if (h!==localStorage.getItem('cv2_hash')) { setError('Wrong password'); setInput(''); return; }
      setContracts(load()); setLocked(false);
    }
  };

  const save = (items:Contract[]) => { setContracts(items); localStorage.setItem(SAVE, JSON.stringify(items)); };

  const expiring = contracts.filter(c => {
    if (!c.endDate) return false;
    const days = differenceInDays(parseISO(c.endDate), new Date());
    return days >= 0 && days <= 30;
  });
  const expired = contracts.filter(c => c.endDate && isPast(parseISO(c.endDate)));

  const inp = { width:'100%', background:'#081408', border:'1px solid #14332050', borderRadius:'10px', padding:'11px 14px', color:'white', fontSize:'14px', outline:'none', fontFamily:'Inter', transition:'border-color 0.2s' };

  if (locked) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',background:'radial-gradient(ellipse at 50% 0%, #0a2010 0%, #080f08 60%)'}}>
      <div style={{width:'100%',maxWidth:'380px'}}>
        <div style={{textAlign:'center',marginBottom:'40px'}}>
          <div style={{width:'76px',height:'76px',borderRadius:'22px',background:'linear-gradient(135deg,#10b981,#059669)',boxShadow:'0 16px 48px #10b98140',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}><FileText size={34} color="white"/></div>
          <h1 style={{fontFamily:'Inter',fontSize:'28px',fontWeight:'700',color:'white',marginBottom:'6px'}}>ContractVault</h1>
          <p style={{color:'#065f46',fontSize:'14px'}}>{isNew?'Secure your contracts with a password':'Enter password to access your contracts'}</p>
        </div>
        <form onSubmit={unlock} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <div style={{position:'relative'}}>
            <input type={showPwd?'text':'password'} value={input} onChange={e=>setInput(e.target.value)} placeholder={isNew?'Create password':'Password'} style={{...inp,paddingRight:'44px'}} autoFocus
              onFocus={e=>e.target.style.borderColor='#10b981'} onBlur={e=>e.target.style.borderColor='#14332050'}/>
            <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#065f46'}}>{showPwd?<EyeOff size={16}/>:<Eye size={16}/>}</button>
          </div>
          {isNew&&<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm password" style={inp}
            onFocus={e=>e.target.style.borderColor='#10b981'} onBlur={e=>e.target.style.borderColor='#14332050'}/>}
          {error&&<p style={{color:'#ef4444',fontSize:'13px',textAlign:'center'}}>{error}</p>}
          <button type="submit" style={{background:'#10b981',color:'white',border:'none',borderRadius:'12px',padding:'14px',fontSize:'15px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:'0 8px 24px #10b98140'}}>{isNew?'Secure Vault':'Unlock'}</button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#080f08',display:'flex',flexDirection:'column'}}>
      <header style={{padding:'16px 20px',borderBottom:'1px solid #14332050',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px #10b98130'}}><FileText size={16} color="white"/></div>
          <div><div style={{fontWeight:'700',fontSize:'16px',color:'white',lineHeight:1}}>ContractVault</div>
          <div style={{fontSize:'11px',color:'#065f46',marginTop:'2px'}}>{contracts.length} contract{contracts.length!==1?'s':''}</div></div>
        </div>
        <div style={{display:'flex',gap:'4px'}}>
          <button onClick={()=>{setLocked(true);setContracts([]);setInput('');}} style={{padding:'7px',borderRadius:'7px',background:'none',border:'none',cursor:'pointer',color:'#065f46'}}><Lock size={15}/></button>
          <button onClick={()=>setShowAdd(true)} style={{display:'flex',alignItems:'center',gap:'5px',padding:'8px 14px',borderRadius:'9px',background:'#10b981',border:'none',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:'0 4px 12px #10b98130'}}>
            <Plus size={13}/> Add
          </button>
        </div>
      </header>

      {expiring.length>0&&<div style={{margin:'12px 20px 0',padding:'12px 14px',background:'#f59e0b10',border:'1px solid #f59e0b25',borderRadius:'10px',display:'flex',gap:'8px',alignItems:'flex-start'}}>
        <Bell size={14} style={{color:'#f59e0b',flexShrink:0,marginTop:'1px'}}/>
        <div>
          <div style={{fontSize:'12px',fontWeight:'600',color:'#fcd34d',marginBottom:'3px'}}>⚡ {expiring.length} contract{expiring.length!==1?'s':''} expiring within 30 days</div>
          {expiring.slice(0,2).map(c=><div key={c.id} style={{fontSize:'11px',color:'#92400e'}}>{c.name} — expires {format(parseISO(c.endDate),'MMM d')}</div>)}
        </div>
      </div>}

      <div style={{flex:1,overflow:'auto',padding:'14px 20px'}}>
        {contracts.length===0?(
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'52px',marginBottom:'16px'}}>📋</div>
            <h3 style={{fontSize:'20px',fontWeight:'700',color:'white',marginBottom:'8px'}}>No contracts yet</h3>
            <p style={{color:'#065f46',fontSize:'14px',marginBottom:'24px',lineHeight:'1.6',maxWidth:'240px',margin:'0 auto 24px'}}>Store all your contracts, agreements, and legal documents securely.</p>
            <button onClick={()=>setShowAdd(true)} style={{padding:'12px 24px',borderRadius:'10px',background:'#10b981',border:'none',color:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:'0 4px 16px #10b98130'}}>Add first contract</button>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {[...contracts].sort((a,b)=>b.createdAt-a.createdAt).map(c=>{
              const days = c.endDate ? differenceInDays(parseISO(c.endDate), new Date()) : null;
              const isExpired = days!==null && days<0;
              const isExpiring = days!==null && days>=0 && days<=30;
              const statusColor = isExpired?'#ef4444':isExpiring?'#f59e0b':'#10b981';
              return <div key={c.id} style={{background:'#0a140a',border:`1px solid ${isExpired?'#ef444430':isExpiring?'#f59e0b30':'#14332050'}`,borderRadius:'12px',padding:'14px',cursor:'pointer',transition:'all 0.2s'}}
                onClick={()=>setSelected(c)}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#10b98130'} onMouseLeave={e=>e.currentTarget.style.borderColor=isExpired?'#ef444430':isExpiring?'#f59e0b30':'#14332050'}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'10px'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'2px'}}>
                      <span style={{color:'white',fontSize:'13px',fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</span>
                      <span style={{fontSize:'10px',padding:'1px 6px',borderRadius:'4px',background:statusColor+'20',color:statusColor,flexShrink:0}}>{c.type}</span>
                    </div>
                    <div style={{color:'#065f46',fontSize:'11px',marginTop:'2px'}}>{c.party} · {c.startDate}</div>
                    {c.endDate&&<div style={{fontSize:'11px',marginTop:'3px',color:statusColor}}>{isExpired?'Expired':'Expires'} {format(parseISO(c.endDate),'MMM d, yyyy')}{isExpiring&&!isExpired?` (${days}d)`:''}
                    </div>}
                  </div>
                  <div style={{display:'flex',gap:'4px',flexShrink:0}}>
                    {c.fileData&&<button onClick={e=>{e.stopPropagation();const a=document.createElement('a');a.href=c.fileData;a.download=c.fileName;a.click();}} style={{padding:'5px',background:'none',border:'none',cursor:'pointer',color:'#065f46'}}><Download size={13}/></button>}
                    <button onClick={e=>{e.stopPropagation();save(contracts.filter(x=>x.id!==c.id));}} style={{padding:'5px',background:'none',border:'none',cursor:'pointer',color:'#065f46'}}><Trash2 size={13}/></button>
                  </div>
                </div>
              </div>;
            })}
          </div>
        )}
      </div>

      {showAdd&&(
        <div style={{position:'fixed',inset:0,background:'#00000080',zIndex:50,display:'flex',alignItems:'flex-end'}} onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div style={{width:'100%',background:'#0a140a',borderRadius:'20px 20px 0 0',border:'1px solid #14332050',padding:'24px',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{width:'36px',height:'3px',background:'#143320',borderRadius:'2px',margin:'0 auto 20px'}}/>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'18px'}}>
              <h3 style={{color:'white',fontSize:'16px',fontWeight:'700',fontFamily:'Inter'}}>Add Contract</h3>
              <button onClick={()=>setShowAdd(false)} style={{background:'none',border:'none',cursor:'pointer',color:'#065f46'}}><X size={16}/></button>
            </div>
            <ContractForm onSave={c=>{save([c,...contracts]);setShowAdd(false);}} fileRef={fileRef}/>
            <input ref={fileRef} type="file" style={{display:'none'}} accept=".pdf,.doc,.docx,.txt"/>
          </div>
        </div>
      )}

      {selected&&(
        <div style={{position:'fixed',inset:0,background:'#00000090',zIndex:50,display:'flex',alignItems:'flex-end'}} onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div style={{width:'100%',background:'#0a140a',borderRadius:'20px 20px 0 0',border:'1px solid #14332050',padding:'24px',maxHeight:'70vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <h3 style={{color:'white',fontSize:'16px',fontWeight:'700',fontFamily:'Inter'}}>{selected.name}</h3>
              <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#065f46'}}><X size={16}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'12px'}}>
              {[['Party',selected.party],['Type',selected.type],['Start',selected.startDate],['End',selected.endDate||'—']].map(([l,v])=>(
                <div key={l} style={{background:'#081408',border:'1px solid #14332050',borderRadius:'8px',padding:'10px'}}>
                  <div style={{fontSize:'10px',color:'#065f46',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'3px'}}>{l}</div>
                  <div style={{fontSize:'13px',color:'white'}}>{v}</div>
                </div>
              ))}
            </div>
            {selected.notes&&<div style={{padding:'12px',background:'#081408',border:'1px solid #14332050',borderRadius:'8px',fontSize:'13px',color:'#6ee7b7',lineHeight:'1.6',marginBottom:'12px'}}>{selected.notes}</div>}
            {selected.fileData&&<button onClick={()=>{const a=document.createElement('a');a.href=selected.fileData;a.download=selected.fileName;a.click();}} style={{display:'flex',alignItems:'center',gap:'8px',width:'100%',padding:'12px',borderRadius:'10px',background:'#10b98120',border:'1px solid #10b98130',color:'#34d399',fontSize:'13px',fontWeight:'500',cursor:'pointer',fontFamily:'Inter'}}>
              <Download size={14}/> Download {selected.fileName}
            </button>}
          </div>
        </div>
      )}
    </div>
  );
}

function ContractForm({onSave,fileRef}:{onSave:(c:Contract)=>void;fileRef:React.RefObject<HTMLInputElement>}) {
  const [name,     setName]     = useState('');
  const [party,    setParty]    = useState('');
  const [type,     setType]     = useState('Service Agreement');
  const [start,    setStart]    = useState('');
  const [end,      setEnd]      = useState('');
  const [notes,    setNotes]    = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState('');
  const [fileType, setFileType] = useState('');

  const inp={width:'100%',background:'#080f08',border:'1px solid #14332050',borderRadius:'10px',padding:'11px 14px',color:'white',fontSize:'14px',outline:'none',fontFamily:'Inter',transition:'border-color 0.2s'};

  const handleFile=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{if(ev.target?.result){setFileData(ev.target.result as string);setFileName(file.name);setFileType(file.type);}};
    reader.readAsDataURL(file);
  };

  const submit=()=>{
    if(!name.trim()||!party.trim())return;
    onSave({id:crypto.randomUUID(),name:name.trim(),party:party.trim(),type,startDate:start,endDate:end,notes:notes.trim(),fileName,fileData,fileType,createdAt:Date.now()});
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Contract name *" style={inp} autoFocus onFocus={e=>e.target.style.borderColor='#10b981'} onBlur={e=>e.target.style.borderColor='#14332050'}/>
      <input value={party} onChange={e=>setParty(e.target.value)} placeholder="Other party *" style={inp} onFocus={e=>e.target.style.borderColor='#10b981'} onBlur={e=>e.target.style.borderColor='#14332050'}/>
      <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
        {TYPES.map(t=><button key={t} onClick={()=>setType(t)} style={{padding:'4px 10px',borderRadius:'20px',border:`1px solid ${type===t?'#10b981':'#14332050'}`,background:type===t?'#10b98115':'transparent',color:type===t?'#34d399':'#065f46',fontSize:'11px',cursor:'pointer',fontFamily:'Inter'}}>{t}</button>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
        <input type="date" value={start} onChange={e=>setStart(e.target.value)} style={inp} onFocus={e=>e.target.style.borderColor='#10b981'} onBlur={e=>e.target.style.borderColor='#14332050'}/>
        <input type="date" value={end} onChange={e=>setEnd(e.target.value)} style={inp} onFocus={e=>e.target.style.borderColor='#10b981'} onBlur={e=>e.target.style.borderColor='#14332050'}/>
      </div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optional)" rows={3} style={{...inp,resize:'none',lineHeight:'1.6'}} onFocus={e=>e.target.style.borderColor='#10b981'} onBlur={e=>e.target.style.borderColor='#14332050'}/>
      <label style={{display:'flex',alignItems:'center',gap:'8px',padding:'12px 14px',borderRadius:'10px',background:'transparent',border:'1px dashed #10b98130',color:'#34d399',cursor:'pointer',fontSize:'13px',fontFamily:'Inter',transition:'all 0.2s'}}
        onMouseEnter={e=>e.currentTarget.style.borderColor='#10b981'} onMouseLeave={e=>e.currentTarget.style.borderColor='#10b98130'}>
        📎 {fileName||'Attach contract file (PDF, DOC, TXT)'}
        <input type="file" style={{display:'none'}} accept=".pdf,.doc,.docx,.txt" onChange={handleFile}/>
      </label>
      <button onClick={submit} disabled={!name.trim()||!party.trim()} style={{padding:'14px',borderRadius:'12px',background:!name.trim()||!party.trim()?'#143320':'#10b981',border:'none',color:'white',fontSize:'15px',fontWeight:'700',cursor:!name.trim()||!party.trim()?'not-allowed':'pointer',fontFamily:'Inter',opacity:!name.trim()||!party.trim()?0.5:1}}>Save Contract</button>
    </div>
  );
}
