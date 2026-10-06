/*
 * Логика стенда /playground: выбор вариантов, комментарии, вопросы к ЦКМ.
 * Всё хранится в localStorage браузера; обмен — через экспорт и импорт JSON.
 */
interface Config {
  blocks: { id: string; label: string; variants: [string, string][]; copy?: boolean }[];
  scroll: [string, string][];
  defaults: Record<string, string>;
  course: string;
  country: string;
}
interface Comment {
  id: string;
  block: string;
  variant: string;
  course: string;
  country: string;
  author: string;
  text: string;
  ts: number;
}

const LS_SEL = "ccm-pg-selection";
const LS_COMM = "ccm-pg-comments";
const LS_AUTHOR = "ccm-pg-author";
const LS_UI = "ccm-pg-ui";
const LS_SCROLL_DEFAULT = "ccm-pg-fullpage-default";

const get = <T>(k: string, d: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
};
const set = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const $ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const $$ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

export function initPlayground() {
  const cfg = JSON.parse($("#pg-config").textContent!) as Config;
  // Сохранённый выбор мог ссылаться на варианты, которых уже нет, — такие берём из DEFAULTS
  const saved = get<Record<string, string>>(LS_SEL, {});
  if (!get(LS_SCROLL_DEFAULT, false)) {
    if (saved.scroll === "strict") saved.scroll = cfg.defaults.scroll;
    set(LS_SCROLL_DEFAULT, true);
  }
  const known = (k: string, v: string) => k.endsWith(".copy") || (k === "scroll" && cfg.scroll.some(([id]) => id === v)) || cfg.blocks.find((b) => b.id === k)?.variants.some(([id]) => id === v);
  let sel: Record<string, string> = { ...cfg.defaults, ...Object.fromEntries(Object.entries(saved).filter(([k, v]) => known(k, v))) };
  let comments: Comment[] = get(LS_COMM, []);
  const ui = get(LS_UI, { bars: true, marks: true, collapsed: false });
  let drawer: null | "comments" | "questions" = null;
  let target: { block: string; variant: string } | null = null;

  const variantKey = (block: string) => {
    const b = cfg.blocks.find((x) => x.id === block)!;
    return b.copy ? `${sel[block]}/${sel[block + ".copy"] ?? "a"}` : sel[block];
  };
  const labelOf = (block: string, key: string) => {
    const b = cfg.blocks.find((x) => x.id === block);
    if (!b) return key;
    const [v, copy] = key.split("/");
    const l = b.variants.find((x) => x[0] === v)?.[1] ?? v;
    return copy ? `${l} · текст ${copy === "a" ? "A" : "Б"}` : l;
  };

  function toast(msg: string) {
    const t = $("[data-pg-toast]");
    t.textContent = msg;
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 2000);
  }

  function apply() {
    for (const b of cfg.blocks) {
      const root = $(`[data-pg-block="${b.id}"]`);
      const v = sel[b.id];
      const copy = b.copy ? sel[b.id + ".copy"] ?? "a" : "";
      $$("[data-pg-variant]", root).forEach((el) => {
        const on = el.dataset.pgVariant === v && el.dataset.pgCopyv === copy;
        el.className = on ? "contents" : "hidden";
      });
      $$("[data-pg-pick]", root).forEach((btn) => btn.toggleAttribute("data-on", btn.dataset.pgPick === v));
      $$("[data-pg-copy]", root).forEach((btn) => btn.toggleAttribute("data-on", btn.dataset.pgCopy === copy));
      const n = comments.filter((c) => c.block === b.id && c.variant === variantKey(b.id)).length;
      const cb = $("[data-pg-comment]", root);
      cb.toggleAttribute("data-has", n > 0);
      $("[data-pg-count]", cb).textContent = n ? String(n) : "";
    }
    document.documentElement.dataset.snap = sel.scroll;
    $$("[data-pg-scroll]").forEach((btn) => btn.toggleAttribute("data-on", btn.dataset.pgScroll === sel.scroll));
    $$("[data-pg-bar]").forEach((b) => (b.style.display = ui.bars ? "" : "none"));
    document.documentElement.classList.toggle("hide-marks", !ui.marks);
    $("[data-pg-body]").style.display = ui.collapsed ? "none" : "";
    $("[data-pg-collapse]").textContent = ui.collapsed ? "развернуть" : "свернуть";
    $("[data-pg-qn]").textContent = String(questions().length);
    $("[data-pg-cn]").textContent = String(comments.length);
    set(LS_SEL, sel);
    set(LS_UI, ui);
    renderDrawer();
    document.dispatchEvent(new Event("ccm:rendered"));
  }

  function questions() {
    const map = new Map<string, string>();
    $$(".q-mark").forEach((el) => {
      const q = el.dataset.q!;
      if (q !== "?" && !map.has(q)) map.set(q, el.classList.contains("q-empty") ? "" : el.textContent ?? "");
    });
    return [...map.entries()];
  }

  function renderDrawer() {
    document.dispatchEvent(new CustomEvent("ccm:overlay", { detail: { source: "playground", open: drawer !== null } }));
    const d = $("[data-pg-drawer]");
    if (!drawer) {
      d.classList.add("hidden");
      d.classList.remove("flex");
      return;
    }
    d.classList.remove("hidden");
    d.classList.add("flex");
    const tabs = `<div class="flex gap-1 p-3">
      <button data-tab="comments" class="flex-1 rounded-xl px-3 py-2 font-semibold ${drawer === "comments" ? "bg-[#1c2030] text-white" : "bg-soft"}">Комментарии</button>
      <button data-tab="questions" class="flex-1 rounded-xl px-3 py-2 font-semibold ${drawer === "questions" ? "bg-[#1c2030] text-white" : "bg-soft"}">Вопросы к ЦКМ</button>
      <button data-tab="close" class="rounded-xl bg-soft px-3">✕</button></div>`;
    if (drawer === "questions") {
      const qs = questions();
      d.innerHTML = `${tabs}<div class="flex-1 overflow-auto px-4 pb-4">
        <p class="mb-3 text-[13px] text-muted-foreground">Всё, что подсвечено жёлтым: факты, которые нельзя выдумывать. Список собирается со всех вариантов блоков этой страницы.</p>
        <ol class="grid gap-2">${qs.map(([q, a], i) => `<li class="rounded-xl bg-[#fffbea] px-3 py-2"><b class="text-[#5a4300]">${i + 1}.</b> ${esc(q)}${a ? `<span class="block text-[12px] text-muted-foreground">Сейчас в макете: «${esc(a)}»</span>` : ""}</li>`).join("")}</ol></div>
        <div class="flex gap-2 bg-soft p-3"><button data-act="copy-q" class="rounded-lg bg-white px-3 py-1.5 ring-1 ring-line">Скопировать списком</button></div>`;
      return;
    }
    const author = get(LS_AUTHOR, "");
    const list = comments
      .filter((c) => !target || (c.block === target.block && c.variant === target.variant))
      .sort((a, b) => b.ts - a.ts);
    const blockLabel = (id: string) => cfg.blocks.find((b) => b.id === id)?.label ?? id;
    const form = target
      ? `<div class="mb-3 rounded-xl bg-soft px-3 py-2"><button data-act="all" class="float-right text-[12px] text-muted-foreground">показать все</button><b>${esc(blockLabel(target.block))}</b><br><span class="text-[13px]">${esc(labelOf(target.block, target.variant))}</span></div>
        <input data-f="author" class="mb-2 w-full rounded-lg border border-line px-3 py-2" placeholder="Ваше имя" value="${esc(author)}">
        <textarea data-f="text" class="min-h-24 w-full rounded-lg border border-line px-3 py-2" placeholder="Что поменять, что нравится"></textarea>
        <button data-act="add" class="mt-2 rounded-lg bg-[#3b5bdb] px-4 py-2 font-semibold text-white">Добавить</button>`
      : `<p class="text-[13px] text-muted-foreground">Нажмите «Комментарий» на панели блока. Комментарии живут в этом браузере; чтобы передать их, сделайте экспорт и пришлите файл, а полученный файл загрузите через импорт.</p>`;
    const items = list.length
      ? list
          .map(
            (c) => `<div class="mt-2 rounded-xl border border-line p-3"><div class="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground"><b class="text-ink">${esc(c.author || "Без имени")}</b>${new Date(c.ts).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}${
              target ? "" : `<span class="rounded bg-soft px-1.5">${esc(blockLabel(c.block))} · ${esc(labelOf(c.block, c.variant))}</span><span class="rounded bg-soft px-1.5">${esc(c.course)} · ${esc(c.country)}</span>`
            }<button data-del="${c.id}" class="ml-auto">удалить</button></div><p class="mt-1 whitespace-pre-wrap">${esc(c.text)}</p></div>`,
          )
          .join("")
      : `<p class="py-8 text-center text-muted-foreground">Комментариев пока нет</p>`;
    d.innerHTML = `${tabs}<div class="flex-1 overflow-auto px-4 pb-4">${form}${items}</div>
      <div class="flex flex-wrap gap-2 bg-soft p-3"><button data-act="export" class="rounded-lg bg-white px-3 py-1.5 ring-1 ring-line">Экспорт</button><button data-act="import" class="rounded-lg bg-white px-3 py-1.5 ring-1 ring-line">Импорт</button><button data-act="clear" class="rounded-lg bg-white px-3 py-1.5 ring-1 ring-line">Очистить</button></div>`;
  }

  document.addEventListener("click", (e) => {
    const el = e.target as HTMLElement;
    const pick = el.closest<HTMLElement>("[data-pg-pick]");
    const copy = el.closest<HTMLElement>("[data-pg-copy]");
    const block = el.closest<HTMLElement>("[data-pg-block]")?.dataset.pgBlock;
    if (pick && block) return (sel[block] = pick.dataset.pgPick!), apply();
    const scroll = el.closest<HTMLElement>("[data-pg-scroll]");
    if (scroll) return (sel.scroll = scroll.dataset.pgScroll!), apply();
    if (copy && block) return (sel[block + ".copy"] = copy.dataset.pgCopy!), apply();
    if (el.closest("[data-pg-comment]") && block) {
      target = { block, variant: variantKey(block) };
      drawer = "comments";
      return apply();
    }
    const open = el.closest<HTMLElement>("[data-pg-open]");
    if (open) return (drawer = drawer === open.dataset.pgOpen ? null : (open.dataset.pgOpen as any)), (target = null), apply();
    if (el.closest("[data-pg-collapse]")) return (ui.collapsed = !ui.collapsed), apply();
    if (el.closest("[data-pg-reset]")) return (sel = { ...cfg.defaults }), apply();
    if (el.closest("[data-pg-export-sel]")) {
      navigator.clipboard?.writeText(JSON.stringify(sel, null, 2)).then(() => toast("Выбор скопирован — вставьте в config/blocks.ts"));
      return;
    }
    const tab = el.closest<HTMLElement>("[data-tab]")?.dataset.tab;
    if (tab) return (drawer = tab === "close" ? null : (tab as any)), apply();
    const act = el.closest<HTMLElement>("[data-act]")?.dataset.act;
    if (act === "all") return (target = null), apply();
    if (act === "add" && target) {
      const text = $<HTMLTextAreaElement>('[data-f="text"]').value.trim();
      if (!text) return;
      const author = $<HTMLInputElement>('[data-f="author"]').value.trim();
      set(LS_AUTHOR, author);
      comments.push({ id: crypto.randomUUID(), ...target, course: cfg.course, country: cfg.country, author, text, ts: Date.now() });
      set(LS_COMM, comments);
      return apply();
    }
    const del = el.closest<HTMLElement>("[data-del]")?.dataset.del;
    if (del && confirm("Удалить комментарий?")) return (comments = comments.filter((c) => c.id !== del)), set(LS_COMM, comments), apply();
    if (act === "clear" && confirm("Удалить все комментарии в этом браузере? Сначала сделайте экспорт.")) return (comments = []), set(LS_COMM, comments), apply();
    if (act === "export") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ kind: "ccm-pg-comments", comments }, null, 2)], { type: "application/json" }));
      a.download = `ccm-comments-${(get(LS_AUTHOR, "") || "export").replace(/[^\p{L}\p{N}_-]+/gu, "_")}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      return;
    }
    if (act === "import") return $("[data-pg-import]").click();
    if (act === "copy-q") {
      navigator.clipboard?.writeText(questions().map(([q], i) => `${i + 1}. ${q}`).join("\n")).then(() => toast("Список скопирован"));
    }
  });

  $$<HTMLInputElement>("[data-pg-toggle]").forEach((cb) => {
    const k = cb.dataset.pgToggle as "bars" | "marks";
    cb.checked = ui[k];
    cb.addEventListener("change", () => ((ui[k] = cb.checked), apply()));
  });

  $<HTMLInputElement>("[data-pg-import]").addEventListener("change", async (e) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      const inc: Comment[] = Array.isArray(data) ? data : data.comments ?? [];
      const ids = new Set(comments.map((c) => c.id));
      const add = inc.filter((c) => c?.id && !ids.has(c.id));
      comments.push(...add);
      set(LS_COMM, comments);
      toast(`Добавлено комментариев: ${add.length}`);
      apply();
    } catch {
      toast("Не удалось прочитать файл");
    }
    (e.target as HTMLInputElement).value = "";
  });

  apply();
}
