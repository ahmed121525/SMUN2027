import {useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {createPortal} from "react-dom";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {Flip} from "gsap/Flip";
import DATA from "../data/site-data.js";
import GlowCursor from "../components/effects/GlowCursor.jsx";
import RippleDistortion from "../components/effects/RippleDistortion.jsx";
import OptionWheel from "../components/ui/OptionWheel.jsx";
import DriftWall from "../components/effects/DriftWall.jsx";
import GradientASCII from "../components/effects/GradientASCII.jsx";
import CubeButton from "../components/ui/CubeButton.jsx";
import MandateButton from "../components/ui/MandateButton.jsx";
import MinimalButton from "../components/ui/MinimalButton.jsx";
gsap.registerPlugin(ScrollTrigger,Flip);
const committees=DATA.committees||[],people=DATA.people||[],site=DATA.site||{};
const baseUrl=import.meta.env.BASE_URL; const asset=n=>baseUrl+String(n||"").split("/").map(encodeURIComponent).join("/");
const registrationFormUrl=import.meta.env.VITE_REGISTRATION_FORM_URL||"";
const getRoute=()=>decodeURIComponent(location.hash.replace(/^#\/?/,"").replace(/\/+$/,""));
const wheelItems=["IPL AUCTION","UNSC","PRESS CORPS","GORBACHEV CABINET","UNODC","LOK SABHA"];
function useViewport(){
 const [width,setWidth]=useState(()=>window.innerWidth),[reduced,setReduced]=useState(false);
 useEffect(()=>{const mq=matchMedia("(prefers-reduced-motion: reduce)"),resize=()=>setWidth(innerWidth),motion=()=>setReduced(mq.matches);resize();motion();addEventListener("resize",resize);mq.addEventListener?.("change",motion);return()=>{removeEventListener("resize",resize);mq.removeEventListener?.("change",motion);};},[]);
 return {mobile:width<=760,reduced};
}
function useParallax(route){
 useLayoutEffect(()=>{
  const root=document.querySelector(".app-shell");
  if(!root||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const mobile=window.matchMedia("(max-width:760px)").matches;
  const homeRoute=!route||route==="/";
  const context=gsap.context(()=>{
   const travel=mobile?58:168;
   gsap.utils.toArray("[data-parallax]",root).forEach(element=>{
    const strength=Number.parseFloat(element.dataset.parallax||"0");
    if(!Number.isFinite(strength)||strength===0)return;
    const trigger=element.closest("[data-parallax-section]")||element;
    gsap.fromTo(element,{y:0},{y:travel*strength,ease:"none",scrollTrigger:{
     trigger,start:"top bottom",end:"bottom top",scrub:mobile?0.55:0.9,
     invalidateOnRefresh:true,fastScrollEnd:true
    }});
   });
   gsap.utils.toArray("[data-reveal]",root).forEach(element=>{
    gsap.fromTo(element,{y:mobile?20:34,autoAlpha:0},{y:0,autoAlpha:1,duration:0.8,ease:"power3.out",scrollTrigger:{
     trigger:element,start:"top 86%",once:true
    }});
   });
   if(homeRoute){
    const committeeSection=root.querySelector(".home-committees");
    if(committeeSection){
     const heading=committeeSection.querySelector(".section-head");
     const cards=gsap.utils.toArray(".committee-tile",committeeSection);
     const arrivals=gsap.timeline({scrollTrigger:{
      trigger:committeeSection,start:"top bottom",end:mobile?"top 48%":"top 44%",
      scrub:mobile?.65:.9,invalidateOnRefresh:true,fastScrollEnd:false,anticipatePin:1
     }});
     if(heading)arrivals.fromTo(heading,
      {x:mobile?-42:-112,y:mobile?8:16,autoAlpha:.38},
      {duration:1,x:0,y:0,autoAlpha:1,ease:"none"},0);
     arrivals.fromTo(cards,
      {x:index=>(index%3===1?1:-1)*(mobile?56:148),y:mobile?12:22,scale:.975,autoAlpha:.38,rotateY:index=>(index%3===1?1:-1)*(mobile?0:3)},
      {duration:1,x:0,y:0,scale:1,autoAlpha:1,rotateY:0,stagger:.1,ease:"none"},.04);
    }
    const countdown=root.querySelector(".countdown-band");
    if(countdown){
     const units=gsap.utils.toArray(".countdown-unit",countdown);
     const arrival=gsap.timeline({scrollTrigger:{
      trigger:countdown,start:"top bottom",end:mobile?"top 54%":"top 48%",
      scrub:mobile?.65:.9,invalidateOnRefresh:true,fastScrollEnd:false,anticipatePin:1
     }});
     arrival.fromTo(units,
      {x:index=>(index%2===0?-1:1)*(mobile?34:112),y:mobile?8:14,autoAlpha:.42,scale:.98},
      {duration:1,x:0,y:0,autoAlpha:1,scale:1,stagger:.12,ease:"none"},0);
    }
   }
  },root);
  const refresh=()=>ScrollTrigger.refresh();
  const raf=requestAnimationFrame(()=>requestAnimationFrame(refresh));
  window.addEventListener("load",refresh,{once:true});
  const fonts=document.fonts?.ready;
  fonts?.then(refresh).catch(()=>{});
  return()=>{
   cancelAnimationFrame(raf);
   window.removeEventListener("load",refresh);
   context.revert();
  };
 },[route]);
}
function Header({route}){
 const [open,setOpen]=useState(false),[mobileMenu,setMobileMenu]=useState(()=>window.matchMedia("(max-width:760px)").matches);
 const active=route.startsWith("committees")?"committees":route.split("/")[0];
 const links=[["","HOME"],["committees","COMMITTEES"],["secretariat","SECRETARIAT"],["utilities","UTILITY"],["about","ABOUT US"]];
 useEffect(()=>{
  const media=window.matchMedia("(max-width:760px)");
  const update=()=>{setMobileMenu(media.matches);setOpen(false);};
  media.addEventListener?.("change",update);
  return()=>media.removeEventListener?.("change",update);
 },[]);
 useEffect(()=>{
  document.body.classList.toggle("menu-open",open&&mobileMenu);
  const onKeyDown=event=>{if(event.key==="Escape")setOpen(false);};
  window.addEventListener("keydown",onKeyDown);
  return()=>{document.body.classList.remove("menu-open");window.removeEventListener("keydown",onKeyDown);};
 },[open,mobileMenu]);
 const close=()=>setOpen(false);
 const navLinks=links.map(([path,label],i)=><a key={path||"home"} className="nav-link" href={"#/"+path} aria-current={active===path?"page":undefined} onClick={close}>
  <span className="nav-index">0{i+1}</span><span className="nav-label">{label}</span><span className="nav-arrow" aria-hidden="true">↗</span>
 </a>);
 const mobileLayer=mobileMenu?createPortal(<>
  {open&&<button className="mobile-menu-scrim" type="button" aria-label="Close navigation" onClick={close}/>}
  <nav id="mobile-site-navigation" className={"mobile-menu-panel"+(open?" is-open":"")} aria-label="Mobile navigation" aria-hidden={!open} inert={!open}>
   <div className="mobile-menu-heading">
    <div><span className="micro ember">SANGAM / 2027</span><strong>Navigate</strong></div>
    <button className="mobile-menu-close" type="button" onClick={close} aria-label="Close menu"><span>CLOSE</span><b>×</b></button>
   </div>
   <div className="mobile-menu-links">{links.map(([path,label],i)=><a key={path||"home"} className="mobile-menu-link" href={"#/"+path} aria-current={active===path?"page":undefined} onClick={close}>
    <span className="mobile-menu-index">0{i+1}</span><strong>{label}</strong><span className="mobile-menu-arrow" aria-hidden="true">↗</span>
   </a>)}</div>
   <div className="mobile-menu-foot"><span>INDEPENDENT STUDENT-LED CONFERENCE</span><span>DIALOGUE · DELIBERATION · DIPLOMACY</span></div>
  </nav>
 </>,document.body):null;
 return <header className="site-header">
  <a className="brand brand-wordmark" href="#/" aria-label="SMUN home"><span className="brand-name">SMUN</span></a>
  <button className="menu-toggle" aria-label={open?"Close navigation":"Open navigation"} aria-controls={mobileMenu?"mobile-site-navigation":"main-site-navigation"} aria-expanded={open} onClick={()=>setOpen(!open)}><span/><span/></button>
  {!mobileMenu&&<nav id="main-site-navigation" className="main-nav desktop-nav" aria-label="Main navigation">{navLinks}</nav>}
  {mobileLayer}
 </header>;
}
function CreatorCredit(){
 const [name,setName]=useState("ahmed");
 const timer=useRef(null);
 const shuffle=()=>{
  window.clearInterval(timer.current);
  const target="ahmed",glyphs="abcdefghijklmnopqrstuvwxyz0123456789";
  let tick=0;
  timer.current=window.setInterval(()=>{
   tick+=1;
   setName(target.split("").map((letter,index)=>{
    if(index<Math.max(0,tick-2))return letter;
    return glyphs[Math.floor(Math.random()*glyphs.length)];
   }).join(""));
   if(tick>=target.length+2){
    window.clearInterval(timer.current);
    timer.current=null;
    setName(target);
   }
  },42);
 };
 useEffect(()=>()=>window.clearInterval(timer.current),[]);
 return <span className="creator-credit">
  <span>made with</span>
  <svg className="credit-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.4 5.4 0 0 0-7.6 0L12 6l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6l1.2 1.2L12 21l7.6-7.4 1.2-1.2a5.4 5.4 0 0 0 0-7.6Z"/></svg>
  <span>by</span>
  <a className="credit-ahmed" href="https://www.instagram.com/ahmed/" target="_blank" rel="noopener noreferrer" aria-label="ahmed on Instagram" onMouseEnter={shuffle} onFocus={shuffle}>{name}</a>
 </span>;
}
function Footer(){return <footer className="site-footer"><div className="footer-top"><div><a className="brand" href="#/"><span className="brand-mark">S</span><span className="brand-lockup"><span className="brand-name">SMUN</span><span className="brand-sub">SANGAM MODEL UNITED NATIONS</span></span></a><p className="footer-copy">A meeting point for ideas, perspectives and principled dialogue. Sangam brings young people into the practice of diplomacy, deliberation and collective problem-solving.</p></div><div className="footer-col"><h3>NAVIGATE</h3><div className="footer-links">{[["Home",""],["Committees","committees"],["Secretariat","secretariat"],["Conference Desk","utilities"],["About Us","about"]].map(([n,p])=><a key={p} href={"#/"+p}>{n}</a>)}</div></div><div className="footer-col"><h3>CORRESPONDENCE</h3><div className="footer-links"><a href={"mailto:"+(site.email||"secretariat@smun.in")}>{site.email||"secretariat@smun.in"}</a><a href="#/about">Contact details</a></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} SANGAM MODEL UNITED NATIONS</span><span>DIALOGUE · DELIBERATION · DIPLOMACY</span><a href="#/">BACK TO TOP ↑</a></div></footer>;}
function PageHead({eyebrow,title,copy,index}){
 return <section className="page-head" data-parallax-section>
  <div className="page-head-light" aria-hidden="true" data-parallax="-0.72"/>
  <div className="wrap page-head-grid"><div>
   <p className="eyebrow ember">{eyebrow}</p>
   <h1 className="display" dangerouslySetInnerHTML={{__html:title}}/>
   <p className="body-copy">{copy}</p>
  </div><div className="page-index">{index}</div></div>
 </section>;
}

function ConferenceNotice(){
 return <section className="conference-notice-band" aria-labelledby="conference-notice-title">
  <div className="wrap conference-notice-grid">
   <div className="conference-notice-copy">
    <p className="eyebrow ember">SMUN / 2027 EDITION</p>
    <h2 id="conference-notice-title">CONFERENCE DETAILS<br/><span>WILL BE ANNOUNCED HERE.</span></h2>
    <p>Confirmed dates, venue, registration particulars and the conference schedule will be published here by the Secretariat. Please rely on official conference updates rather than provisional information.</p>
   </div>
   <div className="conference-notice-facts" aria-label="Conference information status">
    <div><span>DATES</span><strong>TO BE ANNOUNCED</strong></div>
    <div><span>VENUE</span><strong>TO BE ANNOUNCED</strong></div>
    <div><span>REGISTRATION</span><strong>DETAILS PENDING</strong></div>
    <a href="#/about">CONTACT THE SECRETARIAT <span aria-hidden="true">↗</span></a>
   </div>
  </div>
 </section>;
}
function Home(){
 return <>
  <section className="hero" data-parallax-section><div className="hero-art" aria-hidden="true" data-parallax="-1"><svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none"><g stroke="#987c73" strokeWidth="1" opacity=".52"><path d="M850 -140C630 120 690 360 920 490s460 180 630 460"/><path d="M940 -160C720 100 780 340 1010 470s460 180 630 460"/><path d="M1030 -180C810 80 870 320 1100 450s460 180 630 460"/><path d="M760 -120C540 140 600 380 830 510s460 180 630 460"/></g><g stroke="#d92b45" strokeWidth="1" opacity=".5"><circle cx="1080" cy="415" r="210"/><circle cx="1080" cy="415" r="258"/><circle cx="1080" cy="415" r="306"/><path d="M770 415h620M1080 105v620"/></g><circle cx="1080" cy="415" r="3" fill="#fff0d5"/></svg></div><div className="hero-content hero-content-centered" data-parallax=".14">
  <p className="eyebrow ember">SANGAM MODEL UNITED NATIONS · 2027</p>
  <h1 className="display hero-title">WHERE NATIONS<br/>MEET. WHERE IDEAS<br/><span className="soft">CONVERGE.</span></h1>
  <p className="hero-sub">A FORUM FOR THE WORK OF NEGOTIATION</p>
  <p className="hero-copy">A forum for young minds to examine complex questions, articulate competing perspectives and discover the work that begins when dialogue replaces distance.</p>
  <div className="hero-actions hero-actions-centered">
   <MandateButton href={registrationFormUrl}/>
   <MinimalButton href="#/utilities">CONFERENCE DESK</MinimalButton>
  </div>
 </div><div className="hero-side-label">SANGAM · CONFLUENCE OF PERSPECTIVES</div><div className="hero-footer"><span>INDEPENDENT STUDENT-LED CONFERENCE</span><span>SCROLL TO EXPLORE ↓</span></div></section>
  <section className="home-stage" data-parallax-section>
   <div className="section home-committees"><div className="wrap"><div className="section-head"><div><p className="eyebrow ember">01 / COMMITTEE ROOMS</p><h2 className="section-title">DIFFERENT MANDATES. ONE FORUM.</h2></div><MinimalButton href="#/committees">ALL COMMITTEES</MinimalButton></div><div className="committee-grid">{committees.map((c,i)=><a className="committee-tile" href={"#/committees/"+c.id} key={c.id}><div className="tile-top"><img src={asset(c.logo)} alt={c.name+" emblem"} loading="lazy"/><span className="tile-no">0{i+1}</span></div><div><h3>{c.name}</h3><p>{c.acronym} · {c.format||"COMMITTEE BRIEF"}</p></div><span className="tile-arrow">↗</span></a>)}</div></div></div>
   <ConferenceNotice/>
  </section>
 </>;
}

function Committees(){
 const [selected,setSelected]=useState(0);
 const {mobile}=useViewport();
 const committee=committees[selected]||committees[0];
 return <>
  <PageHead eyebrow="THE COMMITTEE ROOMS" title={"SIX FORUMS.<br/><span class='soft'>A WORLD OF PERSPECTIVES.</span>"} copy="Six distinct mandates, connected by a shared commitment to considered debate. Choose a room from the wheel and enter its brief." index="01 — 06"/>
  <section className="wheel-section" data-parallax-section>
   <div className="wrap">
    <div className="wheel-intro"><div><p className="eyebrow ember">THE COUNCIL OF COMMITTEES</p><h2>CHOOSE YOUR<br/><span>ARENA.</span></h2></div><p>Six mandates. Six rooms. One shared forum. The wheel is the starting point.</p></div>
    <div className="wheel-layout">
     <div className="wheel-frame">
      <div className="wheel-orbit wheel-orbit-one" aria-hidden="true"/><div className="wheel-orbit wheel-orbit-two" aria-hidden="true"/>
      <div className="wheel-stage-label"><span>01</span><span>SELECT A COMMITTEE</span><span>06</span></div>
      <OptionWheel items={wheelItems} defaultSelected={0} onChange={index=>setSelected(index)}
       textColor="#a88d83" activeColor="#ffe4a0" side="left"
       fontSize={mobile?2.05:3.25} spacing={mobile?1.42:1.46}
       curve={mobile?0.62:0.92} tilt={mobile?2.8:4.5}
       blur={mobile?0.45:1.1} fade={0.2} minOpacity={0.13}
       smoothing={190} inset={mobile?20:42} loop={true} draggable={true}
       className="committee-option-wheel"/>
      <div className="wheel-hint">SCROLL · DRAG · ARROW KEYS</div>
      <div className="wheel-caption">SANGAM / 2027</div>
     </div>
     <article className="wheel-detail" key={committee.id}>
      <div className="wheel-detail-top"><div className="detail-emblem-small"><img src={asset(committee.logo)} alt={committee.name+" emblem"}/></div><span className="wheel-index">{String(selected+1).padStart(2,"0")} <i>/ 06</i></span></div>
      <p className="eyebrow ember">{committee.acronym} · SELECTED MANDATE</p>
      <h2>{committee.name}</h2>
      <p className="body-copy wheel-summary">{committee.summary||committee.description}</p>
      <div className="wheel-agenda"><span className="micro ember">THE AGENDA</span><p>{committee.agenda}</p></div>
      <section className="wheel-executive-board" aria-label="Executive Board">
       <div className="wheel-board-heading"><div><span className="micro ember">THE PEOPLE IN THE ROOM</span><h3>Executive Board</h3></div><span className="wheel-board-count">{(committee.board||[]).length} APPOINTMENTS</span></div>
       <div className="wheel-board-grid">{(committee.board||[]).map((member,index)=>{const entry=String(member);const parts=entry.split(":");const role=parts.length>1?parts.shift().trim():"Executive Board";const name=parts.join(":").trim()||entry;return <div className="executive-member" key={index}><span className="executive-member-index">0{index+1}</span><div><small>{role}</small><strong>{name}</strong></div><span className="executive-member-arrow" aria-hidden="true">↗</span></div>;})}</div>
      </section>
      <div className="wheel-enter"><CubeButton href={"#/committees/"+committee.id} front="ENTER THE ROOM" top="OPEN BRIEF" ariaLabel={"Open "+committee.name+" brief"}/></div>
     </article>
    </div>
   </div>
  </section>
  <section className="wrap committee-strip"><p className="eyebrow ember">ALL SIX ROOMS</p><div className="committee-strip-grid">{committees.map((item,index)=><a key={item.id} href={"#/committees/"+item.id}><span>0{index+1}</span><strong>{item.acronym}</strong><small>{item.format||"Committee"}</small><small>{item.name}</small></a>)}</div></section>
 </>;
}

const DB="smun-conference-resources";
function openDB(){return new Promise((resolve,reject)=>{if(!indexedDB)return reject(new Error("IndexedDB is unavailable."));const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains("files")){const store=db.createObjectStore("files",{keyPath:"id"});store.createIndex("committeeId","committeeId",{unique:false});}};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function getFiles(id){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction("files","readonly"),req=tx.objectStore("files").index("committeeId").getAll(id);req.onsuccess=()=>{db.close();resolve(req.result||[]);};req.onerror=()=>{db.close();reject(req.error);};});}
async function putFile(row){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction("files","readwrite");tx.objectStore("files").put(row);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});}
async function deleteFile(id){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction("files","readwrite");tx.objectStore("files").delete(id);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});}
function ResourceLibrary({committee}){
 const [files,setFiles]=useState([]),[title,setTitle]=useState(""),[category,setCategory]=useState("Study Guide"),[status,setStatus]=useState("Loading resources…"),[busy,setBusy]=useState(false);
 const refresh=async()=>{try{const rows=await getFiles(committee.id);setFiles(rows.sort((a,b)=>b.addedAt-a.addedAt));setStatus(rows.length?"":"No personal files have been saved in this browser yet.");}catch(e){setStatus(e.message||"Resource storage is unavailable.");}};
 useEffect(()=>{refresh();},[committee.id]);
 const add=async e=>{e.preventDefault();const form=e.currentTarget,file=form.elements.resourceFile.files?.[0];if(!file){setStatus("Choose a document first.");return;}const ext=file.name.split(".").pop().toLowerCase();if(!["pdf","doc","docx","ppt","pptx","txt"].includes(ext)){setStatus("Use PDF, Word, PowerPoint or TXT.");return;}if(file.size>20*1024*1024){setStatus("Files must be smaller than 20 MB.");return;}setBusy(true);try{await putFile({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),committeeId:committee.id,title:title.trim()||file.name,category,fileName:file.name,size:file.size,addedAt:Date.now(),blob:file});setTitle("");form.reset();await refresh();setStatus("Saved in this browser only; this file has not been shared.");}catch(err){setStatus(err.message||"Could not save this file.");}finally{setBusy(false);}};
 const download=row=>{const url=URL.createObjectURL(row.blob),a=document.createElement("a");a.href=url;a.download=row.fileName;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);};
 return <div className="resources"><p className="eyebrow ember">03 / PERSONAL RESOURCE SHELF</p><h2>PERSONAL FILES</h2><p className="resource-warning">This is a private, browser-local shelf. Files saved here remain on this device and are not uploaded to the conference, shared with the Secretariat, or visible to other delegates. Official conference documents will be published separately when released.</p><div className="resource-list">{files.map(f=><div className="resource-row" key={f.id}><div><span className="micro ember">{f.category} · {(f.size/1024).toFixed(0)} KB</span><strong>{f.title}</strong><small>{f.fileName}</small></div><div className="resource-actions"><button className="text-button" onClick={()=>download(f)}>DOWNLOAD ↗</button><button className="text-button danger" onClick={async()=>{await deleteFile(f.id);refresh();}}>REMOVE</button></div></div>)}{!files.length&&<div className="resource-empty">{status}</div>}</div><form className="upload-form" onSubmit={add}><h3>SAVE A PERSONAL REFERENCE COPY</h3><div className="upload-grid"><div className="field"><label htmlFor="resourceTitle">DOCUMENT TITLE</label><input id="resourceTitle" value={title} onChange={e=>setTitle(e.target.value)} maxLength="90" placeholder="e.g. Study Guide — Agenda I"/></div><div className="field"><label htmlFor="resourceCategory">CATEGORY</label><select id="resourceCategory" value={category} onChange={e=>setCategory(e.target.value)}><option>Study Guide</option><option>Committee Update</option><option>Notice</option><option>Background Paper</option><option>Other</option></select></div><div className="field"><label htmlFor="resourceFile">DOCUMENT (MAX 20 MB)</label><input id="resourceFile" name="resourceFile" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" required/></div></div><button className="pill filled" type="submit" disabled={busy}>{busy?"SAVING…":"SAVE PERSONAL COPY ↗"}</button><p className="resource-status" aria-live="polite">{status}</p></form></div>;
}
function CommitteeDetail({id}){
 const c=committees.find(item=>item.id===id);
 if(!c)return <section className="wrap not-found"><h1 className="display">COMMITTEE NOT FOUND.</h1><a className="text-link" href="#/committees">← BACK TO COMMITTEES</a></section>;
 return <div className="committee-detail"><div className="detail-banner"><div className="wrap"><MinimalButton href="#/committees">ALL COMMITTEES</MinimalButton></div></div><section className="detail-hero" data-parallax-section><div className="wrap detail-grid"><div className="detail-emblem" data-parallax="-.4"><img src={asset(c.logo)} alt={c.name+" emblem"}/></div><div data-reveal><p className="eyebrow ember">{c.acronym} · COMMITTEE PROFILE</p><h1>{c.name}</h1><p className="body-copy">{c.description}</p><div className="committee-format-note"><span>COMMITTEE FORMAT</span><strong>{c.format||"Committee simulation"}</strong></div></div></div></section><section className="wrap detail-content"><div><p className="eyebrow ember">01 / MANDATE</p><h2>AGENDA & SCOPE</h2><p className="body-copy detail-description">{c.description}</p><div className="agenda-box"><p className="micro ember">AGENDA</p><p>{c.agenda}</p></div><div className="board-box"><p className="micro ember">EXECUTIVE BOARD</p>{(c.board||[]).map((m,i)=><div className="board-row" key={i}><span>0{i+1}</span><strong>{m}</strong></div>)}</div></div><ResourceLibrary committee={c}/></section></div>;
}

