/* Мобильная прокрутка секциями. Исходные узлы возвращаются на место при смене режима. */
interface FullpageSection { item: HTMLElement }
interface FullpageAPI {
  getActiveSection(): FullpageSection | undefined;
  destroy(type: "all"): void;
  reBuild(): void;
  moveTo(section: number): void;
  silentMoveTo(section: number): void;
  setAllowScrolling(allow: boolean): void;
  setKeyboardScrolling(allow: boolean): void;
  setScrollingSpeed(speed: number): void;
}
type FullpageConstructor = new (container: HTMLElement, options: Record<string, unknown>) => FullpageAPI;
interface Entry { node: HTMLElement; marker: Comment; section: HTMLElement }

export function initMobileFullpage() {
  const page = document.querySelector<HTMLElement>("[data-landing-content]");
  if (!page) return;
  const root = document.documentElement;
  const mobile = matchMedia("(max-width: 767.98px)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const overlays = new Set<string>();
  let api: FullpageAPI | undefined;
  let host: HTMLElement | undefined;
  let entries: Entry[] = [];
  let generation = 0;
  let syncFrame = 0;
  let rebuildFrame = 0;
  let library: Promise<FullpageConstructor> | undefined;
  let pendingTarget: HTMLElement | undefined;

  const visibleSections = () => [...page.querySelectorAll<HTMLElement>("section, footer")].filter(
    (s) => !s.parentElement?.closest("section, footer") && s.getClientRects().length,
  );
  const overflow = (section: HTMLElement) => section.querySelector<HTMLElement>(".fp-overflow");
  const activeSection = () => {
    const section = api?.getActiveSection();
    return section ? { item: section.item, index: entries.findIndex((entry) => entry.section === section.item) } : undefined;
  };
  const headerHeight = () => {
    const header = page.querySelector<HTMLElement>("[data-header]");
    if (!header) return 0;
    const group = header.closest<HTMLElement>("[data-pg-block]");
    const bar = group?.querySelector<HTMLElement>("[data-pg-bar]");
    return header.offsetHeight + (bar?.offsetHeight ?? 0);
  };
  const lock = () => {
    api?.setAllowScrolling(overlays.size === 0);
    api?.setKeyboardScrolling(overlays.size === 0);
  };
  const progress = () => {
    const active = activeSection();
    if (!active) return;
    const scroll = overflow(active.item);
    const inner = scroll && scroll.scrollHeight > scroll.clientHeight
      ? scroll.scrollTop / (scroll.scrollHeight - scroll.clientHeight) : 0;
    document.dispatchEvent(new CustomEvent("ccm:scroll", { detail: {
      progress: Math.min(1, (active.index + inner) / Math.max(1, entries.length - 1)),
      scrolled: active.index > 0 || (scroll?.scrollTop ?? 0) > 8,
    } }));
  };
  const reveal = () => {
    const active = activeSection();
    if (active) active.item.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    if (pendingTarget && active?.item.contains(pendingTarget)) {
      const scroll = overflow(active.item);
      if (scroll) scroll.scrollTop += pendingTarget.getBoundingClientRect().top - scroll.getBoundingClientRect().top;
      pendingTarget = undefined;
    }
    progress();
  };

  // Раскрытие FAQ, смена текста и загрузка изображений меняют высоту содержимого.
  const resize = new ResizeObserver(() => {
    if (!api || rebuildFrame) return;
    rebuildFrame = requestAnimationFrame(() => {
      rebuildFrame = 0;
      api?.reBuild();
      progress();
    });
  });

  const destroy = () => {
    const active = activeSection();
    const position = active ? {
      node: entries[active.index]?.node,
      scrollTop: overflow(active.item)?.scrollTop ?? 0,
    } : undefined;
    resize.disconnect();
    cancelAnimationFrame(rebuildFrame);
    rebuildFrame = 0;
    api?.destroy("all");
    api = undefined;
    entries.forEach(({ node, marker }) => { marker.replaceWith(node); });
    entries = [];
    host?.remove();
    host = undefined;
    root.classList.remove("ccm-fullpage-active");
    root.style.removeProperty("--ccm-screen-height");
    return position;
  };

  async function sync(version: number) {
    const position = destroy();
    if (!mobile.matches || root.dataset.snap !== "fullpage") {
      if (position?.node) {
        const target = position.node.getClientRects().length ? position.node :
          [...position.node.querySelectorAll<HTMLElement>("section, footer")].find((section) => section.getClientRects().length);
        if (target) window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - headerHeight() + position.scrollTop, behavior: "instant" });
      }
      window.dispatchEvent(new Event("scroll"));
      return;
    }
    try {
      // Пакет fullpage.js не включает объявленные в package.json типы в npm-архив.
      // @ts-expect-error Внешний модуль типизирован локальным интерфейсом адаптера.
      library ??= import("fullpage.js").then((module) => module.default as FullpageConstructor);
      const Fullpage = await library;
      if (version !== generation) return;
      const sections = visibleSections();
      const groupSelector = "[data-pg-block], [data-landing-block]";
      const groups = [...page!.querySelectorAll<HTMLElement>(groupSelector)];
      // Панели выключенных блоков остаются доступны на стенде как секции свободной высоты.
      const nodes = groups.length ? [
        ...groups.filter((group) => (group.dataset.pgBlock ?? group.dataset.landingBlock) !== "header" && (
          sections.some((section) => group.contains(section)) || group.querySelector<HTMLElement>("[data-pg-bar]")?.offsetHeight
        )),
        ...sections.filter((section) => !section.closest(groupSelector)),
      ] : sections;
      if (!nodes.length) return;
      const current = sections.find((section) => section.getBoundingClientRect().bottom > headerHeight());
      const initial = position?.node ?? current?.closest<HTMLElement>(groupSelector) ?? current ?? nodes[0];
      const top = headerHeight();
      root.style.setProperty("--ccm-screen-height", `${Math.max(0, innerHeight - top)}px`);
      host = document.createElement("div");
      host.dataset.fullpageRoot = "";
      page!.append(host);
      entries = nodes.map((node) => {
        const marker = document.createComment("Место секции в обычной прокрутке");
        node.before(marker);
        const section = document.createElement("div");
        section.className = "ccm-fullpage-section";
        if (!sections.some((content) => node === content || node.contains(content))) section.classList.add("fp-auto-height");
        if (node === initial) section.classList.add("active");
        section.append(node);
        host!.append(section);
        return { node, marker, section };
      });
      root.classList.add("ccm-fullpage-active");
      api = new Fullpage(host, {
        licenseKey: import.meta.env.PUBLIC_FULLPAGE_LICENSE_KEY ?? "",
        sectionSelector: ".ccm-fullpage-section",
        slideSelector: ".ccm-fullpage-slide",
        verticalCentered: false,
        paddingTop: `${top}px`,
        scrollOverflow: true,
        scrollingSpeed: reducedMotion.matches ? 0 : 600,
        touchSensitivity: 15,
        adjustOnNavChange: true,
        recordHistory: false,
        lockAnchors: true,
        observer: false,
        lazyLoading: false,
        normalScrollElements: "[data-header], [data-pg-panel], [data-pg-drawer], [data-slot='drawer-content'], [data-slot='drawer-overlay'], [data-skill-track]",
        credits: { enabled: true, label: "fullPage.js", position: "right" },
        afterLoad: reveal,
        afterResize: () => {
          root.style.setProperty("--ccm-screen-height", `${Math.max(0, innerHeight - headerHeight())}px`);
          progress();
        },
        onScrollOverflow: progress,
      });
      if (position) {
        const active = activeSection();
        const scroll = active && overflow(active.item);
        if (scroll) scroll.scrollTop = position.scrollTop;
      }
      entries.forEach(({ node }) => {
        resize.observe(node);
        node.querySelectorAll<HTMLElement>("section, footer").forEach((section) => resize.observe(section));
      });
      lock();
      reveal();
      if (!position && location.hash) navigateHash();
    } catch (error) {
      destroy();
      library = undefined;
      console.error("Не удалось включить полноэкранную прокрутку", error);
    }
  }
  const schedule = () => {
    const version = ++generation;
    cancelAnimationFrame(syncFrame);
    syncFrame = requestAnimationFrame(() => { syncFrame = 0; void sync(version); });
  };
  const navigate = (target: HTMLElement) => {
    if (!api) return false;
    const index = entries.findIndex(({ node }) => node === target || node.contains(target));
    if (index < 0) return false;
    pendingTarget = target;
    api.moveTo(index + 1);
    reveal();
    return true;
  };
  const navigateHash = () => {
    try {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) navigate(target);
    } catch { /* Некорректный якорь не мешает прокрутке. */ }
  };
  document.addEventListener("ccm:overlay", (event) => {
    const { source, open } = (event as CustomEvent<{ source: string; open: boolean }>).detail;
    open ? overlays.add(source) : overlays.delete(source);
    lock();
  });
  document.addEventListener("ccm:next-section", (event) => {
    const active = activeSection();
    if (!active || active.index >= entries.length - 1) return;
    event.preventDefault();
    api!.moveTo(active.index + 2);
  });
  document.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!api || !link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute("download")) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    try {
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target && navigate(target)) {
        event.preventDefault();
        history.pushState(null, "", url);
      }
    } catch { /* Некорректный якорь не мешает прокрутке. */ }
  });
  addEventListener("hashchange", navigateHash);
  mobile.addEventListener("change", schedule);
  reducedMotion.addEventListener("change", () => api?.setScrollingSpeed(reducedMotion.matches ? 0 : 600));
  document.addEventListener("ccm:rendered", schedule);
  document.addEventListener("ccm:mode", schedule);
  schedule();
}
