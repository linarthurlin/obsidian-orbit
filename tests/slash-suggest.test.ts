import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('obsidian', () => ({
  EditorSuggest: class {
    context: unknown = null;
    limit = 0;
    constructor(_app: unknown) {}
  },
}));

import { PersonalGlassSlashSuggest } from '../src/slash-suggest';

function editor(value: string) {
  return {
    value,
    getLine(line: number) { return this.value.split('\n')[line] ?? ''; },
    lineCount() { return this.value.split('\n').length; },
    getValue() { return this.value; },
    posToOffset(pos: { line: number; ch: number }) {
      return this.value.split('\n').slice(0, pos.line).reduce((sum, line) => sum + line.length + 1, 0) + pos.ch;
    },
    offsetToPos(offset: number) {
      const lines = this.value.slice(0, offset).split('\n');
      return { line: lines.length - 1, ch: lines.at(-1)!.length };
    },
    replaceRange(text: string, from: { line: number; ch: number }, to: { line: number; ch: number }) {
      const start = this.posToOffset(from), end = this.posToOffset(to);
      this.value = this.value.slice(0, start) + text + this.value.slice(end);
    },
    selection: null as unknown,
    setSelection(from: unknown, to: unknown) { this.selection = { from, to }; },
  };
}

function suggest() { return new PersonalGlassSlashSuggest({} as never, () => true); }
function trigger(value: string, cursor = value.length) {
  const ed = editor(value);
  const before = value.slice(0, cursor);
  const line = before.split('\n').length - 1;
  const ch = before.length - (before.lastIndexOf('\n') + 1);
  return { ed, result: suggest().onTrigger({ line, ch }, ed as never, {} as never) };
}

afterEach(() => vi.clearAllMocks());

describe('Traditional Chinese slash menu', () => {
  it('triggers at line start, after whitespace and after CJK with either slash', () => {
    expect(trigger('/').result?.query).toBe('');
    expect(trigger('paragraph /todo').result?.query).toBe('todo');
    expect(trigger('正文／biaoti').result?.query).toBe('biaoti');
  });

  it('does not trigger inside words, URLs, inline code or fenced code', () => {
    expect(trigger('word/todo').result).toBeNull();
    expect(trigger('https:/todo').result).toBeNull();
    expect(trigger('code `/todo').result).toBeNull();
    expect(trigger('```md\n/todo\n```', '```md\n/todo'.length).result).toBeNull();
    expect(trigger('~~~\n／h1\n~~~', '~~~\n／h1'.length).result).toBeNull();
  });

  it('searches English, Traditional Chinese and pinyin aliases', () => {
    const plugin = suggest();
    const items = plugin.getSuggestions({ query: '', start: { line: 0, ch: 0 }, end: { line: 0, ch: 1 }, editor: {} as never, file: {} as never });
    expect(items).toHaveLength(14);
    expect(plugin.getSuggestions({ query: 'biaoge', start: {} as never, end: {} as never, editor: {} as never, file: {} as never }).map(item => item.title)).toEqual(['表格']);
    expect(plugin.getSuggestions({ query: '警告', start: {} as never, end: {} as never, editor: {} as never, file: {} as never }).map(item => item.title)).toEqual(['警告 Callout']);
    expect(plugin.getSuggestions({ query: 'warning', start: {} as never, end: {} as never, editor: {} as never, file: {} as never }).map(item => item.title)).toEqual(['警告 Callout']);
    expect(plugin.getSuggestions({ query: 'missing', start: {} as never, end: {} as never, editor: {} as never, file: {} as never })).toEqual([]);
  });

  it('replaces the trigger with portable Markdown and selects its placeholder', () => {
    const plugin = suggest();
    const ed = editor('正文/h1');
    plugin.context = {
      start: { line: 0, ch: 2 }, end: { line: 0, ch: 5 }, editor: ed, file: {} as never,
      query: 'h1',
    } as never;
    const item = plugin.getSuggestions(plugin.context as never).find(value => value.template.id === 'heading-1')!;
    plugin.selectSuggestion(item);
    expect(ed.value).toBe('正文\n# Heading');
    expect(ed.value.slice(ed.posToOffset((ed.selection as any).from), ed.posToOffset((ed.selection as any).to))).toBe('Heading');
  });
});