function Secretariat({mobile}){
 const [active,setActive]=useState(null);
 const [hoveredId,setHoveredId]=useState(null);
 const divisions=useMemo(()=>[...new Set(people.map(p=>p.division))],[]);
 const items=people.map(p=>({image:asset(p.image),title:p.name}));
 const modalRef=useRef(null);
 const backdropRef=useRef(null);
 const openerRef=useRef(null);

 const openProfile=(person,event)=>{
  const origin=event.currentTarget;
  openerRef.current=origin;
  const flipState=Flip.getState(origin,{props:"backgroundColor,borderColor,borderRadius"});
  setHoveredId(null);
  setActive({person,flipState});
 };
 const closeProfile=()=>{
  if(!active||!modalRef.current)return;
  const flipState=Flip.getState(modalRef.current,{props:"backgroundColor,borderColor,borderRadius"});
  const id=active.person.id;
  setActive(null);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const destination=document.getElementById("profile-card-"+id);
   if(destination){
    Flip.from(flipState,{targets:destination,duration:0.62,ease:"power3.inOut",scale:true,fade:true,absolute:true,prune:true});
    destination.focus();
   }else openerRef.current?.focus();
   openerRef.current=null;
  }));
 };

 useLayoutEffect(()=>{
  if(!active||!modalRef.current||!backdropRef.current)return;
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow="hidden";
  const backdrop=backdropRef.current;
  const modal=modalRef.current;
  const fade=gsap.fromTo(backdrop,{autoAlpha:0},{autoAlpha:1,duration:0.28,ease:"power1.out"});
  const focusFrame=requestAnimationFrame(()=>modal.querySelector(".modal-close")?.focus());
  const flip=Flip.from(active.flipState,{
   targets:modal,
   duration:0.78,
   ease:"power4.inOut",
   scale:true,
   fade:true,
   absolute:true,
   prune:true,
   onComplete:()=>{
    gsap.fromTo(modal.querySelector(".profile-modal-copy"),
     {y:22,autoAlpha:0},
     {y:0,autoAlpha:1,duration:0.48,ease:"power3.out"}
    );
   }
  });
  const onKeyDown=event=>{
   if(event.key==="Escape"){closeProfile();return;}
   if(event.key==="Tab"){
    const focusable=[...modal.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null);
    if(!focusable.length){event.preventDefault();return;}
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
   }
  };
  window.addEventListener("keydown",onKeyDown);
  return()=>{
   fade.kill();flip.kill();cancelAnimationFrame(focusFrame);
   window.removeEventListener("keydown",onKeyDown);
   document.body.style.overflow=previousOverflow;
  };
 },[active]);

 return <>
  <PageHead eyebrow="THE SECRETARIAT" title={"THE PEOPLE<br/><span class='soft'>BEHIND THE FORUM.</span>"} copy="The conference is shaped by a team working across governance, committee affairs, operations and delegate experience." index={String(people.length).padStart(2,"0")+" PROFILES"}/>
  <section className="secretariat-wall-section" data-parallax-section>
   <div className="wall-heading wrap">
    <div><p className="eyebrow ember">THE SECRETARIAT / IN MOTION</p><h2 className="section-title">A COLLECTIVE EFFORT.</h2></div>
    <p className="wall-note">{mobile?"Tap a profile below to bring it into focus.":"Move across the portraits to bring each profile into focus."}</p>
   </div>
   <div className="secretariat-wall"><DriftWall items={items} columns={mobile?2:5} tileWidth={mobile?142:208} tileHeight={mobile?105:138} gap={mobile?10:16} radius={mobile?8:12} tilt={mobile?7:15} turn={mobile?-4:-13} perspective={mobile?900:1200} depth={mobile?45:110} speed={mobile?18:36} direction="up" variance={.38} parallax={mobile?.12:.48} pauseOnHover={false} lift={mobile?18:54} fade={.5} dim={.6} grayscale={true} overlayColor="#100904"/></div>
  </section>
  <section className="wrap secretariat-roster">
   {divisions.map((division,i)=>{
    const group=people.filter(p=>p.division===division);
    return <div className="roster-division" key={division}>
     <div className="division-heading"><p className="eyebrow ember">0{i+1} / DIVISION</p><h2>{division.toUpperCase()}</h2><span>{String(group.length).padStart(2,"0")} MEMBERS</span></div>
     <div className="roster-grid">
      {group.map(person=>{
       const expanded=hoveredId===person.id;
       return <button
        id={"profile-card-"+person.id}
        className={"profile-card"+(expanded?" is-expanded":"")}
        key={person.id}
        type="button"
        data-profile-id={person.id}
        data-flip-id={"profile-"+person.id}
        aria-haspopup="dialog"
        aria-expanded={active?.person.id===person.id}
        onPointerEnter={event=>{if(event.pointerType!=="touch"&&!mobile)setHoveredId(person.id);}}
        onPointerLeave={()=>setHoveredId(id=>id===person.id?null:id)}
        onFocus={()=>{if(!mobile)setHoveredId(person.id);}}
        onBlur={()=>setHoveredId(id=>id===person.id?null:id)}
        onClick={event=>openProfile(person,event)}
       >
        <img src={asset(person.image)} alt="" loading="lazy"/>
        <span className="profile-copy"><small>{person.post}</small><strong>{person.name}</strong><i>VIEW PROFILE ↗</i></span>
        <span className="profile-preview" aria-hidden="true">{person.bio}</span>
        <span className="profile-expand-mark" aria-hidden="true">↗</span>
       </button>;
      })}
     </div>
    </div>;
   })}
  </section>
  {active&&<div ref={backdropRef} className="profile-modal-backdrop" onClick={closeProfile}>
   <article ref={modalRef} className="profile-modal" data-flip-id={"profile-"+active.person.id} role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title" onClick={event=>event.stopPropagation()}>
    <button className="modal-close" onClick={closeProfile} aria-label="Close profile">×</button>
    <div className="profile-modal-image"><img src={asset(active.person.image)} alt={active.person.name}/><span>{active.person.division}</span></div>
    <div className="profile-modal-copy">
     <p className="eyebrow ember">{active.person.division}</p>
     <h2 id="profile-dialog-title">{active.person.name}</h2>
     <p className="profile-post">{active.person.post}</p>
     <div className="profile-bio"><p className="body-copy">{active.person.bio}</p></div>
     <button className="profile-modal-close" onClick={closeProfile}>RETURN TO THE SECRETARIAT <span>↗</span></button>
    </div>
   </article>
  </div>}
 </>;
}


