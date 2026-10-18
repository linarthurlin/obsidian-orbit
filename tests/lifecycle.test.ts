import {it,expect,vi,afterEach} from 'vitest';
vi.mock('obsidian',()=>({
  Plugin:class {
    app:any; commands:any[]=[]; registered:any[]=[];
    constructor(app:any){this.app=app}
    loadData=vi.fn(async()=>null);
    saveData=vi.fn(async(_data:any)=>{});
    registerView=vi.fn();registerEditorSuggest=vi.fn();addCommand=(command:any)=>this.commands.push(command);
    registerEvent=(event:any)=>this.registered.push(event);
    addRibbonIcon=vi.fn();addSettingTab=vi.fn();
  },
  PluginSettingTab:class {constructor(..._args:any[]){}},
  EditorSuggest:class {context:any=null;limit=0;constructor(..._args:any[]){}},
  Setting:class {},Notice:class {},ItemView:class {},TFile:class {},TFolder:class {},Menu:class {},
  setIcon:vi.fn(),getAllTags:vi.fn(),Platform:{isWin:false,isDesktopApp:false},
}));
import Companion from '../src/main';
import {selectionVariables} from '../src/selection';
class Style {
  values=new Map<string,{value:string;priority:string}>();
  getPropertyValue(key:string){return this.values.get(key)?.value||''}
  getPropertyPriority(key:string){return this.values.get(key)?.priority||''}
  setProperty(key:string,value:string,priority=''){this.values.set(key,{value,priority})}
  removeProperty(key:string){this.values.delete(key)}
}
function doc(){
  const attributes=new Map<string,string>(),style=new Style();
  return {body:{style,getAttribute:(k:string)=>attributes.get(k)??null,setAttribute:(k:string,v:string)=>attributes.set(k,v),removeAttribute:(k:string)=>attributes.delete(k)},defaultView:null} as unknown as Document;
}
function fixture(){
  const main=doc(),events=new Map<string,Function>(),layouts:Function[]=[];
  const workspace={on:(name:string,callback:Function)=>{events.set(name,callback);return {name}},onLayoutReady:(callback:Function)=>layouts.push(callback),
    iterateAllLeaves:vi.fn(),getLeavesOfType:()=>[],detachLeavesOfType:vi.fn()};
  const app={workspace,vault:{on:(name:string,callback:Function)=>{events.set(name,callback);return {name}}}};
  vi.stubGlobal('document',main);
  const plugin=new (Companion as any)(app);
  return {plugin,main,events,layouts,workspace};
}
afterEach(()=>vi.unstubAllGlobals());
it('restores pre-existing document attributes, CSS values and priorities across main/popout windows',async()=>{
  const f=fixture(),child=doc();
  f.main.body.setAttribute('data-personal-palette','external');
  f.main.body.style.setProperty('--personal-content-width','777px','important');
  f.main.body.style.setProperty('--pg-selection-angle','42deg','important');
  child.body.style.setProperty('--pg-selection-light-start','#abcdef','important');
  await f.plugin.onload();f.layouts[0]();f.events.get('window-open')!({}, {document:child});
  expect(f.main.body.getAttribute('data-personal-palette')).toBe('warm');
  expect(child.body.getAttribute('data-personal-palette')).toBe('warm');
  f.events.get('window-close')!({}, {document:child});
  expect(child.body.style.getPropertyValue('--pg-selection-light-start')).toBe('#abcdef');
  expect(child.body.style.getPropertyPriority('--pg-selection-light-start')).toBe('important');
  f.plugin.onunload();
  expect(f.main.body.getAttribute('data-personal-palette')).toBe('external');
  expect(f.main.body.style.getPropertyValue('--personal-content-width')).toBe('777px');
  expect(f.main.body.style.getPropertyPriority('--personal-content-width')).toBe('important');
  expect(f.main.body.style.getPropertyValue('--pg-selection-angle')).toBe('42deg');
  expect(f.main.body.style.getPropertyPriority('--pg-selection-angle')).toBe('important');
  expect(f.main.body.getAttribute('data-personal-native')).toBe(null);
  for(const key of Object.keys(selectionVariables(f.plugin.settings)).filter(k=>k!=='--pg-selection-angle'))
    expect(f.main.body.style.getPropertyValue(key)).toBe('');
  expect(f.workspace.detachLeavesOfType).toHaveBeenCalledWith('personal-glass-navigator');
});
it('persists immutable queued snapshots and ignores late settings changes after unload',async()=>{
  const f=fixture();await f.plugin.onload();
  let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve),saved:any[]=[];
  f.plugin.saveData=vi.fn(async(data:any)=>{await gate;saved.push(structuredClone(data))});
  f.plugin.settings.palette='rose';f.plugin.settings.pinnedPaths=['A.md'];
  const first=f.plugin.persist();
  f.plugin.settings.palette='mineral';f.plugin.settings.pinnedPaths.push('B.md');
  const second=f.plugin.persist();release();await Promise.all([first,second]);
  expect(saved.map(s=>s.palette)).toEqual(['rose','mineral']);
  expect(saved[0].pinnedPaths).toEqual(['A.md']);
  expect(saved[1].pinnedPaths).toEqual(['A.md','B.md']);
  f.plugin.onunload();await f.plugin.persist();expect(saved).toHaveLength(2);
});
it('does not register views after a delayed load finishes on an unloaded plugin',async()=>{
  const f=fixture();let release!:(data:any)=>void;
  f.plugin.loadData=()=>new Promise(resolve=>release=resolve);
  const loading=f.plugin.onload();f.plugin.onunload();release({palette:'rose'});await loading;
  expect(f.plugin.registerView).not.toHaveBeenCalled();expect(f.plugin.commands).toHaveLength(0);
});
it('recovers the save queue after a failed write instead of blocking later settings saves',async()=>{
  const f=fixture();await f.plugin.onload();let attempt=0;
  f.plugin.saveData=vi.fn(async()=>{if(++attempt===1)throw new Error('disk unavailable')});
  await expect(f.plugin.persist()).rejects.toThrow('disk unavailable');
  f.plugin.settings.palette='rose';await f.plugin.persist();expect(attempt).toBe(2);
});
