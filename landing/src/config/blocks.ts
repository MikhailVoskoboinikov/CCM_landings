/*
 * Блоки лендинга и их варианты. Порядок массива — порядок блоков на странице.
 * DEFAULTS — варианты, из которых собираются боевые страницы; меняются,
 * когда команда выберет варианты в /playground (там есть экспорт выбора).
 * Порядок выстроен под телефон: крючок → зачем → кому → сертификат → навыки →
 * программа → кто учит → кто мы → вопросы → заявка.
 * Варианты adaptive собраны из двух других: одна версия на телефоне, другая на компьютере.
 */
export interface BlockDef {
  id: string;
  label: string;
  variants: [id: string, label: string][];
  /** Есть ли у блока два варианта текста для A/B-теста */
  copy?: boolean;
}

export const BLOCKS: BlockDef[] = [
  { id: "header", label: "Шапка", variants: [["full", "Полная"], ["ad", "Для рекламы"]] },
  { id: "hero", label: "Первый экран", variants: [["adaptive", "Телефон — фото, ПК — кардиограмма"], ["screen", "Фото на весь экран"], ["ecg", "Кардиограмма"], ["cert", "Сертификат"], ["film", "Ролик"]], copy: true },
  { id: "clip", label: "Клип «Курс за 60 секунд» (телефон)", variants: [["inline", "Клип"], ["off", "Нет блока"]] },
  { id: "why", label: "Почему это важно", variants: [["main", "Цифра и ситуации"]] },
  { id: "film", label: "Ролик-алгоритм", variants: [["steps", "Ролик и шаги"], ["off", "Нет блока"]] },
  { id: "audience", label: "Для кого", variants: [["adaptive", "ПК — плитки, телефон — список"], ["cards", "Плитки"], ["list", "Список"]] },
  { id: "certificate", label: "Сертификат", variants: [["anatomy", "Что в сертификате"], ["real", "Настоящий образец"], ["tilt", "Объёмная карточка"], ["path", "Путь к сертификату"]] },
  { id: "skills", label: "Чему научитесь", variants: [["swipe", "Телефон — лента, листается вбок"], ["list", "Телефон — список с фото"]] },
  { id: "quiz", label: "Мини-тест", variants: [["card", "Тест"], ["off", "Нет блока"]] },
  { id: "program", label: "Программа", variants: [["adaptive", "ПК — пазл, телефон — список"], ["accordion", "Раскрывающийся список"], ["puzzle", "Пазл"], ["timeline", "Линия"], ["day", "Как проходит день"], ["schedule", "День по часам"]] },
  { id: "instructors", label: "Инструкторы", variants: [["grid", "Сетка"], ["lead", "Ведущий инструктор"]] },
  { id: "about", label: "О ЦКМ", variants: [["stats", "Карта, цифры и причины"], ["photo", "Фото на весь блок"], ["map", "Карта центров"], ["story", "История"]] },
  { id: "clients", label: "Клиенты", variants: [["marquee", "Бегущая строка"], ["grid", "Сетка"]] },
  { id: "gallery", label: "Фотогалерея", variants: [["classes", "Крупное фото"], ["off", "Нет блока"], ["carousel", "Лента"], ["mosaic", "Мозаика"]] },
  { id: "pricing", label: "Стоимость", variants: [["off", "Нет блока — цена в заявке"], ["card", "Карточка"], ["calc", "Калькулятор"], ["dates", "Ближайшие даты"]] },
  { id: "reviews", label: "Отзывы", variants: [["cards", "Бегущая лента"], ["video", "Видео"]] },
  { id: "organizations", label: "Для организаций", variants: [["card", "Карточка"]] },
  { id: "faq", label: "Вопросы", variants: [["list", "Список"], ["chat", "Переписка"]] },
  { id: "lead", label: "Заявка", variants: [["form", "Форма"], ["messengers", "Мессенджеры"]] },
];

/*
 * Прокрутка на телефоне (на компьютере всегда обычная):
 *  fullpage — полноэкранные секции fullPage.js с прокруткой длинного содержимого
 *  strict — один свайп доводит до начала следующего блока; длинные блоки листаются внутри
 *  first  — доводка только на первых трёх блоках, дальше обычная прокрутка
 *  near   — мягкая доводка: страница прилипает к началу блока, если остановились рядом
 *  free   — обычная прокрутка
 */
export const SCROLL: [id: string, label: string][] = [["fullpage", "Экраны fullPage.js"], ["strict", "Блок за свайп"], ["first", "Свайп на первых экранах"], ["near", "Мягкая доводка"], ["free", "Обычная"]];

export const PLAYGROUND_SCROLL: [id: string, label: string][] = [
  ...SCROLL,
  ["swiper", "Swiper — жесты"],
  ["swiper-css", "Swiper — нативный"],
  ["lenis", "Lenis — плавная доводка"],
];
export const SCROLL_DETAILS: Record<string, string> = {
  fullpage: "Полноэкранные секции. Длинный блок прокручивается внутри, затем переход к следующему.",
  swiper: "Экран двигается за пальцем. Длинное содержимое листается вложенным слайдером с инерцией.",
  "swiper-css": "Нативный scroll-snap. Длинный блок сохраняет свою высоту и листается целиком; инерцию и доводку задаёт браузер.",
  lenis: "Непрерывная плавная прокрутка. После остановки — мягкая доводка к ближайшей границе блока.",
  strict: "Нативное прилипание к блокам с остановкой на каждой границе.",
  first: "Мягкое прилипание только на первых трёх блоках.",
  near: "Нативная доводка, если остановиться рядом с границей блока.",
  free: "Обычная прокрутка без прилипания к блокам.",
};

export const DEFAULTS: Record<string, string> = {
  scroll: "fullpage",
  header: "full",
  hero: "adaptive",
  "hero.copy": "a",
  clip: "inline",
  why: "main",
  film: "steps",
  audience: "adaptive",
  certificate: "anatomy",
  skills: "swipe",
  quiz: "off",
  program: "adaptive",
  instructors: "grid",
  about: "stats",
  clients: "marquee",
  gallery: "classes",
  pricing: "off",
  reviews: "cards",
  organizations: "card",
  faq: "list",
  lead: "form",
};

/** Выбранный порядок BLS Узбекистан одинаков для лендинга и стенда. */
export function blocksFor(country: string, course: string): BlockDef[] {
  if (country !== "uz" || course !== "bls") return BLOCKS;
  const instructors = BLOCKS.find((block) => block.id === "instructors")!;
  const ordered = BLOCKS.filter((block) => block.id !== "instructors");
  ordered.splice(ordered.findIndex((block) => block.id === "about") + 1, 0, instructors);
  return ordered;
}
