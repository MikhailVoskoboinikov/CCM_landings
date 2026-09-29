/*
 * Фотографии с globalccm.com и alfamedtraining.com — временно, для макета.
 * Для боевой версии нужны собственные файлы в src/assets (Astro их сожмёт)
 * и фото учебных центров Ташкента и Бишкека.
 */
const T = "https://static.tildacdn.com/";

export const IMG = {
  logo: T + "tild3934-6130-4338-b035-316134326232/CCM___SVG.svg",
  manikin: T + "tild3862-3834-4932-a364-643732623139/_ZIM0011.jpg",
  scenario: T + "tild6663-3534-4266-a265-386239653935/_ZIM0018.jpg",
  team: T + "tild3332-6663-4864-a131-653131643931/_ZIM0023.jpg",
  aed: T + "tild3937-6533-4636-b633-613764316363/_ZIM0096.jpg",
  airway: T + "tild6531-3331-4364-b662-393639646435/_ZIM0451.jpg",
  bag: T + "tild3964-3332-4133-a135-613532363461/_ZIM0553.jpg",
  clinical: T + "tild6666-3535-4466-b033-383165313164/photo_2018-10-03_13-.jpg",
  workers: T + "tild3939-6532-4464-b734-626266333731/Screenshot_1.jpg",
  bandage: T + "tild3536-6333-4261-a539-303664653333/DSC04086_.jpg",
  heli: T + "tild3961-6537-4131-b130-356166306264/5298735264165469435_.jpg",
  event: T + "tild6265-6666-4134-b266-613934616263/IMG_0160.jpg",
  choking: T + "tild6562-3533-4134-b835-333562646336/IMG_3326.jpg",
} as const;

export type ImageKey = keyof typeof IMG;
