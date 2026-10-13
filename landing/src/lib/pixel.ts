/*
 * Пиксель Meta (Facebook Pixel). Номер пикселя — PUBLIC_FB_PIXEL_ID; без него ничего не грузится.
 * Скрипт Meta подключается только после согласия на cookie (parts/CookieNote.astro):
 * до согласия window.fbq нет, и вызовы вида fbq?.("track", …) просто пропускаются.
 * Событие Lead отправляет форма заявки (lead/LeadForm.tsx) с тем же event_id, что уходит на сервер.
 */
const PIXEL_ID = import.meta.env.PUBLIC_FB_PIXEL_ID as string | undefined;
const LS_CONSENT = "ccm_cookies";

export function hasConsent() {
  try {
    return localStorage.getItem(LS_CONSENT) === "ok";
  } catch {
    return false;
  }
}

export function giveConsent() {
  try {
    localStorage.setItem(LS_CONSENT, "ok");
  } catch {
    /* приватный режим: согласие действует до закрытия страницы */
  }
  loadPixel();
}

/** Подключает пиксель и отправляет PageView. Повторный вызов ничего не делает */
export function loadPixel() {
  const w = window as any;
  if (!PIXEL_ID || w.fbq) return;
  // Очередь вызовов: команды копятся, пока грузится скрипт Meta, затем он их выполняет
  const fbq: any = (...args: unknown[]) => (fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args));
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  w.fbq = w._fbq = fbq;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.append(s);
  fbq("init", PIXEL_ID);
  fbq("track", "PageView");
}
