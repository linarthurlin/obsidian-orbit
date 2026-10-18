import {it,expect} from 'vitest';
import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {unzipSync} from 'fflate';
import postcss from 'postcss';
it('packages only the Companion plugin and keeps its existing install identity',async()=>{
  execFileSync(process.execPath,['scripts/package.mjs'],{cwd:process.cwd()});
  const pkg=JSON.parse(await readFile('package.json','utf8'));
  const bytes=await readFile('release/current/personal-glass-companion-'+pkg.version+'.zip');
  const files=unzipSync(bytes);
  expect(Object.keys(files).sort()).toEqual(['LICENSE','main.js','manifest.json','styles.css']);
  expect(JSON.parse(new TextDecoder().decode(files['manifest.json'])).id).toBe('personal-glass');
  expect((await readdir('release/current')).sort()).toEqual(['SHA256SUMS.txt','main.js','manifest.json','personal-glass-companion-'+pkg.version+'.zip','styles.css'].sort());
});
it('scopes fallback CSS to its own UI instead of styling other plugin documents',async()=>{
  const css=await readFile('src/navigator.css','utf8'), selectors:string[]=[];
  postcss.parse(css).walkRules(rule=>{selectors.push(rule.selector)});
  expect(selectors.every(selector=>selector.includes('.pg-'))).toBe(true);
  expect(css).not.toMatch(/\.nav-file-title|\.nn-file|\.pga-workbench/);
  expect(css).toContain('--pg-selection-background');
  expect(css).not.toContain('width: 3px');
});
