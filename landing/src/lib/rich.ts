/*
 * Разметка текстов. Пометка [[текст|вопрос]] — факт, который ещё нужно
 * уточнить у ЦКМ. В макете и в режиме разработки она подсвечивается,
 * в боевой сборке остаётся просто текст.
 */
const MARK = /\[\[([^|\]]*)\|([^\]]+)\]\]/g;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const showMarks = import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_MARKS === "1";

/** Строка → HTML с подсвеченными пометками. Остальной текст экранируется. */
export function rich(s: string | undefined | null): string {
  if (!s) return "";
  let out = "";
  let last = 0;
  for (const m of s.matchAll(MARK)) {
    out += esc(s.slice(last, m.index));
    const [, text, q] = m;
    out += showMarks
      ? `<span class="q-mark${text ? "" : " q-empty"}" tabindex="0" data-q="${esc(q)}">${esc(text || "?")}</span>`
      : esc(text);
    last = m.index! + m[0].length;
  }
  return out + esc(s.slice(last));
}

/** Строка без пометок — для атрибутов, заголовков страниц, метатегов. */
export const plain = (s: string | undefined | null) => (s ?? "").replace(MARK, "$1");
