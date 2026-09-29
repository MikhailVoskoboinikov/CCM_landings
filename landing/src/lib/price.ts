/* Цена курса для страны: строка с пометкой, пока ЦКМ не подтвердил цены */
import type { Country, Course } from "@/data/types";

const fmt = new Intl.NumberFormat("ru-RU");

export function priceText(course: Course, country: Country) {
  const t = `${fmt.format(course.price.amount[country.id])} ${country.currency}`;
  return course.price.confirmed ? t : `[[${t}|Цена курса «${course.name}» (${country.name}) — пример, нужна реальная]]`;
}
