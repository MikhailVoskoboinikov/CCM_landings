/*
 * Блоки лендинга и их варианты. Порядок массива — порядок блоков на странице.
 * DEFAULTS — варианты, из которых собираются боевые страницы; меняются,
 * когда команда выберет варианты в /playground (там есть экспорт выбора).
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
  { id: "hero", label: "Первый экран", variants: [["ecg", "Кардиограмма"], ["photo", "Фото"], ["cert", "Сертификат"]], copy: true },
  { id: "audience", label: "Для кого", variants: [["cards", "Карточки"], ["list", "Список"]] },
  { id: "certificate", label: "Сертификат", variants: [["anatomy", "Анатомия"], ["tilt", "Объёмная карточка"], ["path", "Путь к сертификату"]] },
  { id: "program", label: "Программа", variants: [["accordion", "Раскрывающийся список"], ["timeline", "Линия"], ["day", "Как проходит день"]] },
  { id: "about", label: "О ЦКМ", variants: [["stats", "Цифры и причины"], ["photo", "Фото на весь блок"], ["map", "Схема центров"], ["story", "История"]] },
  { id: "clients", label: "Клиенты", variants: [["marquee", "Бегущая строка"], ["grid", "Сетка"]] },
  { id: "instructors", label: "Инструкторы", variants: [["carousel", "Лента"], ["lead", "Ведущий инструктор"]] },
  { id: "gallery", label: "Фотогалерея", variants: [["carousel", "Лента"], ["mosaic", "Мозаика"]] },
  { id: "pricing", label: "Стоимость", variants: [["off", "Нет блока — цена в заявке"], ["card", "Карточка"], ["calc", "Калькулятор"], ["dates", "Ближайшие даты"]] },
  { id: "reviews", label: "Отзывы", variants: [["cards", "Карточки"], ["video", "Видео"]] },
  { id: "faq", label: "Вопросы", variants: [["list", "Список"], ["chat", "Переписка"]] },
  { id: "lead", label: "Заявка", variants: [["form", "Форма"], ["messengers", "Мессенджеры"]] },
];

export const DEFAULTS: Record<string, string> = {
  header: "full",
  hero: "ecg",
  "hero.copy": "a",
  audience: "cards",
  certificate: "anatomy",
  program: "accordion",
  about: "photo",
  clients: "marquee",
  instructors: "carousel",
  gallery: "carousel",
  pricing: "off",
  reviews: "cards",
  faq: "list",
  lead: "form",
};
