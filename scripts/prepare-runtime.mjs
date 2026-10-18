// Creates a fresh synthetic vault/profile only. Never accepts a user's vault path.
import {mkdir,writeFile,readFile,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {build} from 'esbuild';
import {install} from './install.mjs';
const scenario=process.argv[2]||'default';
if(!['default','theme'].includes(scenario))throw new Error('Use default or theme');
const home=resolve('.local/runtime-runs/'+scenario+'-'+Date.now()+'-'+process.pid),vault=join(home,'vault'),profile=join(home,'profile'),report=join(home,'result.json');
await mkdir(join(vault,'.obsidian/plugins/personal-glass'),{recursive:true});await mkdir(profile,{recursive:true});
await writeFile(join(vault,'Welcome.md'),'# 合成測試筆記\n\nThis note is a synthetic lifecycle fixture.\n');
await writeFile(join(vault,'Filtering.md'),'---\naliases: [狀態估測]\ntags: [robotics/estimation]\n---\n# Filtering\n');
await writeFile(join(vault,'.obsidian/plugins/personal-glass/data.json'),JSON.stringify({palette:'rose',contentWidth:940,pinnedPaths:['Welcome.md'],selectionLightStart:'#abcdef',selectionDarkStart:'#102030',selectionAngle:210}));
await writeFile(join(vault,'.obsidian/plugins/personal-glass/main.js'),'LEGACY FIXTURE');
await install(vault);
const harness=join(vault,'.obsidian/plugins/personal-glass-runtime-smoke');await mkdir(harness,{recursive:true});
await writeFile(join(harness,'manifest.json'),JSON.stringify({id:'personal-glass-runtime-smoke',name:'Synthetic runtime checks',version:'0.0.0',minAppVersion:'1.6.0',author:'Local development',isDesktopOnly:true}));
await build({entryPoints:['scripts/runtime-harness.ts'],outfile:join(harness,'main.js'),bundle:true,platform:'node',format:'cjs',external:['obsidian'],define:{__EXPECTED_VAULT__:JSON.stringify(vault),__REPORT_PATH__:JSON.stringify(report),__SCENARIO__:JSON.stringify(scenario)}});
if(scenario==='theme'){
 const source=process.argv[3];if(!source)throw new Error('Supply locally downloaded public Theme assets directory');
 const dest=join(vault,'.obsidian/themes/Personal Glass');await mkdir(dest,{recursive:true});
 for(const name of ['theme.css','manifest.json'])await copyFile(resolve(source,name),join(dest,name));
}
await writeFile(join(vault,'.obsidian/appearance.json'),JSON.stringify({cssTheme:scenario==='theme'?'Personal Glass':'',theme:'moonstone'}));
await writeFile(join(vault,'.obsidian/app.json'),JSON.stringify({showInlineTitle:false,propertiesInDocument:'hidden'}));
// Keep Obsidian's own slash-command provider off so this runtime checks the Companion's document-only menu in isolation.
await writeFile(join(vault,'.obsidian/core-plugins.json'),JSON.stringify({'file-explorer':true,'command-palette':true,'slash-command':false}));
await writeFile(join(vault,'.obsidian/community-plugins.json'),JSON.stringify(['personal-glass','personal-glass-runtime-smoke']));
await writeFile(join(profile,'obsidian.json'),JSON.stringify({vaults:{a1b2c3d4e5f60123:{path:vault,ts:Date.now(),open:true}}}));
const run={scenario,home,vault,profile,report};await writeFile('.local/runtime-last.json',JSON.stringify(run,null,2));console.log(JSON.stringify(run,null,2));
