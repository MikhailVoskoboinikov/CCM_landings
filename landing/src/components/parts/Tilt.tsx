/*
 * Объёмный наклон карточки за курсором или пальцем, с бликом.
 * Содержимое приходит из Astro как статичный HTML.
 */
import { useRef, type ReactNode } from "react";

export default function Tilt({ children, max = 10 }: { children?: ReactNode; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  function move(x: number, y: number) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (x - r.left) / r.width;
    const py = (y - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  }
  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div style={{ perspective: "1200px" }}>
      <div
        ref={ref}
        onPointerMove={(e) => move(e.clientX, e.clientY)}
        onPointerLeave={reset}
        className="relative transition-transform duration-200 ease-out will-change-transform"
        style={{ transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))", transformStyle: "preserve-3d" }}
      >
        {children}
        <div
          className="pointer-events-none absolute inset-0 rounded-[18px] mix-blend-soft-light"
          style={{ background: "radial-gradient(circle at var(--gx,30%) var(--gy,20%), rgba(255,255,255,.9), transparent 45%)" }}
        />
      </div>
    </div>
  );
}
