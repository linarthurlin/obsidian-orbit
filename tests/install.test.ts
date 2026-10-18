import { it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { install } from '../scripts/install.mjs';
it('installs only this plugin three artifacts and preserves notes, config and plugin data', async () => {
  const vault = await mkdtemp(join(tmpdir(), 'personal-glass-'));
  await mkdir(join(vault, '.obsidian/plugins/personal-glass'), { recursive: true });
  const preserved = ['note.md', '.obsidian/appearance.json', '.obsidian/community-plugins.json', '.obsidian/plugins/personal-glass/data.json', '.obsidian/themes/Personal Glass/theme.css', '.obsidian/plugins/knowledge-agent/main.js'];
  for (const path of preserved) { await mkdir(dirname(join(vault,path)),{recursive:true}); await writeFile(join(vault,path),'UNCHANGED'); }
  const result = await install(vault);
  expect(result.copied).toHaveLength(3);
  expect(result.activated).toBe(false);
  expect(result.copied.every(path => path.split(String.fromCharCode(92)).join("/").startsWith(".obsidian/plugins/personal-glass/"))).toBe(true);
  for (const path of preserved) expect(await readFile(join(vault, path), 'utf8')).toBe('UNCHANGED');
  await install(vault);
  for (const path of preserved) expect(await readFile(join(vault, path), 'utf8')).toBe('UNCHANGED');
});
it('rejects directory junctions before writing outside the selected vault', async () => {
  const vault = await mkdtemp(join(tmpdir(), 'personal-glass-'));
  const outside = await mkdtemp(join(tmpdir(), 'personal-glass-outside-'));
  await symlink(outside, join(vault, '.obsidian'), process.platform === 'win32' ? 'junction' : 'dir');
  await expect(install(vault)).rejects.toThrow('Unsafe installation directory');
});
