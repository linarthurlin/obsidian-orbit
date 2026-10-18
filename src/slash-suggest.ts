import { EditorSuggest, type App, type Editor, type EditorPosition, type EditorSuggestContext, type EditorSuggestTriggerInfo, type TFile } from 'obsidian';
import { SLASH_TEMPLATES, TEMPLATES, createInsertion, type MarkdownTemplate } from './commands';

interface SlashItem {
  template: MarkdownTemplate;
  title: string;
  aliases: string;
  syntax: string;
  category: string;
  description: string;
}

const ALIASES: Record<string, string> = {
  'blank-below': '新增 新段落 下方 空白段落 paragraph below new line blank line xinzeng duanluo',
  paragraph: '文字 段落 純文字 text paragraph wenzi duanluo',
  'heading-1': '標題 標題一 一級標題 大標題 heading one h1 biaoti yiji biaotiyi',
  'heading-2': '標題 標題二 二級標題 heading two h2 biaotier erji',
  'heading-3': '標題 標題三 三級標題 heading three h3 biaotisan sanji',
  bullet: '清單 項目符號 無序清單 list bullet qingdan xiangmufuhao',
  'numbered-list': '編號 清單 有序清單 numbered ordered list bianhao youxu',
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
  link: '連結 超連結 hyperlink link lianjie',
  image: '圖片 圖像 image embed picture tupian',
};

const TITLES: Record<string, string> = {
  'blank-below': '新增空白段落', paragraph: '純文字', 'heading-1': '標題一', 'heading-2': '標題二', 'heading-3': '標題三',
  bullet: '項目清單', 'numbered-list': '編號清單', todo: '待辦事項', quote: '引用',
  'callout-note': '備註 Callout', 'callout-tip': '技巧 Callout',
  'callout-warning': '警告 Callout', 'callout-example': '範例 Callout',
  divider: '分隔線', code: '程式碼區塊', math: '數學公式', table: '表格', link: '連結', image: '圖片',
};

const METADATA: Record<string, Pick<SlashItem, 'category' | 'description'>> = {
  'blank-below': { category: '文字', description: '在目前區塊下方新增空白段落' },
  paragraph: { category: '文字', description: '純 Markdown 段落' },
  'heading-1': { category: '文字', description: '一級標題' },
  'heading-2': { category: '文字', description: '二級標題' },
  'heading-3': { category: '文字', description: '三級標題' },
  bullet: { category: '清單', description: '無序項目清單' },
  'numbered-list': { category: '清單', description: '有序項目清單' },
  todo: { category: '清單', description: '可勾選的待辦項目' },
  quote: { category: '區塊', description: '引用文字' },
  'callout-note': { category: '區塊', description: '備註提示區塊' },
  'callout-tip': { category: '區塊', description: '技巧提示區塊' },
  'callout-warning': { category: '區塊', description: '警告提示區塊' },
  'callout-example': { category: '區塊', description: '範例提示區塊' },
  divider: { category: '區塊', description: '水平分隔線' },
  code: { category: '媒體與程式碼', description: '圍欄式程式碼區塊' },
  math: { category: '媒體與程式碼', description: '區塊數學公式' },
  table: { category: '媒體與程式碼', description: 'Markdown 表格' },
  link: { category: '媒體與程式碼', description: 'Markdown 連結語法' },
  image: { category: '媒體與程式碼', description: 'Markdown 圖片語法' },
};

const ITEMS: SlashItem[] = [...SLASH_TEMPLATES, ...TEMPLATES].map(template => ({
  template,
  title: TITLES[template.id] ?? template.name,
  aliases: ALIASES[template.id] ?? '',
  syntax: template.id === 'blank-below' ? '＋'
    : template.before.split('\n')[0].trim() || (template.id === 'paragraph' ? 'Text' : template.id),
  ...(METADATA[template.id] ?? { category: '區塊', description: '插入 Markdown 區塊' }),
}));

const TRANSFORM_PREFIXES: Record<string, string> = {
  paragraph: '', 'heading-1': '# ', 'heading-2': '## ', 'heading-3': '### ',
  bullet: '- ', 'numbered-list': '1. ', todo: '- [ ] ', quote: '> ',
  'callout-note': '> [!note]\n> ', 'callout-tip': '> [!tip]\n> ',
  'callout-warning': '> [!warning]\n> ', 'callout-example': '> [!example]\n> ',
};

