// Development-only test plugin. Compiled solely into a guarded synthetic vault.
import {Plugin,apiVersion} from 'obsidian';
import {writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
declare const __EXPECTED_VAULT__:string;
declare const __REPORT_PATH__:string;
declare const __SCENARIO__:string;
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
export default class RuntimeHarness extends Plugin {
 async onload(){this.app.workspace.onLayoutReady(()=>{void this.run()})}
 async run(){
  const app=this.app as any,checks:Record<string,unknown>={};
  const assert=(value:unknown,label:string)=>{if(!value)throw new Error(label);checks[label]=true};
  const report:any={scenario:__SCENARIO__,apiVersion,electron:process.versions.electron,checks,status:'running'};
  try{
   if(resolve(app.vault.adapter.getBasePath()).toLowerCase()!==resolve(__EXPECTED_VAULT__).toLowerCase())throw new Error('Refusing non-fixture vault');
   const before=await readFile(resolve(__EXPECTED_VAULT__,'Welcome.md'),'utf8');
   const plugin=app.plugins.plugins['personal-glass'];assert(plugin,'companionLoaded');
   assert(Object.keys(app.commands.commands).filter(id=>id.startsWith('personal-glass:')).length===17,'seventeenCommands');
   assert(plugin.settings.palette==='rose' && plugin.settings.contentWidth===940 && plugin.settings.pinnedPaths.includes('Welcome.md'),'legacySettingsLoaded');
   const leaf=app.workspace.getLeaf('tab');await leaf.setViewState({type:'markdown',state:{file:'Welcome.md',mode:'source'}});app.workspace.setActiveLeaf(leaf,{focus:true});
   const editor=leaf.view.editor;assert(editor,'editorAvailable');
   const source=editor.getValue();
   try{editor.setSelection({line:0,ch:0},{line:0,ch:2});app.commands.executeCommandById('personal-glass:callout-note');assert(editor.getValue().includes('> [!note]'),'calloutInsertion');editor.undo();assert(editor.getValue()===source,'editorUndo')}
   finally{if(editor.getValue()!==source)editor.setValue(source)}
   await plugin.openNavigator();
   const nav=app.workspace.getLeavesOfType('personal-glass-navigator')[0]?.view;
   assert(nav?.contentEl.querySelector('[aria-label="Search navigator"]'),'navigatorMounted');
   const input=nav.contentEl.querySelector('[aria-label="Search navigator"]');input.value='狀態估測 #robotics';input.dispatchEvent(new Event('input',{bubbles:true}));
   // Narrow layout may display sources, but the filtered results still exist in the view.
   assert(nav.contentEl.querySelectorAll('.pg-file').length===1,'aliasAndTagFiltering');
   plugin.settings.selectionAngle=187;await plugin.persist();
   const saved=JSON.parse(await readFile(resolve(__EXPECTED_VAULT__,'.obsidian/plugins/personal-glass/data.json'),'utf8'));
   assert(saved.selectionAngle===187 && saved.pinnedPaths.includes('Welcome.md'),'settingsSaved');
   const popout=app.workspace.openPopoutLeaf({size:{width:700,height:600}});
   try{await popout.setViewState({type:'markdown',state:{file:'Welcome.md',mode:'source'}});plugin.applyAll();const doc=popout.view.containerEl.ownerDocument;assert(doc!==document && doc.body.style.getPropertyValue('--pg-selection-angle')==='187deg','popoutSettings')}
   finally{popout.detach()}
   await app.plugins.disablePlugin('personal-glass');
   assert(!document.body.hasAttribute('data-personal-palette') && !document.body.style.getPropertyValue('--pg-selection-angle'),'unloadClearsOwnedState');
   assert(app.workspace.getLeavesOfType('personal-glass-navigator').length===0,'navigatorDetached');
   await app.plugins.enablePlugin('personal-glass');
   const reloaded=app.plugins.plugins['personal-glass'];
   assert(reloaded?.settings.selectionAngle===187 && reloaded.settings.pinnedPaths.includes('Welcome.md'),'reloadKeepsSettings');
   const after=await readFile(resolve(__EXPECTED_VAULT__,'Welcome.md'),'utf8');assert(digest(before)===digest(after),'fixtureNoteUnchanged');
   report.themeToken=getComputedStyle(document.body).getPropertyValue('--pg-surface').trim();
   if(__SCENARIO__==='theme')assert(report.themeToken,'themeTokensPresent');
   report.status='passed';
  }catch(error){report.status='failed';report.error=error instanceof Error?error.stack:String(error)}
  await writeFile(__REPORT_PATH__,JSON.stringify(report,null,2));
 }
}
