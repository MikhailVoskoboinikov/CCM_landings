/*
 * Блоки лендинга и их варианты. Порядок массива — порядок блоков на странице.
 * DEFAULTS — варианты, из которых собираются боевые страницы; меняются,
 * когда команда выберет варианты в /playground (там есть экспорт выбора).
 * Порядок выстроен под телефон: крючок → зачем → кому → сертификат → навыки →
 * программа → кто учит → кто мы → цена → вопросы → заявка.
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
  { id: "hero", label: "Первый экран", variants: [["screen", "Фото на весь экран"], ["ecg", "Кардиограмма"], ["cert", "Сертификат"]], copy: true },
  { id: "why", label: "Почему это важно", variants: [["main", "Цифра и ситуации"]] },
  { id: "audience", label: "Для кого", variants: [["cards", "Плитки"], ["list", "Список"]] },
  { id: "certificate", label: "Сертификат", variants: [["real", "Настоящий образец с именем"], ["tilt", "Объёмная карточка"], ["path", "Путь к сертификату"]] },
  { id: "skills", label: "Чему научитесь", variants: [["list", "Список с фото"], ["cards", "Карточки"]] },
  { id: "program", label: "Программа", variants: [["accordion", "Раскрывающийся список"], ["puzzle", "Пазл"], ["timeline", "Линия"], ["day", "Как проходит день"]] },
  { id: "instructors", label: "Инструкторы", variants: [["lead", "Ведущий инструктор"], ["grid", "Сетка"]] },
  { id: "about", label: "О ЦКМ", variants: [["photo", "Фото на весь блок"], ["stats", "Карта, цифры и причины"], ["map", "Карта центров"], ["story", "История"]] },
  { id: "clients", label: "Клиенты", variants: [["marquee", "Бегущая строка"], ["grid", "Сетка"]] },
  { id: "gallery", label: "Фотогалерея", variants: [["off", "Нет блока"], ["carousel", "Лента"], ["classes", "Крупное фото"], ["mosaic", "Мозаика"]] },
  { id: "pricing", label: "Стоимость", variants: [["off", "Нет блока — цена в заявке"], ["card", "Карточка"], ["calc", "Калькулятор"], ["dates", "Ближайшие даты"]] },
  { id: "reviews", label: "Отзывы", variants: [["cards", "Бегущая лента"], ["showcase", "Один крупно"], ["video", "Видео"]] },
  { id: "organizations", label: "Для организаций", variants: [["card", "Карточка"]] },
  { id: "faq", label: "Вопросы", variants: [["list", "Список"], ["chat", "Переписка"]] },
  { id: "lead", label: "Заявка", variants: [["form", "Форма"], ["messengers", "Мессенджеры"]] },
];

export const DEFAULTS: Record<string, string> = {
  header: "full",
  hero: "screen",
  "hero.copy": "a",
  why: "main",
  audience: "cards",
  certificate: "real",
  skills: "list",
  program: "accordion",
  instructors: "lead",
  about: "photo",
  clients: "marquee",
  gallery: "off",
  pricing: "off",
  reviews: "cards",
  organizations: "card",
  faq: "list",
  lead: "form",
};
