// Explicitly opt-in CDP integration runner. Refuses any non-generated vault before mutations.
import {readFile,writeFile,realpath} from 'node:fs/promises';
import {resolve,relative,isAbsolute,sep} from 'node:path';
import assert from 'node:assert/strict';
const run=JSON.parse(await readFile('.local/runtime-last.json','utf8'));
const base=await realpath('.local/runtime-runs'),root=await realpath(run.vault),rel=relative(base,root);
assert(rel && !rel.startsWith('..'+sep) && rel!=='..' && !isAbsolute(rel),'Not a generated fixture');
const response=await fetch('http://127.0.0.1:9239/json/list');const targets=await response.json();
const target=targets.find(t=>t.type==='page'&&t.url==='app://obsidian.md/index.html');
assert(target,'Synthetic Obsidian app page not ready');
const socket=new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let sequence=0;const pending=new Map();
socket.addEventListener('message',event=>{const msg=JSON.parse(event.data),p=pending.get(msg.id);if(!p)return;clearTimeout(p.timer);pending.delete(msg.id);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result)});
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(new Error('Timeout: '+method))},20000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}))})}
async function evaluate(expression){const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value}
try{
 const actual=await evaluate("typeof app!=='undefined' && app.vault?.adapter.getBasePath()");
 assert(actual && resolve(actual).toLowerCase()===root.toLowerCase(),'Refusing a non-fixture or unopened vault');
 console.log('Verified generated vault path');
 const mode=process.argv[2]||'run';
 if(mode==='inspect'){
  console.log(JSON.stringify(await evaluate("({title:document.title,enabled:app.plugins.isEnabled(),plugins:Object.keys(app.plugins.plugins),modals:Array.from(document.querySelectorAll('.modal-container')).map(el=>({text:el.innerText.slice(0,800),buttons:Array.from(el.querySelectorAll('button')).map(b=>b.textContent)}))})"),null,2));
 }else if(mode==='restart'){
  const state=await evaluate("(async()=>{if(!app.plugins.isEnabled())await app.plugins.setEnable(true);if(!app.plugins.plugins['personal-glass'])await app.plugins.loadPlugin('personal-glass');const p=app.plugins.plugins['personal-glass'];return {angle:p.settings.selectionAngle,pins:p.settings.pinnedPaths,palette:p.settings.palette}})()");
  assert.equal(state.angle,187);assert(state.pins.includes('Welcome.md'));assert.equal(state.palette,'rose');
  await writeFile(resolve(run.home,'restart.json'),JSON.stringify({status:'passed',...state},null,2));console.log('Full process restart preserved settings');
 }else{
  await evaluate("(async()=>{if(!app.plugins.isEnabled())await app.plugins.setEnable(true);if(!app.plugins.plugins['personal-glass'])await app.plugins.loadPlugin('personal-glass');})()");
  // This modifies only the already verified development instance, so paint-dependent views can render.
  await evaluate("(()=>{const p=app.plugins.plugins['personal-glass'],old=p.settings.material;p.settings.material='acrylic';const win=p.getNativeWindow(document);p.settings.material=old;win?.webContents.setBackgroundThrottling(false);win?.show();})()");
  await evaluate("(async()=>{if(!app.plugins.plugins['personal-glass-runtime-smoke'])await app.plugins.loadPlugin('personal-glass-runtime-smoke');})()");
  console.log('Triggered guarded runtime harness; inspect its result.json');
 }
}finally{socket.close()}