function Desk(){
 const [duration,setDuration]=useState(180),[remaining,setRemaining]=useState(180),[running,setRunning]=useState(false),[name,setName]=useState("");
 const [queue,setQueue]=useState(()=>{try{return JSON.parse(localStorage.getItem("smun-speaker-queue")||"[]");}catch{return [];}});const audioContextRef=useRef(null),timerAlertedRef=useRef(false);
 useEffect(()=>{localStorage.setItem("smun-speaker-queue",JSON.stringify(queue));},[queue]);
 useEffect(()=>{if(!running)return;const timer=setInterval(()=>setRemaining(n=>Math.max(0,n-1)),1000);return()=>clearInterval(timer);},[running]);
 useEffect(()=>{if(remaining===0&&running&&!timerAlertedRef.current){timerAlertedRef.current=true;setRunning(false);playTimerAlert();}},[remaining,running]);
 useEffect(()=>()=>{audioContextRef.current?.close?.().catch?.(()=>{});},[]);
 const fmt=n=>String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");
 const armTimerAudio=()=>{const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return;try{if(!audioContextRef.current)audioContextRef.current=new AudioContextClass();if(audioContextRef.current.state==="suspended")audioContextRef.current.resume().catch(()=>{});}catch{}};
 const playTimerAlert=()=>{const ctx=audioContextRef.current;if(!ctx||ctx.state!=="running")return;const start=ctx.currentTime;[0,.24,.48].forEach((offset,index)=>{const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type="sine";oscillator.frequency.value=index===1?660:880;gain.gain.setValueAtTime(.0001,start+offset);gain.gain.exponentialRampToValueAtTime(.12,start+offset+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+offset+.17);oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(start+offset);oscillator.stop(start+offset+.18);});};
 const preset=n=>{timerAlertedRef.current=false;setRunning(false);setDuration(n);setRemaining(n);};
 const add=e=>{e.preventDefault();if(name.trim())setQueue(q=>[...q,{id:String(Date.now())+Math.random(),name:name.trim(),spoken:false}]);setName("");};
 const update=(id,patch)=>setQueue(q=>q.map(p=>p.id===id?{...p,...patch}:p));
 const move=(i,d)=>setQueue(q=>{const n=[...q],j=i+d;if(j<0||j>=n.length)return q;[n[i],n[j]]=[n[j],n[i]];return n;});
 const importList=async e=>{const f=e.target.files?.[0];if(!f)return;const names=(await f.text()).split(/\r?\n|,/).map(x=>x.trim().replace(/^"|"$/g,"")).filter(Boolean);setQueue(q=>[...q,...names.map((name,i)=>({id:String(Date.now())+i+Math.random(),name,spoken:false}))]);e.target.value="";};
 const exportList=()=>{const text=["Position,Delegate,Status",...queue.map((p,i)=>[i+1,'"'+p.name.replace(/"/g,'""')+'"',p.spoken?"Spoken":"Waiting"].join(","))].join("\n"),url=URL.createObjectURL(new Blob([text],{type:"text/csv"})),a=document.createElement("a");a.href=url;a.download="smun-speaker-queue.csv";a.click();URL.revokeObjectURL(url);};
 return <><PageHead eyebrow="CONFERENCE DESK" title={"THE TOOLS<br/><span class='soft'>OF DEBATE.</span>"} copy="A practical workspace for timing speeches and keeping a clear, orderly speakers’ list during committee sessions." index="LIVE TOOLS"/><section className="wrap desk-layout"><article className="desk-panel timer-panel"><p className="eyebrow ember">01 / SPEECH TIMER</p><div className="timer-display" role="timer" aria-label={`${fmt(remaining)} remaining`}>{fmt(remaining)}</div><div className="timer-state" role="status" aria-live="polite">{running?"TIMER RUNNING":remaining===0?"TIME COMPLETE":"READY TO BEGIN"}</div><div className="timer-presets">{[60,180,300,420,600,900].map(n=><button key={n} className={duration===n?"is-selected":""} onClick={()=>preset(n)}>{n/60} MIN</button>)}</div><div className="timer-actions"><button className="pill filled" onClick={()=>{if(running){setRunning(false);return;}armTimerAudio();timerAlertedRef.current=false;if(remaining===0)setRemaining(duration);setRunning(true);}}>{running?"PAUSE":remaining===0?"RESTART":"START"}</button><button className="pill" onClick={()=>{setRunning(false);setRemaining(duration);}}>RESET</button></div><p className="timer-caption">The clock is local to this browser tab. Keep the page open during the session.</p></article><article className="desk-panel queue-panel"><div className="queue-head"><div><p className="eyebrow ember">02 / SPEAKERS’ LIST</p><h2>DELEGATE QUEUE</h2><p className="queue-storage-note">Saved only in this browser. This list is not shared with other chairs or devices.</p></div><span className="queue-count">{queue.filter(p=>!p.spoken).length} WAITING</span></div><form className="queue-add" onSubmit={add}><input aria-label="Delegate name" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter delegate name" maxLength="80"/><button className="pill filled">ADD +</button></form><div className="queue-actions"><button className="text-button" onClick={()=>{const p=queue.find(x=>!x.spoken);if(p)update(p.id,{spoken:true});}} disabled={!queue.some(p=>!p.spoken)}>MARK NEXT AS SPOKEN</button><label className="text-button import-label">IMPORT TXT / CSV<input type="file" accept=".txt,.csv" onChange={importList}/></label><button className="text-button" onClick={exportList} disabled={!queue.length}>EXPORT CSV</button></div><div className="speaker-list">{queue.map((p,i)=><div className={"speaker-row"+(p.spoken?" is-spoken":"")} key={p.id}><span className="speaker-position">{String(i+1).padStart(2,"0")}</span><strong>{p.name}</strong><span className="speaker-status">{p.spoken?"SPOKEN":"WAITING"}</span><div className="speaker-controls"><button onClick={()=>move(i,-1)} disabled={!i} aria-label="Move up">↑</button><button onClick={()=>move(i,1)} disabled={i===queue.length-1} aria-label="Move down">↓</button><button onClick={()=>update(p.id,{spoken:!p.spoken})} aria-label="Toggle spoken">{p.spoken?"↶":"✓"}</button><button onClick={()=>setQueue(q=>q.filter(x=>x.id!==p.id))} aria-label="Remove delegate">×</button></div></div>)}{!queue.length&&<div className="resource-empty">The speakers’ list is empty. Add the first delegate above.</div>}</div><button className="text-button danger clear-queue" onClick={()=>setQueue([])} disabled={!queue.length}>CLEAR SPEAKERS’ LIST</button></article></section></>;
}
function About(){
 return <><PageHead eyebrow="ABOUT SANGAM" title={"A CONFLUENCE<br/><span class='soft'>OF PERSPECTIVES.</span>"} copy="Sangam Model United Nations is a student-led forum built around the serious work of understanding, contesting and negotiating ideas." index="THE CONFERENCE"/><section className="wrap about-layout"><div className="about-lead" data-parallax="-.3"><p className="eyebrow ember">OUR PURPOSE</p><h2 className="section-title">DIALOGUE IS NOT THE ABSENCE OF DISAGREEMENT. IT IS THE DISCIPLINE OF ENGAGING WITH IT.</h2></div><div className="about-copy"><p className="body-copy">Sangam creates a space where young people can examine public questions through research, debate, diplomacy and collaboration. Its committees offer distinct settings for deliberation, while the conference as a whole asks delegates to listen carefully, argue rigorously and remain open to persuasion.</p><div className="about-principles"><div><span>01</span><strong>INTELLECTUAL CURIOSITY</strong><p>Question assumptions and seek evidence before settling on a position.</p></div><div><span>02</span><strong>PRINCIPLED DISAGREEMENT</strong><p>Engage competing views without reducing debate to performance.</p></div><div><span>03</span><strong>COLLECTIVE PROBLEM-SOLVING</strong><p>Build proposals that recognise complexity and invite cooperation.</p></div></div></div></section><section className="section contact-section"><div className="wrap"><div className="section-head"><div><p className="eyebrow ember">CORRESPONDENCE</p><h2 className="section-title">THE SECRETARIAT IS WITHIN REACH.</h2></div><MinimalButton href={"mailto:"+(site.email||"secretariat@smun.in")}>WRITE TO THE SECRETARIAT</MinimalButton></div><div className="contact-grid">{(site.contacts||[]).map((c,i)=><article className="contact-card" key={c.role}><span>0{i+1}</span><p>{c.role}</p><h3>{c.name}</h3><a href={"tel:"+c.phone.replace(/\s/g,"")}>{c.phone}</a></article>)}</div></div></section><footer className="about-page-footer"><div className="about-page-footer-inner"><span className="about-page-copyright">© SMUN 2027 | All Rights Reserved</span><CreatorCredit/></div></footer></>;
}
export default function App(){
 const [route,setRoute]=useState(getRoute),{mobile,reduced}=useViewport();useParallax(route);
 useEffect(()=>{const onHash=()=>setRoute(getRoute());addEventListener("hashchange",onHash);if(!location.hash)location.hash="#/";return()=>removeEventListener("hashchange",onHash);},[]);
 useEffect(()=>{
  const match=route.match(/^committees\/(.+)$/);
  const committee=match?committees.find(item=>item.id===match[1]):null;
  const pages={
   "": ["Sangam Model United Nations 2027","A student-led forum for debate, diplomacy and collective problem-solving. Explore the committees, meet the Secretariat and find official conference updates."],
   "committees": ["Committees | SMUN 2027","Explore the six SMUN 2027 committee rooms, their formats, mandates and Executive Boards."],
   "secretariat": ["Secretariat | SMUN 2027","Meet the people responsible for organising Sangam Model United Nations 2027."],
   "utilities": ["Conference Desk | SMUN 2027","Speech timer and speakers’ list tools for SMUN committee sessions."],
   "about": ["About Sangam | SMUN 2027","Learn about Sangam Model United Nations, its purpose and Secretariat contacts."]
  };
  const meta=committee?[committee.name+" | SMUN 2027","Explore the "+committee.name+" committee at Sangam Model United Nations 2027."]:pages[route]||pages[""];
  document.title=meta[0];
  const description=document.querySelector('meta[name="description"]');
  if(description)description.setAttribute("content",meta[1]);
  const ogTitle=document.querySelector('meta[property="og:title"]');
  if(ogTitle)ogTitle.setAttribute("content",meta[0]);
  const ogDescription=document.querySelector('meta[property="og:description"]');
  if(ogDescription)ogDescription.setAttribute("content",meta[1]);
 },[route]);
 const detail=route.match(/^committees\/(.+)$/);
 const content=detail?<CommitteeDetail id={detail[1]}/>:route==="committees"?<Committees/>:route==="secretariat"?<Secretariat mobile={mobile}/>:route==="utilities"?<Desk/>:route==="about"?<About/>:<Home/>;

 return <div className="app-shell"><a className="skip-link" href="#main" onClick={event=>{event.preventDefault();document.getElementById("main")?.focus();}}>Skip to main content</a><RippleDistortion className="site-water" src={asset("assets/smun-ripple-field.svg")} brushSize={mobile?104:170} strength={mobile?0.11:0.17} swirl={0.82} rings={4} spread={5.2} fade={3.2} spacing={mobile?24:13} dispersion={0.035} glint={0.16} tint="#d92b45" highlightColor="#ffe4a0" tintAmount={0.14} grayscale={false} trigger="both" quality={mobile?"low":"medium"} enabled={!reduced}/><GradientASCII className="ambient-ascii" colors={["#3d0d1b","#87172c","#d92b45","#d7a64c","#ffe8aa"]} shape="eclipse" characters=" .:-=+*#" cellSize={mobile?13:18} density={mobile?0.58:0.68} glyphOpacity={0.82} gradientOpacity={0.74} glow={0.09} depthOfField={0.1} flicker={0.035} softness={0.68} scale={1.02} flow={1.4} speed={0.38} grain={0.025} variation={0.18} mouseInteraction={!reduced} scrambleRadius={0.38} clickEffect="wave" intro dpr={mobile?1:1.15}/><div className="app-content"><GlowCursor className="site-cursor" color="#ffe4a0" secondaryColor="#d92b45" intensity={mobile?0.7:0.92} trailWidth={mobile?1.7:2.45} linger={mobile?0.55:2.1} glow={0.88} hotspot={0.8} followSpeed={0.9} grain={0.015} clickBurst quality={mobile?"low":"high"} theme="dark" maxDevicePixelRatio={1.35} enabled={!mobile&&!reduced}><Header route={route}/><main id="main" className="page" tabIndex="-1">{content}</main>{route!=="about"&&<Footer/>}</GlowCursor></div></div>;
}
