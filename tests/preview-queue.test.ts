import {it,expect} from 'vitest';
import {PreviewQueue} from '../src/preview-queue';
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
it('replaces stale queued work without starting overlapping reads', async () => {
  let release!: () => void;
  const started: number[] = [], applied: number[] = [];
  let active = 0, peak = 0;
  const queue = new PreviewQueue<number>(async (item, current) => {
    started.push(item); peak = Math.max(peak, ++active);
    if (item === 1) await new Promise<void>(resolve => { release = resolve; });
    --active; if (current()) applied.push(item);
  });
  queue.replace([1, 2]); queue.replace([3, 4]);
  expect(started).toEqual([1]); release(); await tick();
  expect(started).toEqual([1, 3, 4]); expect(applied).toEqual([3, 4]); expect(peak).toBe(1);
});
it('clear invalidates an in-flight result and drops pending reads on close', async () => {
  let release!: () => void;
  const applied: number[] = [], started: number[] = [];
  const queue = new PreviewQueue<number>(async (item, current) => {
    started.push(item); await new Promise<void>(resolve => { release = resolve; });
    if (current()) applied.push(item);
  });
  queue.replace([1, 2]); queue.clear(); release(); await tick();
  expect(started).toEqual([1]); expect(applied).toEqual([]);
});
it('continues after unreadable files and can be reused after draining', async () => {
  const applied: number[] = [];
  const queue = new PreviewQueue<number>(async item => { if (item === 1) throw new Error('deleted'); applied.push(item); });
  queue.replace([1, 2]); await tick(); queue.replace([3]); await tick();
  expect(applied).toEqual([2, 3]);
});
