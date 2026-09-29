/*
 * Атрибуция заявок. При первом заходе посетитель получает cookie ccm_vid,
 * UTM-метки и идентификаторы кликов сохраняются как первое и последнее касание.
 * Из fbclid по правилам Meta собирается cookie _fbc; _fbp ставит сам пиксель.
 * Всё это уходит вместе с заявкой, чтобы бэкенд связал лид в CRM с рекламой
 * и отправил событие Lead в Conversions API.
 */
const PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "yclid"] as const;
const LS_FIRST = "ccm_touch_first";
const LS_LAST = "ccm_touch_last";

type Touch = Partial<Record<(typeof PARAMS)[number], string>> & { ts: number; page: string; referrer: string };

function getCookie(name: string) {
  return document.cookie.split("; ").find((c) => c.startsWith(name + "="))?.split("=")[1];
}
function setCookie(name: string, value: string, days: number) {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${exp}; path=/; SameSite=Lax`;
}
function read<T>(k: string): T | null {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* приватный режим или отключённое хранилище */
  }
}

/** Вызывается один раз при загрузке страницы */
export function captureAttribution() {
  if (!getCookie("ccm_vid")) setCookie("ccm_vid", crypto.randomUUID(), 365);

  const url = new URL(location.href);
  const touch: Touch = { ts: Date.now(), page: location.pathname, referrer: document.referrer };
  let hasParams = false;
  for (const p of PARAMS) {
    const v = url.searchParams.get(p);
    if (v) {
      touch[p] = v;
      hasParams = true;
    }
  }
  if (touch.fbclid) setCookie("_fbc", `fb.1.${touch.ts}.${touch.fbclid}`, 90);
  if (!read(LS_FIRST)) write(LS_FIRST, touch);
  if (hasParams) write(LS_LAST, touch);
}

/** Данные для заявки */
export function attributionPayload() {
  return {
    visitor_id: getCookie("ccm_vid") ?? null,
    fbc: getCookie("_fbc") ?? null,
    fbp: getCookie("_fbp") ?? null,
    first_touch: read<Touch>(LS_FIRST),
    last_touch: read<Touch>(LS_LAST),
    page: location.pathname,
    user_agent: navigator.userAgent,
  };
}
