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
    cursor: null as unknown,
    setCursor(pos: unknown) { this.cursor = pos; },
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
    expect(items).toHaveLength(19);
    expect(plugin.getSuggestions({ query: 'biaoge', start: {} as never, end: {} as never, editor: {} as never, file: {} as never }).map(item => item.title)).toEqual(['表格']);
    expect(plugin.getSuggestions({ query: '警告', start: {} as never, end: {} as never, editor: {} as never, file: {} as never }).map(item => item.title)).toEqual(['警告 Callout']);
    expect(plugin.getSuggestions({ query: 'warning', start: {} as never, end: {} as never, editor: {} as never, file: {} as never }).map(item => item.title)).toEqual(['警告 Callout']);
    expect(plugin.getSuggestions({ query: 'ordered', start: {} as never, end: {} as never, editor: {} as never, file: {} as never }).map(item => item.title)).toEqual(['編號清單']);
    expect(plugin.getSuggestions({ query: 'image', start: {} as never, end: {} as never, editor: {} as never, file: {} as never }).map(item => item.title)).toEqual(['圖片']);
    expect(plugin.getSuggestions({ query: 'missing', start: {} as never, end: {} as never, editor: {} as never, file: {} as never })).toEqual([]);
  });

  it('inserts portable Markdown into an empty block and selects its placeholder', () => {
    const plugin = suggest();
    const ed = editor('/h1');
    plugin.context = {
      start: { line: 0, ch: 0 }, end: { line: 0, ch: 3 }, editor: ed, file: {} as never,
      query: 'h1',
    } as never;
    const item = plugin.getSuggestions(plugin.context as never).find(value => value.template.id === 'heading-1')!;
    plugin.selectSuggestion(item);
    expect(ed.value).toBe('# Heading');
    expect(ed.value.slice(ed.posToOffset((ed.selection as any).from), ed.posToOffset((ed.selection as any).to))).toBe('Heading');
  });

  it('adds an empty Markdown paragraph below the current block and places the caret there', () => {
    const plugin = suggest();
    const ed = editor('Current block /below');
    plugin.context = {
      start: { line: 0, ch: 14 }, end: { line: 0, ch: 20 }, editor: ed, file: {} as never,
      query: 'below',
    } as never;
    const item = plugin.getSuggestions(plugin.context as never).find(value => value.template.id === 'blank-below')!;
    plugin.selectSuggestion(item);
    expect(ed.value).toBe('Current block \n\n');
    expect(ed.cursor).toEqual({ line: 1, ch: 0 });
  });

  it('inserts portable Markdown link syntax and selects the link label', () => {
    const plugin = suggest();
    const ed = editor('/link');
    plugin.context = {
      start: { line: 0, ch: 0 }, end: { line: 0, ch: 5 }, editor: ed, file: {} as never,
      query: 'link',
    } as never;
    const item = plugin.getSuggestions(plugin.context as never).find(value => value.template.id === 'link')!;
    plugin.selectSuggestion(item);
    expect(ed.value).toBe('[Link text](url)');
    expect(ed.value.slice(ed.posToOffset((ed.selection as any).from), ed.posToOffset((ed.selection as any).to))).toBe('Link text');
  });

  it('turns the current paragraph into a Markdown heading and preserves the text', () => {
    const plugin = suggest();
    const ed = editor('Existing paragraph /h1');
    plugin.context = {
      start: { line: 0, ch: 19 }, end: { line: 0, ch: 22 }, editor: ed, file: {} as never,
      query: 'h1',
    } as never;
    const item = plugin.getSuggestions(plugin.context as never).find(value => value.template.id === 'heading-1')!;
    plugin.selectSuggestion(item);
    expect(ed.value).toBe('# Existing paragraph');
    expect(ed.cursor).toEqual({ line: 0, ch: 20 });
  });

  it('transforms list and callout blocks without invoking commands', () => {
    const plugin = suggest();
    const ed = editor('- Keep this /todo');
    plugin.context = {
      start: { line: 0, ch: 12 }, end: { line: 0, ch: 17 }, editor: ed, file: {} as never,
      query: 'todo',
    } as never;
    const item = plugin.getSuggestions(plugin.context as never).find(value => value.template.id === 'todo')!;
    plugin.selectSuggestion(item);
    expect(ed.value).toBe('- [ ] Keep this');

    const calloutEditor = editor('Remember this /note');
    plugin.context = {
      start: { line: 0, ch: 14 }, end: { line: 0, ch: 19 }, editor: calloutEditor, file: {} as never,
      query: 'note',
    } as never;
    const callout = plugin.getSuggestions(plugin.context as never).find(value => value.template.id === 'callout-note')!;
    plugin.selectSuggestion(callout);
    expect(calloutEditor.value).toBe('> [!note]\n> Remember this');
  });

  it('keeps non-transform block actions as new Markdown blocks after the paragraph', () => {
    const plugin = suggest();
    const ed = editor('Keep this /code');
    plugin.context = {
      start: { line: 0, ch: 10 }, end: { line: 0, ch: 15 }, editor: ed, file: {} as never,
      query: 'code',
    } as never;
    const item = plugin.getSuggestions(plugin.context as never).find(value => value.template.id === 'code')!;
    plugin.selectSuggestion(item);
    expect(ed.value).toBe('Keep this \n```text\nCode\n```');
  });
});
