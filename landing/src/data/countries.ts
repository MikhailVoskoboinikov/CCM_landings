import type { Country, CountryId } from "./types";

/*
 * Контакты — с alfamedtraining.com. Кыргызстан: юрлицо, лицензия, WhatsApp как
 * основной канал и цифра про скорую — из презентации учебного центра в Бишкеке.
 * Узбекистан: юрлицо — с образца сертификата; Telegram первым — гипотеза,
 * проверить по истории заявок в amoCRM.
 */
export const COUNTRIES: Record<CountryId, Country> = {
  uz: {
    id: "uz",
    name: "Узбекистан",
    city: "Ташкент",
    address: "Ташкент, ул. Айбека 18/1, БЦ «ATRIUM»",
    phone: "+998 94 878 51 28",
    phoneHref: "tel:+998948785128",
    phonePrefix: "+998",
    phoneMask: "__ ___ __ __",
    email: "ccm@globalccm.com",
    currency: "сум",
    messengers: [
      { id: "telegram", href: "#" },
      { id: "whatsapp", href: "#" },
      { id: "instagram", href: "#" },
    ],
    legal: "[[ООО «CCM Global», Ташкент|Юрлицо взято с образца сертификата (CCM Global LLC). Как писать по-русски и какой ИНН — для подвала и оферты?]]",
  },
  kg: {
    id: "kg",
    name: "Кыргызстан",
    city: "Бишкек",
    address: "Бишкек, ул. Льва Толстого 17В",
    phone: "+996 995 024 438",
    phoneHref: "tel:+996995024438",
    phonePrefix: "+996",
    phoneMask: "___ ___ ___",
    email: "ccm@globalccm.com",
    currency: "сом",
    messengers: [
      { id: "whatsapp", href: "https://wa.me/996995024438" },
      { id: "telegram", href: "#" },
      { id: "instagram", href: "#" },
    ],
    legal: "ОсОО «Центр корпоративной медицины»",
    license: "Лицензия Министерства образования и науки КР № Е2022-0115 от 24.11.2022",
    stat: {
      value: "42–43",
      text: "бригады скорой работают в Бишкеке, а нужно около 150. Первым рядом с пострадавшим окажется тот, кто рядом",
      source: "Центр экстренной медицины Бишкека, 24.kg, 2025–2026",
    },
  },
};

export const MESSENGER_LABEL = { telegram: "Telegram", whatsapp: "WhatsApp", instagram: "Instagram" } as const;
