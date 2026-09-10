import type { Localized } from "@/types";

export interface Testimonial {
  readonly id: string;
  readonly quote: Localized;
  readonly author: string;
  readonly role: Localized;
  readonly company: string;
  readonly accent: string;
}

export const testimonials: readonly Testimonial[] = [
  {
    id: "editorial-lead",
    quote: {
      en: "He replaced a process four people babysat every morning with a pipeline nobody has to think about. The newsroom got its mornings back.",
      mn: "Өглөө бүр дөрвөн хүн хянаж байсан процессыг хэн ч санаа зовох шаардлагагүй систем болгон сольсон. Редакц өглөөгөө буцааж авсан.",
    },
    author: "B. Enkhjargal",
    role: { en: "Editorial Lead", mn: "Редакцын ахлагч" },
    company: "Mongol Content",
    accent: "#34d399",
  },
  {
    id: "cto",
    quote: {
      en: "The contract work came with an invariant suite and a forked-mainnet test run. That is the first time a review found nothing worth blocking on.",
      mn: "Гэрээний ажил invariant тест, fork хийсэн mainnet шалгалттай ирсэн. Хяналт ямар ч саад болохоор зүйл олоогүй анхны тохиолдол байлаа.",
    },
    author: "T. Munkh-Erdene",
    role: { en: "Engineering Lead", mn: "Инженерингийн ахлагч" },
    company: "NumadLabs",
    accent: "#a78bfa",
  },
  {
    id: "product",
    quote: {
      en: "Estimates matched reality within a week, twice in a row. That is rarer than the engineering itself.",
      mn: "Тооцоолол хоёр удаа дараалан бодит хугацаанаас долоо хоногийн зөрүүтэй таарсан. Энэ нь инженерчлэлээс ч ховор.",
    },
    author: "S. Oyunaa",
    role: { en: "Product Manager", mn: "Бүтээгдэхүүний менежер" },
    company: "MobiCom",
    accent: "#22d3ee",
  },
];
