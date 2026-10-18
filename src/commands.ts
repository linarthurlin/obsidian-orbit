export interface MarkdownTemplate { id: string; name: string; before: string; after: string; placeholder: string; placement?: 'inline' | 'block'; }
export const TEMPLATES: MarkdownTemplate[] = [
  { id: 'heading-1', name: 'Insert heading 1 / 標題一', before: '# ', after: '', placeholder: 'Heading' },
  { id: 'heading-2', name: 'Insert heading 2 / 標題二', before: '## ', after: '', placeholder: 'Heading' },
  { id: 'heading-3', name: 'Insert heading 3 / 標題三', before: '### ', after: '', placeholder: 'Heading' },
  { id: 'bullet', name: 'Insert bullet list / 清單', before: '- ', after: '', placeholder: 'Item' },
  { id: 'todo', name: 'Insert task / 待辦', before: '- [ ] ', after: '', placeholder: 'Task' },
  { id: 'quote', name: 'Insert quote / 引言', before: '> ', after: '', placeholder: 'Quote' },
  ...['note', 'tip', 'warning', 'example', 'question', 'success', 'danger'].map(type => ({
    id: `callout-${type}`, name: `Insert ${type} callout`,
    before: `> [!${type}]\n> `, after: '', placeholder: 'Content',
  })),
  { id: 'divider', name: 'Insert divider / 分隔線', before: '---', after: '', placeholder: '' },
  { id: 'code', name: 'Insert code block / 程式碼', before: '```text\n', after: '\n```', placeholder: 'Code' },
  { id: 'math', name: 'Insert block equation / 區塊公式', before: '$$\n', after: '\n$$', placeholder: 'A x = b' },
  { id: 'table', name: 'Insert table / 表格', before: '| Column | Value |\n| --- | --- |\n| ', after: ' |  |', placeholder: 'Item' },
];

/** Additional document-only blocks for the slash menu; these are not Obsidian commands. */
export const SLASH_TEMPLATES: MarkdownTemplate[] = [
  { id: 'blank-below', name: 'Add paragraph below / 下方新增段落', before: '', after: '', placeholder: '' },
  { id: 'paragraph', name: 'Insert text / 純文字', before: '', after: '', placeholder: 'Text' },
  { id: 'numbered-list', name: 'Insert numbered list / 編號清單', before: '1. ', after: '', placeholder: 'Item' },
  { id: 'link', name: 'Insert external link / 外部連結', before: '[', after: '](url)', placeholder: 'Link text', placement: 'inline' },
  { id: 'internal-link', name: 'Insert internal note link / 內部筆記連結', before: '[[', after: ']]', placeholder: 'Note name', placement: 'inline' },
  { id: 'math-inline', name: 'Insert inline equation / 行內公式', before: '$', after: '$', placeholder: 'x = y', placement: 'inline' },
  { id: 'bold', name: 'Insert bold text / 粗體', before: '**', after: '**', placeholder: 'Bold text', placement: 'inline' },
  { id: 'italic', name: 'Insert italic text / 斜體', before: '*', after: '*', placeholder: 'Italic text', placement: 'inline' },
  { id: 'strikethrough', name: 'Insert strikethrough / 刪除線', before: '~~', after: '~~', placeholder: 'Strikethrough', placement: 'inline' },
  { id: 'highlight', name: 'Insert highlight / 螢光標記', before: '==', after: '==', placeholder: 'Highlighted text', placement: 'inline' },
  { id: 'inline-code', name: 'Insert inline code / 行內程式碼', before: '`', after: '`', placeholder: 'code', placement: 'inline' },
  { id: 'comment-inline', name: 'Insert inline comment / 行內註解', before: '%%', after: '%%', placeholder: 'Comment', placement: 'inline' },
  { id: 'footnote', name: 'Insert footnote / 註腳', before: '', after: '', placeholder: 'Footnote text', placement: 'inline' },
  { id: 'date-today', name: 'Insert today / 今日日期', before: '', after: '', placeholder: '', placement: 'inline' },
  { id: 'emoji', name: 'Insert emoji / 表情符號', before: '✨', after: '', placeholder: '', placement: 'inline' },
  { id: 'image', name: 'Insert image / 圖片', before: '![', after: '](image-url)', placeholder: 'Alt text' },
  { id: 'mermaid', name: 'Insert Mermaid diagram / Mermaid 圖表', before: '```mermaid\nflowchart TD\n    A[', after: '] --> B[Note]\n```', placeholder: 'Idea' },
  { id: 'callout-fold', name: 'Insert foldable callout / 折疊提示框', before: '> [!note]-\n> ', after: '', placeholder: 'Content' },
  { id: 'embed-file', name: 'Embed vault file / 嵌入 Vault 檔案', before: '![[', after: ']]', placeholder: 'File name' },
  { id: 'embed-pdf', name: 'Embed PDF / 嵌入 PDF', before: '![[', after: ']]', placeholder: 'Document.pdf' },
  { id: 'embed-audio', name: 'Embed audio / 嵌入音訊', before: '![[', after: ']]', placeholder: 'Audio.mp3' },
  { id: 'embed-video', name: 'Embed video / 嵌入影片', before: '![[', after: ']]', placeholder: 'Video.mp4' },
  { id: 'embed-note', name: 'Embed note / 嵌入筆記', before: '![[', after: ']]', placeholder: 'Note name' },
  { id: 'comment-block', name: 'Insert hidden comment block / 區塊註解', before: '%%\n', after: '\n%%', placeholder: 'Comment' },
  { id: 'toc', name: 'Insert static table of contents / 靜態目錄', before: '', after: '', placeholder: '' },
];
export interface Insertion { text: string; selectionStart: number; selectionEnd: number; }
export function createInsertion(template: MarkdownTemplate, selected: string, before: string, after: string): Insertion {
  const prefix = before && !before.endsWith('\n') ? '\n' : '';
  const suffix = after && !after.startsWith('\n') ? '\n' : '';
  // Preserve every selected line inside a quote/callout/list instead of leaking outside it.
  const continuation = template.before.startsWith('>') ? '> '
    : template.id === 'bullet' ? '  ' : template.id === 'todo' ? '      ' : '';
  const content = (selected || template.placeholder).replace(/\n/g, `\n${continuation}`);
  const text = prefix + template.before + content + template.after + suffix;
  const selectionStart = prefix.length + template.before.length;
  return { text, selectionStart, selectionEnd: selectionStart + content.length };
}
