// Shared browser helpers for the FIR full-flow walk (scripts/verify-fir-full-flow.cjs).
// Signs in through the UI with the existing demo identities; the password is read
// into memory only. No token, password or credential is written anywhere.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const CLICKABLE='[role="button"],[role="checkbox"],[role="radio"],[role="link"],[role="tab"],[role="switch"],button,a';

/** Clicks the visible control whose text (or aria-label) is exactly `text`; `nth` picks among several. */
async function click(page,text,{nth=0,timeout=45000,contains=false,last=false}={}){
  if(last)nth=-1;
  const find=(sel,text,nth,contains)=>{const norm=s=>(s??'').replace(/\s+/g,' ').trim();
    const all=[...document.querySelectorAll(sel)].filter(e=>e.getClientRects().length&&!e.disabled&&e.getAttribute('aria-disabled')!=='true'&&getComputedStyle(e).visibility!=='hidden');
    const match=all.filter(e=>{const t=norm(e.textContent),l=norm(e.getAttribute('aria-label'));return contains?(t.includes(text)||l.includes(text)):(t===text||l===text);});
    // Prefer the innermost match (a card containing a button also "contains" its text).
    const inner=match.filter(e=>!match.some(o=>o!==e&&e.contains(o)));
    // An open sheet or dialog covers the screen: only what is inside it can be tapped.
    const modal=inner.filter(e=>e.closest('[aria-modal="true"],[role="dialog"]'));
    return (modal.length?modal:inner).at(nth)??null;};
  await page.waitForFunction(find,{timeout},CLICKABLE,text,nth,contains).catch(()=>{throw new Error(`No clickable "${text}" on ${page.url()}`);});
  const h=await page.evaluateHandle(find,CLICKABLE,text,nth,contains);
  await h.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await delay(250);
  try{await h.asElement().click();}catch{await h.asElement().evaluate(e=>e.click());}
  await h.dispose();await delay(350);
}
/** Types into the visible input/textarea identified by aria-label or placeholder. */
async function fill(page,label,value,{timeout=45000,nth=0}={}){
  const find=(label,nth)=>[...document.querySelectorAll('input,textarea')].filter(e=>(e.getAttribute('aria-label')===label||e.getAttribute('placeholder')===label)&&e.getClientRects().length)[nth]??null;
  await page.waitForFunction(find,{timeout},label,nth).catch(()=>{throw new Error(`No field "${label}" on ${page.url()}`);});
  const h=await page.evaluateHandle(find,label,nth);
  await h.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await delay(200);
  // Select everything (a triple click takes only one paragraph of a multi-line field).
  await h.asElement().click();await page.keyboard.down('Control');await page.keyboard.press('KeyA');await page.keyboard.up('Control');await page.keyboard.press('Backspace');
  if(value)await h.asElement().type(value,{delay:5});
  const got=await h.asElement().evaluate(e=>e.value);await h.dispose();
  assert.equal(got.replace(/\s+/g,' ').trim(),String(value).replace(/\s+/g,' ').trim(),`Entered "${label}"`);
}
const text=(page,value,timeout=45000)=>page.waitForFunction(v=>document.body.innerText.includes(v),{timeout},value).catch(()=>{throw new Error(`Text "${value}" never appeared on ${page.url()}`);});
const noText=(page,value,timeout=20000)=>page.waitForFunction(v=>!document.body.innerText.includes(v),{timeout},value).catch(()=>{throw new Error(`Text "${value}" stayed on ${page.url()}`);});
const has=(page,value)=>page.evaluate(v=>document.body.innerText.includes(v),value);
const at=(page,part,timeout=45000)=>page.waitForFunction(p=>location.pathname.includes(p)||location.href.includes(p),{timeout},part).catch(()=>{throw new Error(`Never reached ${part}; still at ${page.url()}`);});
/** What is on screen: for writing the walk and for failure reports. */
async function dump(page,label=''){
  const info=await page.evaluate(sel=>{const norm=s=>(s??'').replace(/\s+/g,' ').trim(),vis=e=>e.getClientRects().length>0;
    return {url:location.pathname+location.search,
      buttons:[...new Set([...document.querySelectorAll(sel)].filter(vis).map(e=>norm(e.getAttribute('aria-label'))||norm(e.textContent)).filter(Boolean).map(s=>s.slice(0,70)))],
      fields:[...document.querySelectorAll('input,textarea')].filter(vis).map(e=>`${e.getAttribute('aria-label')??''}|${e.getAttribute('placeholder')??''}|${e.type}=${(e.value??'').slice(0,30)}`),
      text:norm(document.body.innerText).slice(0,1800)};},CLICKABLE);
  console.log(`--- ${label} ${info.url}\nBUTTONS: ${info.buttons.slice(0,45).join(' ¦ ')}${info.buttons.length>45?` ¦ …(+${info.buttons.length-45})`:''}\nFIELDS: ${info.fields.join(' ¦ ')}\nTEXT: ${info.text}\n---`);
  return info;
}
/** Phone-width screenshot of the whole screen: the viewport grows to the scroll height first. */
async function shot(page,file,{width=430,min=932,max=6000}={}){
  fs.mkdirSync(path.dirname(file),{recursive:true});await delay(500);
  const height=await page.evaluate(()=>{let extra=0;for(const e of document.querySelectorAll('*')){const o=getComputedStyle(e).overflowY;if((o==='auto'||o==='scroll')&&e.scrollHeight>e.clientHeight+4)extra=Math.max(extra,e.scrollHeight-e.clientHeight);}return window.innerHeight+extra;});
  const before=page.viewport();
  await page.setViewport({width,height:Math.max(min,Math.min(max,height)),deviceScaleFactor:1});await delay(450);
  await page.evaluate(()=>{for(const e of document.querySelectorAll('*'))if(e.scrollTop)e.scrollTop=0;});await delay(150);
  await page.screenshot({path:file});
  await page.setViewport(before);await delay(250);
  console.log('SHOT',path.basename(file));
}
/** Chooses a file through the app's own picker. */
async function chooseFile(page,trigger,file,opts={}){
  const [chooser]=await Promise.all([page.waitForFileChooser({timeout:30000}),click(page,trigger,opts)]);
  await chooser.accept([file]);await delay(600);
}
async function signIn(browser,env,{role,email,password,mobile,adminWeb,errors}){
  const context=await browser.createBrowserContext(),page=await context.newPage();
  page.on('pageerror',e=>errors.push({role,message:e.message}));
  page.on('dialog',async d=>{console.log(`dialog(${role}): ${d.message().slice(0,120)}`);await d.accept();});
  const admin=role==='admin';
  await page.setViewport({width:admin?1440:430,height:admin?1000:932});
  if(env?.attach)await env.attach(page);
  await page.goto(admin?adminWeb+'/sign-in':mobile+'/login',{waitUntil:'networkidle0',timeout:90000});
  if(admin){await page.type('input[name="email"]',email);await page.type('input[name="password"]',password);await click(page,'Sign in');await page.waitForFunction(()=>location.pathname!=='/sign-in',{timeout:60000});}
  else{await page.type('input[placeholder="Email / Mobile No"]',email);await page.type('input[aria-label="Password"]',password);await click(page,'Continue');
    await page.waitForFunction(()=>/\/(home|dashboard)$/.test(location.pathname),{timeout:60000});}
  return page;
}
const go=async(page,url)=>{await page.goto(url,{waitUntil:'networkidle2',timeout:90000});await delay(900);};
module.exports={delay,click,fill,text,noText,has,at,dump,shot,chooseFile,signIn,go};
