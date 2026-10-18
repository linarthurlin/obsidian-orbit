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
  'callout-question': '問題 提問 question faq wenti tiwen',
  'callout-success': '完成 成功 success check done wancheng',
  'callout-danger': '危險 錯誤 danger failure error weixian cuowu',
  'callout-fold': '折疊 提示框 foldable collapsible toggle zhedie',
  divider: '分隔線 水平線 hr horizontal rule fengexian',
  code: '程式碼 程式碼區塊 code fence chengshiyu kuai',
  math: '數學 公式 方程式 latex math gongshi shuxue',
  mermaid: '圖表 流程圖 關係圖 diagram chart mermaid liuchengtu',
  'math-inline': '行內公式 inline equation inline math latex hangnei gongshi',
  bold: '粗體 bold text strong zhongti',
  italic: '斜體 italic text xieti',
  strikethrough: '刪除線 strike strikethrough xianshu',
  highlight: '螢光 標記 高亮 highlight mark yingguang gaoliang',
  'inline-code': '行內程式碼 inline code inline-code hangneichengshiyu',
  'internal-link': '內部連結 筆記連結 wikilink internal note link neibulianjie biji',
  footnote: '註腳 腳註 footnote reference note zhujiao jiaozhu',
  'comment-inline': '行內註解 隱藏註解 comment inline',
  'comment-block': '區塊註解 隱藏註解 comment block',
  'date-today': '今日日期 date today timestamp jintian riqi',
  emoji: '表情符號 emoji symbol biaoqing',
  'embed-file': '嵌入 檔案 附件 embed file attachment qianru fujian',
  'embed-pdf': 'PDF 文件 嵌入 pdf embed document',
  'embed-audio': '音訊 聲音 嵌入 audio sound embed',
  'embed-video': '影片 視頻 嵌入 video embed',
  'embed-note': '嵌入筆記 文件 embed note transclusion',
  toc: '目錄 內容索引 table of contents toc mulu',
  table: '表格 table biaoge',
  link: '連結 超連結 hyperlink link lianjie',
  image: '圖片 圖像 image embed picture tupian',
};

