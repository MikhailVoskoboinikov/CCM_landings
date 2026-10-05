/** Слайдер с автосменой: по умолчанию 10 с, иначе data-carousel-duration (мс). Выбор вручную сбрасывает время, наведение ставит на паузу. */
export function initTimedCarousels() {
  document.querySelectorAll<HTMLElement>("[data-timed-carousel]").forEach((root) => {
    if (root.dataset.carouselReady) return;
    root.dataset.carouselReady = "true";
    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-carousel-panel]"));
    const choices = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-carousel-choice]"));
    const progress = root.querySelector<HTMLElement>("[data-carousel-progress]");
    const counter = root.querySelector<HTMLElement>("[data-carousel-counter]");
    const main = root.querySelector<HTMLElement>("[data-carousel-main]");
    if (!panels.length) return;
    const duration = Number(root.dataset.carouselDuration) || 10_000;
    let index = 0, elapsed = 0, previous = performance.now(), frame = 0;
    let hovered = false, focused = false, visible = false;
    const drawProgress = () => {
      if (progress) progress.style.transform = `scaleX(${elapsed / duration})`;
    };
    const select = (next: number) => {
      index = (next + panels.length) % panels.length;
      elapsed = 0;
      previous = performance.now();
      panels.forEach((panel, i) => { panel.hidden = i !== index; });
      choices.forEach((button, i) => {
        button.setAttribute("aria-pressed", String(i === index));
        button.dataset.active = String(i === index);
      });
      if (counter) counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
      drawProgress();
    };
    const tick = (now: number) => {
      frame = 0;
      if (!root.isConnected) { observer.disconnect(); return; }
      elapsed += now - previous;
      previous = now;
      if (elapsed >= duration) select(index + 1);
      drawProgress();
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previous = performance.now();
      if (visible && !hovered && !focused && !document.hidden) frame = requestAnimationFrame(tick);
    };
    choices.forEach((button, i) => button.addEventListener("click", () => { select(i); sync(); }));
    root.querySelectorAll<HTMLButtonElement>("[data-carousel-step]").forEach((button) =>
      button.addEventListener("click", () => { select(index + Number(button.dataset.carouselStep)); sync(); }),
    );
    main?.addEventListener("pointerenter", (event) => { if (event.pointerType !== "touch") { hovered = true; sync(); } });
    main?.addEventListener("pointerleave", () => { hovered = false; sync(); });
    main?.addEventListener("focusin", () => { focused = true; sync(); });
    main?.addEventListener("focusout", (event) => {
      if (!main?.contains(event.relatedTarget as Node | null)) { focused = false; sync(); }
    });
    document.addEventListener("visibilitychange", sync);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.15 });
    select(0);
    observer.observe(root);
  });
}