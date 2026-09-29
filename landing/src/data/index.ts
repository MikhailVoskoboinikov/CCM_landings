import { bls } from "./courses/bls";
import { firstAid } from "./courses/first-aid";
import { firstAidKids } from "./courses/first-aid-kids";
import type { Course, CourseId } from "./types";

export { COUNTRIES, MESSENGER_LABEL } from "./countries";
export { IMG } from "./images";
export * from "./types";

export const COURSES: Record<CourseId, Course> = {
  bls,
  "first-aid": firstAid,
  "first-aid-kids": firstAidKids,
};

export const COURSE_LIST = Object.values(COURSES);
