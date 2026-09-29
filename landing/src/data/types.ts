/* Модель данных лендингов. Все тексты — строки с разметкой из lib/rich.ts */

export type CountryId = "uz" | "kg";
export type CourseId = "bls" | "first-aid" | "first-aid-kids";
export type Messenger = "telegram" | "whatsapp" | "instagram";

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
  audience: {
    title: string;
    lead: string;
    items: IconText[];
    note: string;
  };
  certificate: {
    kind: "erc" | "center";
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
    /** Цена за участника в валюте страны; null — пока неизвестна */
    amount: Partial<Record<CountryId, number | null>>;
    includes: string[];
    groupDiscounts: { from: number; percent: number }[];
  };
  faq: [string, string][];
  gallery: string[];
}
