import { bls } from "./courses/bls";
import { firstAid } from "./courses/first-aid";
import { firstAidKids } from "./courses/first-aid-kids";
import type { Course, CountryId, CourseId } from "./types";

export { COUNTRIES, MESSENGER_LABEL } from "./countries";
export { IMG } from "./images";
export * from "./types";

export const COURSES: Record<CourseId, Course> = {
  bls,
  "first-aid": firstAid,
  "first-aid-kids": firstAidKids,
};

export const COURSE_LIST = Object.values(COURSES);

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
function merge<T>(base: T, over: unknown): T {
  if (!isObj(base) || !isObj(over)) return (over ?? base) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isObj(v) && isObj(out[k]) ? merge(out[k], v) : v;
  return out as T;
}

/** Курс с учётом отличий для страны: страницы и стенд работают только с ним */
export function courseFor(id: CourseId, country: CountryId): Course {
  const c = COURSES[id];
  return merge(c, c.byCountry?.[country]);
}