const TITLES: Record<string, string> = {
  'blank-below': '新增空白段落', paragraph: '純文字', 'heading-1': '標題一', 'heading-2': '標題二', 'heading-3': '標題三',
  bullet: '項目清單', 'numbered-list': '編號清單', todo: '待辦事項', quote: '引用',
  'callout-note': '備註 Callout', 'callout-tip': '技巧 Callout',
  'callout-warning': '警告 Callout', 'callout-example': '範例 Callout',
  'callout-question': '問題 Callout', 'callout-success': '完成 Callout', 'callout-danger': '危險 Callout',
  'callout-fold': '折疊 Callout',
  divider: '分隔線', code: '程式碼區塊', math: '區塊公式', table: '表格', link: '連結', image: '圖片',
  mermaid: 'Mermaid 圖表', 'math-inline': '行內公式', bold: '粗體', italic: '斜體',
  strikethrough: '刪除線', highlight: '螢光標記', 'inline-code': '行內程式碼',
  'internal-link': '內部筆記連結', footnote: '註腳', 'comment-inline': '行內註解',
  'comment-block': '區塊註解', 'date-today': '今日日期', emoji: '表情符號',
  'embed-file': '嵌入 Vault 檔案', 'embed-pdf': '嵌入 PDF', 'embed-audio': '嵌入音訊',
  'embed-video': '嵌入影片', 'embed-note': '嵌入筆記', toc: '靜態目錄',
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
  'callout-question': { category: '區塊', description: '問題提示區塊' },
  'callout-success': { category: '區塊', description: '成功或完成提示區塊' },
  'callout-danger': { category: '區塊', description: '錯誤或危險提示區塊' },
  'callout-fold': { category: '區塊', description: '預設收合的 Obsidian Callout' },
  divider: { category: '區塊', description: '水平分隔線' },
  code: { category: '媒體與程式碼', description: '圍欄式程式碼區塊' },
  math: { category: '媒體與程式碼', description: '區塊數學公式' },
  mermaid: { category: '圖表', description: '插入可編輯的 Mermaid 圖表原始碼' },
  'math-inline': { category: '行內格式', description: '插入 LaTeX 行內公式' },
  bold: { category: '行內格式', description: '粗體文字範本' },
  italic: { category: '行內格式', description: '斜體文字範本' },
  strikethrough: { category: '行內格式', description: '刪除線文字範本' },
  highlight: { category: '行內格式', description: 'Obsidian 螢光標記語法' },
  'inline-code': { category: '行內格式', description: '行內程式碼範本' },
  'comment-inline': { category: '行內格式', description: '閱讀檢視中隱藏的 Obsidian 註解' },
  'comment-block': { category: '區塊', description: '閱讀檢視中隱藏的多行 Obsidian 註解' },
  'internal-link': { category: '連結', description: '連到 Vault 內筆記的 Wikilink' },
  footnote: { category: '行內內容', description: '插入引用並在文件底部建立註腳' },
  'date-today': { category: '行內內容', description: '以 YYYY-MM-DD 插入本機日期' },
  emoji: { category: '行內內容', description: '插入可直接編輯的 Emoji 字元' },
  'embed-file': { category: '媒體與程式碼', description: 'Obsidian 內部檔案嵌入語法' },
  'embed-pdf': { category: '媒體與程式碼', description: 'Obsidian PDF 嵌入語法' },
  'embed-audio': { category: '媒體與程式碼', description: 'Obsidian 音訊嵌入語法' },
  'embed-video': { category: '媒體與程式碼', description: 'Obsidian 影片嵌入語法' },
  'embed-note': { category: '媒體與程式碼', description: '在目前筆記嵌入另一則筆記' },
  toc: { category: '文件導覽', description: '依目前標題產生靜態 Markdown 目錄' },
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

const POPULAR_IDS = [
  'blank-below', 'paragraph', 'heading-1', 'heading-2', 'heading-3', 'bullet', 'numbered-list', 'todo',
  'quote', 'callout-note', 'callout-warning', 'divider', 'code', 'math', 'math-inline', 'table', 'link', 'internal-link', 'image', 'mermaid',
];

function tableSizeItem(columns: number, rows: number): SlashItem {
  const headers = Array.from({ length: columns }, (_, index) => 'Column ' + (index + 1)).join(' | ');
  const divider = Array.from({ length: columns }, () => '---').join(' | ');
  const emptyRow = '| ' + Array.from({ length: columns }, () => '').join(' | ') + ' |';
  const before = '| ' + headers + ' |\n| ' + divider + ' |\n| ';
  const firstRowRest = ' | ' + Array.from({ length: columns - 1 }, () => '').join(' | ') + ' |';
  const remainingRows = Array.from({ length: rows - 2 }, () => emptyRow).join('\n');
  const template: MarkdownTemplate = {
    id: 'table-size-' + columns + 'x' + rows,
    name: 'Insert ' + columns + ' × ' + rows + ' Markdown table',
    before,
    after: firstRowRest + (remainingRows ? '\n' + remainingRows : ''),
    placeholder: 'Cell',
  };
  return { template, title: '表格 ' + columns + ' × ' + rows, aliases: 'table ' + columns + 'x' + rows + ' 表格 ' + columns + 'x' + rows,
    syntax: columns + ' 欄 × ' + rows + ' 列', category: '表格', description: '插入指定尺寸的 Markdown 表格，欄位包含標題列' };
}

const TRANSFORM_PREFIXES: Record<string, string> = {
  paragraph: '', 'heading-1': '# ', 'heading-2': '## ', 'heading-3': '### ',
  bullet: '- ', 'numbered-list': '1. ', todo: '- [ ] ', quote: '> ',
  'callout-note': '> [!note]\n> ', 'callout-tip': '> [!tip]\n> ',
  'callout-warning': '> [!warning]\n> ', 'callout-example': '> [!example]\n> ',
  'callout-question': '> [!question]\n> ', 'callout-success': '> [!success]\n> ',
  'callout-danger': '> [!danger]\n> ', 'callout-fold': '> [!note]-\n> ',
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
    const available = ITEMS;
    if (!query) return POPULAR_IDS.map(id => available.find(item => item.template.id === id)).filter((item): item is SlashItem => Boolean(item));

    const sizeQuery = query.startsWith('table') ? query.slice(5) : query.startsWith('表格') ? query.slice(2) : query;
    const dimensions = sizeQuery.split(/[x×]/u);
    const columns = Number(dimensions[0]);
    const rows = Number(dimensions[1]);
    if (dimensions.length === 2 && String(columns) === dimensions[0] && String(rows) === dimensions[1]
      && columns >= 1 && columns <= 10 && rows >= 2 && rows <= 10) return [tableSizeItem(columns, rows)];

    const matches = available.filter(item => `${item.title} ${item.template.id} ${item.template.id.replace(/-/gu, ' ')} ${item.template.name} ${item.aliases} ${item.syntax} ${item.category} ${item.description}`
      .normalize('NFKC').toLocaleLowerCase().includes(query));
    if (matches.some(item => item.template.id === 'toc') && extractHeadings(context.editor.getValue()).length === 0) {
      return matches.filter(item => item.template.id !== 'toc');
    }
    return matches;
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

    if (item.template.id === 'date-today') {
      const value = new Intl.DateTimeFormat('sv-SE').format(new Date());
      this.insertInlineText(editor, start, end, value, value.length);
      return;
    }
    if (item.template.id === 'footnote') {
      this.insertFootnoteSafely(editor, start, end);
      return;
    }
    if (item.template.id === 'toc') {
      this.insertTableOfContentsSafely(editor, start, end);
      return;
    }
    if (item.template.placement === 'inline') {
      this.insertInlineTemplate(editor, start, end, item.template);
      return;
    }

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

  private insertInlineTemplate(editor: Editor, start: EditorPosition, end: EditorPosition, template: MarkdownTemplate): void {
    const startOffset = editor.posToOffset(start);
    const value = template.before + template.placeholder + template.after;
    editor.replaceRange(value, start, end);
    const selectionStart = startOffset + template.before.length;
    editor.setSelection(editor.offsetToPos(selectionStart), editor.offsetToPos(selectionStart + template.placeholder.length));
  }

  private insertInlineText(editor: Editor, start: EditorPosition, end: EditorPosition, value: string, cursorOffset: number): void {
    const startOffset = editor.posToOffset(start);
    editor.replaceRange(value, start, end);
    const cursor = editor.offsetToPos(startOffset + cursorOffset);
    editor.setCursor(cursor);
  }

  private insertFootnoteSafely(editor: Editor, start: EditorPosition, end: EditorPosition): void {
    const source = editor.getValue();
    const startOffset = editor.posToOffset(start);
    const endOffset = editor.posToOffset(end);
    let index = 1;
    while (source.includes('[^footnote-' + index + ']') || source.includes('[^footnote-' + index + ']:')) index++;
    const id = 'footnote-' + index;
    const reference = '[^' + id + ']';
    const existingTail = source.slice(endOffset);
    const updated = source.slice(0, startOffset) + reference + existingTail;
    const newline = String.fromCharCode(10);
    const separator = updated.endsWith(newline + newline) ? '' : updated.endsWith(newline) ? newline : newline + newline;
    const definition = '[^' + id + ']: Footnote text';
    editor.replaceRange(reference + existingTail + separator + definition, start, editor.offsetToPos(source.length));
    const selectionStart = startOffset + reference.length + existingTail.length + separator.length + definition.indexOf('Footnote text');
    editor.setSelection(editor.offsetToPos(selectionStart), editor.offsetToPos(selectionStart + 'Footnote text'.length));
  }

  private insertTableOfContentsSafely(editor: Editor, start: EditorPosition, end: EditorPosition): void {
    const source = editor.getValue();
    const newline = String.fromCharCode(10);
    const entries = extractHeadings(source).map(heading =>
      '  '.repeat(heading.level - 1) + '- [[#' + heading.title.split('|').join(String.fromCharCode(92) + '|') + ']]');
    const contents = ['## Contents', '', ...entries].join(newline);
    const startOffset = editor.posToOffset(start);
    const endOffset = editor.posToOffset(end);
    const before = source.slice(0, startOffset);
    const after = source.slice(endOffset);
    const insertion = createInsertion({ id: 'toc-generated', name: 'Static table of contents', before: contents, after: '', placeholder: '' }, '', before, after);
    editor.replaceRange(insertion.text, start, end);
    editor.setCursor(editor.offsetToPos(startOffset + insertion.text.length));
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

interface HeadingEntry { level: number; title: string; }

function extractHeadings(source: string): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  let fenceCharacter = '';
  let fenceLength = 0;
  for (const line of source.split(String.fromCharCode(10))) {
    const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/u.exec(line);
    if (fence) {
      const marker = fence[1];
      const tail = fence[2];
      if (!fenceCharacter) {
        if (marker[0] === '`' && tail.includes('`')) continue;
        fenceCharacter = marker[0];
        fenceLength = marker.length;
      } else if (marker[0] === fenceCharacter && marker.length >= fenceLength && !tail.trim()) {
        fenceCharacter = '';
        fenceLength = 0;
      }
      continue;
    }
    if (fenceCharacter) continue;
    const match = /^ {0,3}(#{1,6})[ \t]+(.+?)\s*$/u.exec(line);
    if (!match) continue;
    const level = match[1].length;
    let title = match[2].replace(/[ \t]+#+[ \t]*$/u, '').trimEnd();
    if (title) headings.push({ level, title });
  }
  return headings;
}
