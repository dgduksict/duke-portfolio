import type { Language, SkillGroupId } from "@/types";

/**
 * UI chrome copy. Content (roles, projects, bio) lives in `src/data` as
 * `Localized` values — this file only covers labels, headings and helper text.
 * The `Dictionary` interface is what keeps `en` and `mn` structurally identical.
 */
export interface Dictionary {
  readonly meta: {
    readonly languageName: string;
    readonly languageShort: string;
  };
  readonly nav: {
    readonly skip: string;
    readonly home: string;
    readonly primary: string;
    readonly menu: string;
    readonly close: string;
    readonly language: string;
    readonly toggleTheme: string;
  };
  readonly hero: {
    readonly emailMe: string;
    readonly resume: string;
    /** "14:32 in Ulaanbaatar, 6 hours ahead of you." */
    readonly clock: (time: string, offset: string) => string;
  };
  readonly experience: {
    readonly title: string;
    readonly now: string;
    readonly current: string;
    readonly fromThisRole: string;
  };
  readonly work: {
    readonly title: string;
    readonly howItWorks: string;
    readonly myPart: string;
    readonly builtWith: string;
    readonly outcomes: string;
    readonly internal: string;
    readonly newTab: string;
  };
  readonly stack: {
    readonly title: string;
    readonly intro: string;
    readonly alsoUsed: string;
    readonly groups: Readonly<Record<SkillGroupId, string>>;
  };
  readonly testimonials: {
    readonly title: string;
  };
  readonly contact: {
    readonly title: string;
    readonly avatarAlt: string;
    readonly copyEmail: string;
    readonly copied: string;
    readonly elsewhere: string;
    readonly phone: string;
  };
  readonly footer: {
    readonly source: string;
  };
  readonly notFound: {
    readonly title: string;
    readonly body: string;
    readonly home: string;
  };
}

const en: Dictionary = {
  meta: { languageName: "English", languageShort: "EN" },
  nav: {
    skip: "Skip to content",
    home: "Duke, back to the top",
    primary: "Sections",
    menu: "Menu",
    close: "Close menu",
    language: "Language",
    toggleTheme: "Switch between light and dark",
  },
  hero: {
    emailMe: "Email me",
    resume: "Résumé",
    clock: (time, offset) => `${time} in Ulaanbaatar, ${offset}.`,
  },
  experience: {
    title: "Experience",
    now: "now",
    current: "Current role",
    fromThisRole: "Work from this role:",
  },
  work: {
    title: "Selected work",
    howItWorks: "How it works",
    myPart: "My part",
    builtWith: "Built with",
    outcomes: "Results",
    internal: "Internal tool",
    newTab: "opens in a new tab",
  },
  stack: {
    title: "Stack",
    intro: "Each tool links to the work where I used it.",
    alsoUsed: "Also worked with",
    groups: {
      ai: "AI and search",
      backend: "Backend",
      web3: "Web3",
      frontend: "Frontend",
      infra: "Infrastructure",
    },
  },
  testimonials: {
    title: "What colleagues say",
  },
  contact: {
    title: "Contact",
    avatarAlt: "Duke's avatar: a white cat in sunglasses.",
    copyEmail: "Copy email",
    copied: "Copied",
    elsewhere: "Elsewhere",
    phone: "Phone",
  },
  footer: {
    source: "Source on GitHub",
  },
  notFound: {
    title: "Nothing here",
    body: "This page doesn't exist. Everything lives on the one page.",
    home: "Go to the portfolio",
  },
};

const mn: Dictionary = {
  meta: { languageName: "Монгол", languageShort: "МН" },
  nav: {
    skip: "Агуулга руу шилжих",
    home: "Дөки, дээш буцах",
    primary: "Хэсгүүд",
    menu: "Цэс",
    close: "Цэс хаах",
    language: "Хэл",
    toggleTheme: "Цайвар, бараан горим солих",
  },
  hero: {
    emailMe: "Имэйл бичих",
    resume: "CV",
    clock: (time, offset) => `Улаанбаатарт ${time}, ${offset}.`,
  },
  experience: {
    title: "Туршлага",
    now: "одоо",
    current: "Одоогийн ажил",
    fromThisRole: "Энэ ажлын хүрээнд:",
  },
  work: {
    title: "Сонгосон ажлууд",
    howItWorks: "Хэрхэн ажилладаг",
    myPart: "Миний хэсэг",
    builtWith: "Технологи",
    outcomes: "Үр дүн",
    internal: "Дотоод хэрэгсэл",
    newTab: "шинэ цонхонд нээгдэнэ",
  },
  stack: {
    title: "Технологи",
    intro: "Хэрэгсэл бүр түүнийг ашигласан ажил руу холбогдоно.",
    alsoUsed: "Мөн ашиглаж байсан:",
    groups: {
      ai: "AI ба хайлт",
      backend: "Backend",
      web3: "Web3",
      frontend: "Frontend",
      infra: "Дэд бүтэц",
    },
  },
  testimonials: {
    title: "Хамт олны сэтгэгдэл",
  },
  contact: {
    title: "Холбоо барих",
    avatarAlt: "Дөкигийн аватар: нарны шил зүүсэн цагаан муур.",
    copyEmail: "Имэйл хуулах",
    copied: "Хуулсан",
    elsewhere: "Бусад",
    phone: "Утас",
  },
  footer: {
    source: "Эх код GitHub дээр",
  },
  notFound: {
    title: "Энд юу ч алга",
    body: "Ийм хуудас байхгүй. Бүх зүйл нэг хуудсанд байгаа.",
    home: "Нүүр хуудас руу",
  },
};

export const dictionaries: Readonly<Record<Language, Dictionary>> = { en, mn };

export function getDictionary(language: Language): Dictionary {
  return dictionaries[language];
}
