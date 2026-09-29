/* Внутренняя ссылка с учётом base: на GitHub Pages сайт живёт в /CCM_landings/ */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export const url = (path: string) => BASE + path;
