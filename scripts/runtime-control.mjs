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
 }else if(mode==='trust'){
  const trusted=await evaluate("(()=>{const button=Array.from(document.querySelectorAll('.modal-container button')).find(el=>el.textContent?.includes('Trust author and enable plugins'));if(!button)return false;button.click();return true})()");
  assert(trusted,'Expected the first-open trust prompt for this generated fixture');console.log('Trusted only the generated synthetic vault');
 }else if(mode==='slash-ui'){
  await evaluate("(async()=>{if(!app.plugins.isEnabled())await app.plugins.setEnable(true);if(!app.plugins.plugins['personal-glass'])await app.plugins.loadPlugin('personal-glass');const leaf=app.workspace.getLeavesOfType('markdown')[0]||app.workspace.getLeaf('tab');await leaf.setViewState({type:'markdown',state:{file:'Welcome.md',mode:'source'}});app.workspace.setActiveLeaf(leaf,{focus:true});return true})()");
  const original=await evaluate("app.vault.cachedRead(app.vault.getAbstractFileByPath('Welcome.md'))");
  const checks={};let failure,restored=false;
  const check=(value,label)=>{assert(value,label);checks[label]=true};
  const prepare=async(value,line,ch)=>evaluate(`(()=>{const leaf=app.workspace.getLeavesOfType('markdown')[0],editor=leaf.view.editor;editor.setValue(${JSON.stringify(value)});editor.setCursor({line:${line},ch:${ch}});leaf.view.containerEl.querySelector('.cm-content')?.focus();return editor.getValue()})()`);
  const type=async(value)=>{await send('Input.insertText',{text:value});await new Promise(resolve=>setTimeout(resolve,250))};
  const key=async(name,code)=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:name,code});await send('Input.dispatchKeyEvent',{type:'keyUp',key:name,code});await new Promise(resolve=>setTimeout(resolve,150))};
  const rows=()=>evaluate("Array.from(document.querySelectorAll('.pg-slash-suggestion')).map(el=>el.querySelector('.pg-slash-title')?.textContent)");
  try{
   check(await evaluate("app.plugins.plugins['personal-glass'].settings.slashMenu"),'slashMenuEnabledByDefault');
   await prepare('正文',0,2);await type('/');let visible=await rows();check(visible.length===19 && visible.includes('純文字') && visible.includes('標題一') && visible.includes('新增空白段落'),'asciiSlashShowsNineteenDocumentBlocks');
   await key('Escape','Escape');await prepare('正文',0,2);await type('／');await type('biaoge');visible=await rows();check(visible.length===1 && visible[0]==='表格','fullwidthSlashAndPinyinSearch');
   await key('Escape','Escape');await prepare('```md\n',1,0);await type('/');check((await rows()).length===0,'fencedCodeSuppression');
   await prepare('inline ` ',0,9);await type('/todo');check((await rows()).length===0,'inlineCodeSuppression');
   await prepare('正文',0,2);await type('/h1');visible=await rows();check(visible.length===1 && visible[0]==='標題一','headingSearch');await key('Enter','Enter');
   let inserted=await evaluate("(()=>{const editor=app.workspace.getLeavesOfType('markdown')[0].view.editor;return {value:editor.getValue(),selection:editor.getSelection()}})()");
   check(inserted.value==='# 正文','headingTransformsCurrentDocumentBlock');
   await prepare('',0,0);await type('/h1');await key('Enter','Enter');
   inserted=await evaluate("(()=>{const editor=app.workspace.getLeavesOfType('markdown')[0].view.editor;return {value:editor.getValue(),selection:editor.getSelection()}})()");
   check(inserted.value==='# Heading' && inserted.selection==='Heading','emptyBlockInsertionAndPlaceholderSelection');
   await prepare('Keep this ',0,10);await type('/below');await key('Enter','Enter');
   inserted=await evaluate("(()=>{const editor=app.workspace.getLeavesOfType('markdown')[0].view.editor;return {value:editor.getValue(),cursor:editor.getCursor()}})()");
   const expectedBelow=['Keep this ','',''].join('\n');
   check(inserted.value===expectedBelow && inserted.cursor.line===1 && inserted.cursor.ch===0,'paragraphBelowAction');
   await prepare('Keep this ',0,10);await type('/todo');await key('Enter','Enter');
   inserted=await evaluate("app.workspace.getLeavesOfType('markdown')[0].view.editor.getValue()");check(inserted==='- [ ] Keep this','todoTransformsDocumentBlock');
   await evaluate("app.plugins.plugins['personal-glass'].settings.slashMenu=false");await prepare('',0,0);await type('/');check((await rows()).length===0,'settingDisablesMenu');
  }catch(error){failure=error}
  finally{
   try{
    restored=await evaluate(`(async()=>{const p=app.plugins.plugins['personal-glass'];if(p)p.settings.slashMenu=true;const file=app.vault.getAbstractFileByPath('Welcome.md'),leaf=app.workspace.getLeavesOfType('markdown')[0],editor=leaf?.view?.editor,original=${JSON.stringify(original)};if(editor)editor.setValue(original);if(file)await app.vault.modify(file,original);if(editor){editor.setValue(original);editor.setCursor({line:0,ch:0})}return await app.vault.cachedRead(file)===original})()`);
   }catch(error){failure??=error}
  }
  checks.syntheticWelcomeRestored=restored;if(!restored)failure??=new Error('Synthetic Welcome.md was not restored');
  const report=JSON.parse(await readFile(run.report,'utf8'));report.slashMenu={status:failure?'failed':'passed',method:'CDP trusted text input in generated synthetic vault; physical IME not tested',checks};if(failure)report.slashMenu.error=String(failure);await writeFile(run.report,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report.slashMenu,null,2));
  if(failure)throw failure;
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
