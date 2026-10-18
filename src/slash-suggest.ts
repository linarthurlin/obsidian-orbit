import { EditorSuggest, type App, type Editor, type EditorPosition, type EditorSuggestContext, type EditorSuggestTriggerInfo, type TFile } from 'obsidian';
import { TEMPLATES, createInsertion, type MarkdownTemplate } from './commands';

interface SlashItem {
  template: MarkdownTemplate;
  title: string;
  aliases: string;
  syntax: string;
}

const ALIASES: Record<string, string> = {
  'heading-1': '標題 標題一 一級標題 大標題 heading one h1 biaoti yiji biaotiyi',
  'heading-2': '標題 標題二 二級標題 heading two h2 biaotier erji',
  'heading-3': '標題 標題三 三級標題 heading three h3 biaotisan sanji',
  bullet: '清單 項目符號 無序清單 list bullet qingdan xiangmufuhao',
  todo: '待辦 任務 任務清單 checkbox task todo daiban renwu',
  quote: '引言 引用 區塊引用 blockquote yinyan yinyong',
  'callout-note': '提示 註記 備註 note info tishi beizhu',
  'callout-tip': '技巧 建議 tip jiqiao jianyi',
  'callout-warning': '警告 注意 warning caution jinggao zhuyi',
  'callout-example': '範例 example fanli',
  divider: '分隔線 水平線 hr horizontal rule fengexian',
  code: '程式碼 程式碼區塊 code fence chengshiyu kuai',
  math: '數學 公式 方程式 latex math gongshi shuxue',
  table: '表格 table biaoge',
};

const TITLES: Record<string, string> = {
  'heading-1': '標題一', 'heading-2': '標題二', 'heading-3': '標題三',
  bullet: '項目清單', todo: '待辦事項', quote: '引用',
  'callout-note': '備註 Callout', 'callout-tip': '技巧 Callout',
  'callout-warning': '警告 Callout', 'callout-example': '範例 Callout',
  divider: '分隔線', code: '程式碼區塊', math: '數學公式', table: '表格',
};

const ITEMS: SlashItem[] = TEMPLATES.map(template => ({
  template,
  title: TITLES[template.id] ?? template.name,
  aliases: ALIASES[template.id] ?? '',
  syntax: template.before.split('\n')[0].trim() || template.id,
}));

interface FenceCache {
  line: number;
  slash: number;
  lineCount: number;
  prefix: string;
  inFence: boolean;
}

/** A deliberately small command palette that inserts the plugin's portable Markdown templates. */
export class PersonalGlassSlashSuggest extends EditorSuggest<SlashItem> {
  private readonly fenceCache = new WeakMap<Editor, FenceCache>();

  constructor(app: App, private readonly isEnabled: () => boolean) {
    super(app);
    this.limit = 20;
  }

  onTrigger(cursor: EditorPosition, editor: Editor, file: TFile | null): EditorSuggestTriggerInfo | null {
    if (!file || !this.isEnabled()) return null;
    const line = editor.getLine(cursor.line).slice(0, cursor.ch);
    const match = /[\/／]([^\s\/／]*)$/u.exec(line);
    if (!match) {
      this.fenceCache.delete(editor);
      return null;
    }

    const slash = match.index;
    const beforeSlash = line.slice(0, slash);
    const previous = Array.from(beforeSlash).at(-1);
    if (previous && !/\s/u.test(previous) && !/\p{Script=Han}/u.test(previous)) return null;
    if (this.isInsideInlineCode(beforeSlash)) return null;

    const cached = this.fenceCache.get(editor);
    const lineCount = editor.lineCount();
    const inFence = cached && cached.line === cursor.line && cached.slash === slash
      && cached.lineCount === lineCount && cached.prefix === beforeSlash
      ? cached.inFence : this.isInsideFence(editor, cursor.line);
    this.fenceCache.set(editor, { line: cursor.line, slash, lineCount, prefix: beforeSlash, inFence });
    if (inFence) return null;

    return {
      start: { line: cursor.line, ch: slash },
      end: cursor,
      query: match[1],
    };
  }

  getSuggestions(context: EditorSuggestContext): SlashItem[] {
    const query = context.query.normalize('NFKC').toLocaleLowerCase().trim();
    if (!query) return ITEMS;
    return ITEMS.filter(item => `${item.title} ${item.template.name} ${item.aliases} ${item.syntax}`
      .normalize('NFKC').toLocaleLowerCase().includes(query));
  }

  renderSuggestion(item: SlashItem, element: HTMLElement): void {
    element.addClass('pg-slash-suggestion');
    element.createSpan({ cls: 'pg-slash-title', text: item.title });
    element.createSpan({ cls: 'pg-slash-syntax', text: item.syntax });
  }

  selectSuggestion(item: SlashItem): void {
    const context = this.context;
    if (!context) return;
    const { editor, start, end } = context;
    const startOffset = editor.posToOffset(start);
    const endOffset = editor.posToOffset(end);
    const source = editor.getValue();
    const insertion = createInsertion(item.template, '', source.slice(0, startOffset), source.slice(endOffset));
    editor.replaceRange(insertion.text, start, end);
    editor.setSelection(
      editor.offsetToPos(startOffset + insertion.selectionStart),
      editor.offsetToPos(startOffset + insertion.selectionEnd),
    );
  }

  private isInsideInlineCode(prefix: string): boolean {
    const runs = prefix.match(/(?<!\\)`+/g) ?? [];
    let delimiterLength = 0;
    for (const run of runs) {
      if (!delimiterLength) delimiterLength = run.length;
      else if (delimiterLength === run.length) delimiterLength = 0;
    }
    return delimiterLength > 0;
  }

  private isInsideFence(editor: Editor, lineNumber: number): boolean {
    let fence: { character: string; length: number } | null = null;
    for (let index = 0; index < lineNumber; index++) {
      const candidate = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(editor.getLine(index));
      if (!candidate) continue;
      const marker = candidate[1];
      const tail = candidate[2];
      if (!fence) {
        if (marker[0] === '`' && tail.includes('`')) continue;
        fence = { character: marker[0], length: marker.length };
      } else if (marker[0] === fence.character && marker.length >= fence.length && !tail.trim()) {
        fence = null;
      }
    }
    return fence !== null;
  }
}