interface FenceCache {
  line: number;
  slash: number;
  lineCount: number;
  prefix: string;
  inFence: boolean;
}

/** A document-only Markdown menu. It never invokes Obsidian or other plugin commands. */
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
    return ITEMS.filter(item => `${item.title} ${item.template.name} ${item.aliases} ${item.syntax} ${item.category} ${item.description}`
      .normalize('NFKC').toLocaleLowerCase().includes(query));
  }

  renderSuggestion(item: SlashItem, element: HTMLElement): void {
    const transform = this.isTransformContext(item, this.context);
    element.addClass('pg-slash-suggestion');
    if (transform) element.addClass('pg-slash-transform');
    element.setAttribute('aria-label', `${item.title}，${transform ? '轉換目前段落' : '插入 Markdown'}：${item.description}；${item.syntax}`);

    const copy = element.createDiv({ cls: 'pg-slash-copy' });
    copy.createSpan({ cls: 'pg-slash-title', text: item.title });
    copy.createSpan({ cls: 'pg-slash-description', text: transform ? `轉換目前段落 · ${item.description}` : item.description });
    const meta = element.createDiv({ cls: 'pg-slash-meta' });
    meta.createSpan({ cls: 'pg-slash-category', text: item.category });
    meta.createSpan({ cls: 'pg-slash-syntax', text: item.syntax });
  }

  selectSuggestion(item: SlashItem): void {
    const context = this.context;
    if (!context) return;
    const { editor, start, end } = context;
    const lineText = editor.getLine(start.line);
    const beforeSlash = lineText.slice(0, start.ch);

    if (item.template.id === 'blank-below') {
      const startOffset = editor.posToOffset(start);
      const separator = beforeSlash.trim() ? '\n\n' : '\n';
      editor.replaceRange(separator, start, end);
      editor.setCursor(editor.offsetToPos(startOffset + 1));
      return;
    }

    if (this.isTransformContext(item, context)) {
      this.transformCurrentLine(editor, start, end, item, lineText, beforeSlash);
      return;
    }

    const startOffset = editor.posToOffset(start);
    const endOffset = editor.posToOffset(end);
    const source = editor.getValue();
    const before = beforeSlash.trim() ? source.slice(0, startOffset) : '';
    const after = source.slice(endOffset);
    const insertion = createInsertion(item.template, '', before, after);
    editor.replaceRange(insertion.text, start, end);
    editor.setSelection(
      editor.offsetToPos(startOffset + insertion.selectionStart),
      editor.offsetToPos(startOffset + insertion.selectionEnd),
    );
  }

  private isTransformContext(item: SlashItem, context: EditorSuggestContext | null): boolean {
    if (!context || !(item.template.id in TRANSFORM_PREFIXES)) return false;
    return context.editor.getLine(context.start.line).slice(0, context.start.ch).trim().length > 0;
  }

  private transformCurrentLine(editor: Editor, start: EditorPosition, end: EditorPosition, item: SlashItem, lineText: string, beforeSlash: string): void {
    const indentation = lineText.match(/^\s*/u)?.[0] ?? '';
    const content = stripBlockPrefix(beforeSlash.slice(indentation.length) + lineText.slice(end.ch)).trimEnd();
    const prefix = TRANSFORM_PREFIXES[item.template.id] ?? '';
    const transformed = `${indentation}${prefix}${content}`;
    const lineStart = { line: start.line, ch: 0 };
    const lineEnd = { line: end.line, ch: lineText.length };
    const lineStartOffset = editor.posToOffset(lineStart);
    editor.replaceRange(transformed, lineStart, lineEnd);
    editor.setCursor(editor.offsetToPos(lineStartOffset + transformed.length));
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

function stripBlockPrefix(value: string): string {
  let result = value;
  for (let index = 0; index < 3; index++) {
    const callout = /^>\s*\[![\w-]+(?:[+-])?\]\s*/iu;
    const marker = /^(?:#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+|>\s?)/u;
    const next = result.replace(callout, '').replace(marker, '');
    if (next === result) break;
    result = next;
  }
  return result;
}
