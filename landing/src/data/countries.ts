import type { Country, CountryId } from "./types";

/*
 * Контакты взяты с alfamedtraining.com. Основной мессенджер — гипотеза:
 * в Узбекистане чаще пишут в Telegram, в Кыргызстане — в WhatsApp.
 * Проверить по истории заявок в amoCRM.
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
    legal: "[[ООО «CCM Training», ИНН 000 000 000, Ташкент|Название и реквизиты юрлица в Узбекистане]]",
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
      { id: "whatsapp", href: "#" },
      { id: "telegram", href: "#" },
      { id: "instagram", href: "#" },
    ],
    legal: "[[ОсОО «CCM Training», ИНН 00000000000000, Бишкек|Название и реквизиты юрлица в Кыргызстане]]",
  },
};

export const MESSENGER_LABEL = { telegram: "Telegram", whatsapp: "WhatsApp", instagram: "Instagram" } as const;
