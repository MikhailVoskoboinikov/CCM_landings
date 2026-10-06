/* Адаптеры библиотек для сравнения на стенде. Загружаются только по выбору режима. */
import type { ScrollAPI } from "./mobile-fullpage";
import "swiper/css";
import "lenis/dist/lenis.css";

interface Context {
  host: HTMLElement;
  entries: { node: HTMLElement; section: HTMLElement }[];
  initial: number;
  headerHeight: number;
  reducedMotion: boolean;
  onChange(): void;
}
type Factory = (context: Context) => ScrollAPI;

export async function loadPlaygroundScroll(mode: string): Promise<Factory> {
  if (mode === "lenis") {
    const [{ default: Lenis }, { default: Snap }] = await Promise.all([import("lenis"), import("lenis/snap")]);
    return ({ entries, initial, headerHeight, reducedMotion, onChange }) => {
      let speed = reducedMotion ? 0 : 800;
      const lenis = new Lenis({
        autoRaf: true, smoothWheel: !reducedMotion, syncTouch: !reducedMotion,
        lerp: .08, syncTouchLerp: .08,
        prevent: (node) => node.matches("[data-pg-panel], [data-pg-drawer], [data-slot='drawer-content'], [data-skill-track]"),
      });
      const snap = new Snap(lenis, { type: "proximity", distanceThreshold: "18%", debounce: 350, duration: speed / 1000 });
      let removePoints: (() => void)[] = [];
      const header = () => parseFloat(document.documentElement.style.getPropertyValue("--ccm-header-height")) || headerHeight;
      const top = (section: HTMLElement) => Math.max(0, section.getBoundingClientRect().top + scrollY - header());
      const active = () => {
        let index = 0;
        entries.forEach(({ section }, i) => { if (top(section) <= scrollY + 1) index = i; });
        return entries[index].section;
      };
      const rebuild = () => {
        lenis.resize();
        removePoints.forEach((remove) => remove());
        removePoints = entries.flatMap(({ section }) => {
          const start = top(section);
          const end = start + Math.max(0, section.offsetHeight - (innerHeight - header()));
          return [snap.add(start), ...(end > start + 1 ? [snap.add(end)] : [])];
        });
      };
      const move = (index: number, immediate = false) => lenis.scrollTo(top(entries[index - 1].section), { immediate: immediate || speed === 0, duration: speed / 1000 });
      rebuild();
      move(initial + 1, true);
      const off = lenis.on("scroll", onChange);
      return {
        getActiveSection: () => ({ item: active() }),
        getScrollOffset: () => Math.max(0, scrollY - top(active())),
        setScrollOffset: (offset) => lenis.scrollTo(top(active()) + offset, { immediate: true }),
        scrollToElement: (target) => lenis.scrollTo(target, { offset: -header(), immediate: speed === 0, duration: speed / 1000 }),
        moveTo: move,
        silentMoveTo: (index) => move(index, true),
        reBuild: rebuild,
        setAllowScrolling: (allow) => { if (allow) { lenis.start(); snap.start(); } else { snap.stop(); lenis.stop(); } },
        setKeyboardScrolling: () => {},
        setScrollingSpeed: (value) => {
          speed = value;
          lenis.options.smoothWheel = value > 0;
          lenis.options.syncTouch = value > 0;
          snap.options.duration = value / 1000;
        },
        destroy: () => { off(); removePoints.forEach((remove) => remove()); snap.destroy(); lenis.destroy(); },
      };
    };
  }

  const [{ default: Swiper }, { FreeMode, Mousewheel, Keyboard, A11y }] = await Promise.all([import("swiper"), import("swiper/modules")]);
  const native = mode === "swiper-css";
  return ({ host, entries, initial, reducedMotion, onChange }) => {
    document.documentElement.classList.add("ccm-swiper-active");
    host.classList.add("swiper", "ccm-swiper");
    const wrapper = document.createElement("div");
    wrapper.className = "swiper-wrapper";
    host.append(wrapper);
    const inners = entries.map(({ node, section }) => {
      section.classList.add("swiper-slide");
      wrapper.append(section);
      const inner = document.createElement("div");
      inner.className = native ? "ccm-swiper-native-content" : "swiper ccm-swiper-inner";
      section.append(inner);
      if (native) {
        inner.append(node);
        return { inner, swiper: undefined };
      }
      const contentWrapper = document.createElement("div");
      contentWrapper.className = "swiper-wrapper";
      const content = document.createElement("div");
      content.className = "swiper-slide ccm-swiper-content";
      content.append(node);
      contentWrapper.append(content);
      inner.append(contentWrapper);
      const swiper = new Swiper(inner, {
        modules: [FreeMode, Mousewheel], direction: "vertical", slidesPerView: "auto", nested: true,
        freeMode: { enabled: true }, touchReleaseOnEdges: true,
        mousewheel: { forceToAxis: true, releaseOnEdges: true },
        on: { setTranslate: onChange },
      });
      return { inner, swiper };
    });
    const outer = new Swiper(host, {
      modules: [Mousewheel, Keyboard, A11y], direction: "vertical", slidesPerView: "auto",
      initialSlide: initial, cssMode: native, speed: reducedMotion ? 0 : 650,
      threshold: 12, longSwipesRatio: .15, touchReleaseOnEdges: true,
      mousewheel: { forceToAxis: true }, keyboard: { enabled: true },
      on: { slideChange: onChange, transitionEnd: onChange, setTranslate: onChange },
    });
    const activeIndex = () => {
      if (!native) return outer.activeIndex;
      let index = 0;
      outer.slidesGrid.forEach((start, i) => { if (start <= outer.wrapperEl.scrollTop + 1) index = i; });
      return index;
    };
    const current = () => inners[activeIndex()];
    const offset = () => native ? Math.max(0, outer.wrapperEl.scrollTop - outer.slidesGrid[activeIndex()]) : -(current().swiper?.getTranslate() ?? 0);
    const range = () => native ? entries[activeIndex()].section.offsetHeight - host.clientHeight : -(current().swiper?.maxTranslate() ?? 0);
    const setOffset = (value: number) => {
      const amount = Math.max(0, Math.min(value, range()));
      if (native) outer.wrapperEl.scrollTop = outer.slidesGrid[activeIndex()] + amount;
      else {
        const swiper = current().swiper!;
        swiper.setTransition(0);
        swiper.setTranslate(-amount);
        swiper.updateProgress(-amount);
        swiper.updateActiveIndex();
      }
      onChange();
    };
    return {
      getActiveSection: () => ({ item: entries[activeIndex()].section }),
      getScrollOffset: offset,
      getScrollRange: range,
      setScrollOffset: setOffset,
      scrollToElement: (target) => setOffset((native ? 0 : offset()) + target.getBoundingClientRect().top - current().inner.getBoundingClientRect().top),
      moveTo: (index) => { outer.slideTo(index - 1); onChange(); },
      silentMoveTo: (index) => { outer.slideTo(index - 1, 0); onChange(); },
      reBuild: () => { outer.update(); inners.forEach(({ swiper }) => swiper?.update()); },
      setAllowScrolling: (allow) => {
        [outer, ...inners.flatMap(({ swiper }) => swiper ? [swiper] : [])].forEach((swiper) => {
          swiper.allowTouchMove = allow;
          allow ? swiper.mousewheel.enable() : swiper.mousewheel.disable();
        });
        // В cssMode жесты обрабатывает браузер, поэтому блокируем нативные области явно.
        host.classList.toggle("ccm-scroll-locked", !allow);
      },
      setKeyboardScrolling: (allow) => { allow ? outer.keyboard.enable() : outer.keyboard.disable(); },
      setScrollingSpeed: (speed) => { outer.params.speed = speed; },
      destroy: () => {
        inners.forEach(({ swiper }) => swiper?.destroy(true, true));
        outer.destroy(true, true);
      },
    };
  };
}
