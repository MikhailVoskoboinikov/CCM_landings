/* Модель данных лендингов. Все тексты — строки с разметкой из lib/rich.ts */

export type CountryId = "uz" | "kg";
export type CourseId = "bls" | "first-aid" | "first-aid-kids";
export type Messenger = "telegram" | "whatsapp" | "instagram";
/** Образец сертификата: картинка-основа и раскладка полей — components/parts/CertificateReal.astro */
export type CertSampleId = "bls-uz" | "bls-kg" | "first-aid" | "first-aid-kids";

/** Частичное переопределение: вложенные объекты сливаются, массивы заменяются целиком */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export interface Stat {
  value: string;
  text: string;
  source: string;
}

export interface Country {
  id: CountryId;
  name: string;
  city: string;
  address: string;
  phone: string;
  phoneHref: string;
  phonePrefix: string;
  phoneMask: string;
  email: string;
  currency: string;
  /** Основной мессенджер страны — он идёт первым в кнопках */
  messengers: { id: Messenger; href: string }[];
  legal: string;
  /** Лицензия на образовательную деятельность, если есть */
  license?: string;
  /** Местная цифра для блока «Почему это важно»: про скорую помощь в городе */
  stat?: Stat;
}

export interface IconText {
  icon: string;
  title: string;
  text: string;
}

export interface Course {
  id: CourseId;
  name: string;
  short: string;
  hero: {
    image: string;
    a: { title: string; sub: string };
    b: { title: string; sub: string };
  };
  facts: { icon: string; label: string; value: string }[];
  /** Почему это важно: цифра и ситуации, в которых пригодится курс */
  why: {
    title: string;
    stat: Stat;
    items: { icon: string; text: string }[];
  };
  /** Чему научитесь: 6 навыков с фото */
  skills: {
    title: string;
    lead: string;
    items: { image: string; title: string; text: string }[];
  };
  audience: {
    title: string;
    lead: string;
    items: IconText[];
    note: string;
  };
  certificate: {
    kind: "erc" | "center";
    /** Образец, который показываем на странице */
    sample: CertSampleId;
    /** Пометка под образцом: чем он отличается от настоящего документа */
    sampleNote?: string;
    /** Когда участник получает сертификат */
    issued: string;
    title: string;
    lead: string;
    docTitle: string;
    docSubtitle: string;
    validity: string;
    /** Точки на образце сертификата: что в нём есть и зачем */
    anatomy: { title: string; text: string }[];
    /** Где пригодится */
    useful: IconText[];
    verify: string;
  };
  program: {
    lead: string;
    draft?: boolean;
    sections: { title: string; items: string[] }[];
    exam: string;
  };
  price: {
    note: string;
    /** Цена за участника в валюте страны */
    amount: Record<CountryId, number>;
    /** false — цена-пример для макета, показывается с пометкой «уточнить» */
    confirmed: boolean;
    includes: string[];
    groupDiscounts: { from: number; percent: number }[];
  };
  faq: [string, string][];
  gallery: string[];
  /** Обучение для организаций. Если есть modes — на странице переключатель «Для себя / Для организации» */
  org: {
    title: string;
    lead: string;
    items: IconText[];
    /** Цены для организаций, строки с разметкой */
    prices?: { title: string; note: string; value: string }[];
    modes?: {
      hero: { title: string; sub: string };
      audience: { title: string; lead: string; items: IconText[] };
      /** Итоги обучения для организации */
      deliverables: IconText[];
      /** Мастер-классы для детей */
      kids?: { title: string; lead: string; items: { grades: string; hours: string; text: string }[]; note: string };
    };
  };
  /** Отличия страницы в конкретной стране */
  byCountry?: Partial<Record<CountryId, DeepPartial<Omit<Course, "id" | "byCountry">>>>;
}
