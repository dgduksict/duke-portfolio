import type { Language } from "@/types";

/**
 * UI chrome copy. Domain content (projects, roles, services) lives in `src/data`
 * as `Localized` values — this file only covers labels, headings and helper text.
 * The `Dictionary` interface is what keeps `en` and `mn` structurally identical.
 */
export interface Dictionary {
  readonly meta: {
    readonly languageName: string;
    readonly languageShort: string;
  };
  readonly nav: {
    readonly menu: string;
    readonly close: string;
    readonly openCommand: string;
    readonly commandHint: string;
    readonly hireMe: string;
    readonly toggleTheme: string;
    readonly toggleLanguage: string;
    readonly backToTop: string;
  };
  readonly hero: {
    readonly greeting: string;
    readonly available: string;
    readonly viewWork: string;
    readonly buildQuote: string;
    readonly scroll: string;
    readonly basedIn: string;
    readonly localTime: string;
  };
  readonly about: {
    readonly eyebrow: string;
    readonly title: string;
    readonly focusTitle: string;
    readonly principlesTitle: string;
    readonly principles: readonly string[];
  };
  readonly skills: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
    readonly proficiency: string;
    readonly years: string;
    readonly all: string;
    readonly showing: string;
  };
  readonly experience: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
    readonly present: string;
    readonly highlights: string;
  };
  readonly work: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
    readonly search: string;
    readonly searchPlaceholder: string;
    readonly all: string;
    readonly clear: string;
    readonly empty: string;
    readonly emptyHint: string;
    readonly results: string;
    readonly caseStudy: string;
    readonly liveSite: string;
    readonly sourceCode: string;
    readonly role: string;
    readonly outcomes: string;
    readonly stack: string;
    readonly close: string;
    readonly featured: string;
    readonly sortBy: string;
    readonly sortNewest: string;
    readonly sortFeatured: string;
    readonly sortName: string;
  };
  readonly impact: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
    readonly activityTitle: string;
    readonly activityCaption: string;
    readonly shipped: string;
    readonly reviewed: string;
    readonly automated: string;
    readonly radarTitle: string;
    readonly radarCaption: string;
    readonly stackTitle: string;
    readonly stackCaption: string;
    readonly range12: string;
    readonly range6: string;
    readonly range3: string;
  };
  readonly pricing: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
    readonly service: string;
    readonly scope: string;
    readonly screens: string;
    readonly screensHint: string;
    readonly integrations: string;
    readonly integrationsHint: string;
    readonly addOns: string;
    readonly timeline: string;
    readonly support: string;
    readonly supportHint: string;
    readonly months: string;
    readonly noSupport: string;
    readonly eligibility: string;
    readonly currency: string;
    readonly estimate: string;
    readonly breakdown: string;
    readonly baseFee: string;
    readonly extraScreens: string;
    readonly integrationsLine: string;
    readonly speedAdjustment: string;
    readonly subtotal: string;
    readonly discount: string;
    readonly volumeDiscount: string;
    readonly projectTotal: string;
    readonly supportLine: string;
    readonly vat: string;
    readonly total: string;
    readonly deposit: string;
    readonly balance: string;
    readonly duration: string;
    readonly weeks: string;
    readonly reset: string;
    readonly sendBrief: string;
    readonly includes: string;
    readonly popular: string;
    readonly disclaimer: string;
    readonly shareOfTotal: string;
  };
  readonly testimonials: {
    readonly eyebrow: string;
    readonly title: string;
    readonly previous: string;
    readonly next: string;
  };
  readonly contact: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
    readonly name: string;
    readonly namePlaceholder: string;
    readonly email: string;
    readonly emailPlaceholder: string;
    readonly budget: string;
    readonly message: string;
    readonly messagePlaceholder: string;
    readonly send: string;
    readonly sending: string;
    readonly sent: string;
    readonly sentDetail: string;
    readonly sendAnother: string;
    readonly copyEmail: string;
    readonly copied: string;
    readonly directTitle: string;
    readonly responseTime: string;
    readonly responseValue: string;
    readonly quoteAttached: string;
    readonly errors: {
      readonly name: string;
      readonly email: string;
      readonly message: string;
    };
  };
  readonly command: {
    readonly placeholder: string;
    readonly sections: string;
    readonly actions: string;
    readonly projects: string;
    readonly empty: string;
    readonly navigate: string;
    readonly select: string;
    readonly dismiss: string;
    readonly toggleTheme: string;
    readonly switchLanguage: string;
    readonly copyEmail: string;
    readonly openGithub: string;
    readonly openLinkedin: string;
  };
  readonly footer: {
    readonly builtWith: string;
    readonly rights: string;
    readonly sourceNote: string;
  };
}

const en: Dictionary = {
  meta: { languageName: "English", languageShort: "EN" },
  nav: {
    menu: "Menu",
    close: "Close",
    openCommand: "Open command palette",
    commandHint: "Search",
    hireMe: "Start a project",
    toggleTheme: "Toggle theme",
    toggleLanguage: "Change language",
    backToTop: "Back to top",
  },
  hero: {
    greeting: "Hello, I am",
    available: "Available for select contracts",
    viewWork: "See the work",
    buildQuote: "Build an estimate",
    scroll: "Scroll",
    basedIn: "Based in",
    localTime: "Local time",
  },
  about: {
    eyebrow: "About",
    title: "Engineering that survives contact with production",
    focusTitle: "Where I spend my time",
    principlesTitle: "How I work",
    principles: [
      "Types first — if the compiler cannot check it, the reviewer will not either.",
      "Ship the boring deploy. Excitement belongs in the product, not the pipeline.",
      "Measure before optimising, then keep the measurement in CI.",
      "Leave a runbook. The system should outlive my involvement.",
    ],
  },
  skills: {
    eyebrow: "Toolkit",
    title: "The stack I reach for",
    subtitle:
      "Filter by domain to see the tools I use day to day, with honest proficiency and years in production.",
    proficiency: "Proficiency",
    years: "yrs",
    all: "Everything",
    showing: "tools",
  },
  experience: {
    eyebrow: "Track record",
    title: "Where I have been building",
    subtitle: "Four teams, one habit: leave the system easier to change than I found it.",
    present: "Present",
    highlights: "What I shipped",
  },
  work: {
    eyebrow: "Selected work",
    title: "Products in production",
    subtitle: "Search or filter by domain and stack. Open a project for the numbers behind it.",
    search: "Search projects",
    searchPlaceholder: "Search by name, stack or outcome",
    all: "All work",
    clear: "Clear filters",
    empty: "No projects match those filters.",
    emptyHint: "Try clearing the search or picking another domain.",
    results: "projects",
    caseStudy: "Case study",
    liveSite: "Live site",
    sourceCode: "Source",
    role: "My role",
    outcomes: "Outcomes",
    stack: "Stack",
    close: "Close case study",
    featured: "Featured",
    sortBy: "Sort",
    sortNewest: "Newest",
    sortFeatured: "Featured",
    sortName: "A–Z",
  },
  impact: {
    eyebrow: "Signals",
    title: "What the last year looked like",
    subtitle: "Engineering activity, domain balance and language mix — the numbers I actually track.",
    activityTitle: "Delivery activity",
    activityCaption: "Merged pull requests, reviews given, and manual hours removed each month.",
    shipped: "Shipped",
    reviewed: "Reviewed",
    automated: "Hours saved",
    radarTitle: "Domain balance",
    radarCaption: "Self-assessed depth across the five areas I work in.",
    stackTitle: "Language mix",
    stackCaption: "Share of code committed over the same period.",
    range12: "12 months",
    range6: "6 months",
    range3: "3 months",
  },
  pricing: {
    eyebrow: "Engagements",
    title: "Build an estimate in under a minute",
    subtitle:
      "Every number updates live from the same rules I quote with. No hidden line items, no discovery call required to get a range.",
    service: "Engagement type",
    scope: "Scope",
    screens: "Screens or surfaces",
    screensHint: "included in the base fee",
    integrations: "Third-party integrations",
    integrationsHint: "payments, auth, CRM, on-chain data",
    addOns: "Add-ons",
    timeline: "Pace",
    support: "Ongoing support",
    supportHint: "Monthly retainer after launch",
    months: "months",
    noSupport: "None",
    eligibility: "Eligibility",
    currency: "Currency",
    estimate: "Your estimate",
    breakdown: "Breakdown",
    baseFee: "Base fee",
    extraScreens: "Additional screens",
    integrationsLine: "Integrations",
    speedAdjustment: "Pace adjustment",
    subtotal: "Subtotal",
    discount: "Discount",
    volumeDiscount: "Volume discount",
    projectTotal: "Project total",
    supportLine: "Support retainer",
    vat: "VAT (10%)",
    total: "Total",
    deposit: "Deposit to start (40%)",
    balance: "Balance on delivery",
    duration: "Estimated duration",
    weeks: "weeks",
    reset: "Reset estimate",
    sendBrief: "Send this brief",
    includes: "Always included",
    popular: "Most requested",
    disclaimer:
      "Indicative only. Final scope is agreed in writing after a short call — this estimator uses the same rules as my real quotes.",
    shareOfTotal: "of total",
  },
  testimonials: {
    eyebrow: "References",
    title: "What the teams say",
    previous: "Previous quote",
    next: "Next quote",
  },
  contact: {
    eyebrow: "Contact",
    title: "Tell me what you are building",
    subtitle: "The fastest way in is a short brief. I answer every message myself.",
    name: "Name",
    namePlaceholder: "How should I address you?",
    email: "Email",
    emailPlaceholder: "you@company.com",
    budget: "Budget range",
    message: "Brief",
    messagePlaceholder: "What are you building, and what does done look like?",
    send: "Send brief",
    sending: "Sending",
    sent: "Brief received",
    sentDetail: "This demo keeps your message in the browser — nothing is transmitted anywhere.",
    sendAnother: "Write another",
    copyEmail: "Copy email",
    copied: "Copied",
    directTitle: "Direct lines",
    responseTime: "Typical reply",
    responseValue: "Within one business day",
    quoteAttached: "Estimate attached",
    errors: {
      name: "Please tell me your name.",
      email: "That email address does not look right.",
      message: "A sentence or two about the project helps.",
    },
  },
  command: {
    placeholder: "Jump to a section, project or action",
    sections: "Sections",
    actions: "Actions",
    projects: "Projects",
    empty: "Nothing matches that.",
    navigate: "navigate",
    select: "select",
    dismiss: "dismiss",
    toggleTheme: "Toggle theme",
    switchLanguage: "Switch to Mongolian",
    copyEmail: "Copy email address",
    openGithub: "Open GitHub profile",
    openLinkedin: "Open LinkedIn profile",
  },
  footer: {
    builtWith: "Built with Next.js, Tailwind CSS, Framer Motion and Recharts.",
    rights: "All rights reserved.",
    sourceNote: "Front-end only — every figure on this page comes from typed mock data.",
  },
};

const mn: Dictionary = {
  meta: { languageName: "Монгол", languageShort: "МН" },
  nav: {
    menu: "Цэс",
    close: "Хаах",
    openCommand: "Командын цонх нээх",
    commandHint: "Хайх",
    hireMe: "Төсөл эхлүүлэх",
    toggleTheme: "Загвар солих",
    toggleLanguage: "Хэл солих",
    backToTop: "Дээш буцах",
  },
  hero: {
    greeting: "Сайн байна уу, би",
    available: "Сонгосон төслүүдэд бэлэн",
    viewWork: "Ажлуудыг үзэх",
    buildQuote: "Үнэ тооцох",
    scroll: "Гүйлгэх",
    basedIn: "Байршил",
    localTime: "Орон нутгийн цаг",
  },
  about: {
    eyebrow: "Миний тухай",
    title: "Продакшнд тэсвэрлэдэг инженерчлэл",
    focusTitle: "Цагаа хаана зарцуулдаг вэ",
    principlesTitle: "Хэрхэн ажилладаг вэ",
    principles: [
      "Эхлээд тип — компилятор шалгаж чадахгүй бол хянагч ч барихгүй.",
      "Уйтгартай найдвартай deploy. Сэтгэл хөдлөл нь бүтээгдэхүүнд байх ёстой, урсгалд биш.",
      "Оновчлохын өмнө хэмж, дараа нь хэмжилтээ CI дотор үлдээ.",
      "Ажиллагааны заавар үлдээ. Систем миний оролцооноос урт наслах ёстой.",
    ],
  },
  skills: {
    eyebrow: "Хэрэгслүүд",
    title: "Миний ашигладаг стек",
    subtitle:
      "Салбараар шүүж, өдөр тутам ашигладаг хэрэгслүүдийг бодит түвшин, продакшн жилийн хамт үзээрэй.",
    proficiency: "Түвшин",
    years: "жил",
    all: "Бүгд",
    showing: "хэрэгсэл",
    },
  experience: {
    eyebrow: "Замнал",
    title: "Хаана бүтээж ирсэн бэ",
    subtitle: "Дөрвөн баг, нэг зарчим: системийг олж авснаасаа илүү өөрчлөхөд хялбар болгож үлдээх.",
    present: "Одоо",
    highlights: "Хийсэн ажлууд",
  },
  work: {
    eyebrow: "Сонгосон ажлууд",
    title: "Продакшнд ажиллаж буй бүтээгдэхүүнүүд",
    subtitle: "Салбар, стекээр шүүж хайгаарай. Төслийг нээвэл ард нь байгаа тоонууд харагдана.",
    search: "Төсөл хайх",
    searchPlaceholder: "Нэр, стек, үр дүнгээр хайх",
    all: "Бүх ажил",
    clear: "Шүүлтүүр цэвэрлэх",
    empty: "Энэ шүүлтүүрт тохирох төсөл алга.",
    emptyHint: "Хайлтаа цэвэрлэх эсвэл өөр салбар сонгож үзнэ үү.",
    results: "төсөл",
    caseStudy: "Дэлгэрэнгүй",
    liveSite: "Сайт руу",
    sourceCode: "Код",
    role: "Миний үүрэг",
    outcomes: "Үр дүн",
    stack: "Стек",
    close: "Хаах",
    featured: "Онцлох",
    sortBy: "Эрэмбэ",
    sortNewest: "Шинэ",
    sortFeatured: "Онцлох",
    sortName: "А–Я",
  },
  impact: {
    eyebrow: "Үзүүлэлт",
    title: "Сүүлийн нэг жил ямар байсан бэ",
    subtitle: "Инженерийн идэвх, салбарын тэнцвэр, хэлний харьцаа — миний үнэхээр хардаг тоонууд.",
    activityTitle: "Хүргэлтийн идэвх",
    activityCaption: "Сар бүрийн нэгтгэсэн pull request, хийсэн хяналт, хэмнэсэн гар ажлын цаг.",
    shipped: "Хүргэсэн",
    reviewed: "Хянасан",
    automated: "Хэмнэсэн цаг",
    radarTitle: "Салбарын тэнцвэр",
    radarCaption: "Ажилладаг таван чиглэл дэх өөрийн үнэлгээ.",
    stackTitle: "Хэлний харьцаа",
    stackCaption: "Мөн хугацаанд бичсэн кодын хувь.",
    range12: "12 сар",
    range6: "6 сар",
    range3: "3 сар",
  },
  pricing: {
    eyebrow: "Хамтын ажиллагаа",
    title: "Нэг минутын дотор үнийн тооцоо гарга",
    subtitle:
      "Бүх тоо миний бодит үнийн дүрмээр шууд шинэчлэгдэнэ. Нуугдмал зардал байхгүй, зөвхөн хүрээ мэдэхэд уулзалт шаардлагагүй.",
    service: "Ажлын төрөл",
    scope: "Хамрах хүрээ",
    screens: "Дэлгэц буюу хуудас",
    screensHint: "суурь төлбөрт багтсан",
    integrations: "Гуравдагч талын холболт",
    integrationsHint: "төлбөр, нэвтрэлт, CRM, on-chain өгөгдөл",
    addOns: "Нэмэлт",
    timeline: "Хурд",
    support: "Дараах дэмжлэг",
    supportHint: "Нэвтрүүлсний дараах сарын үйлчилгээ",
    months: "сар",
    noSupport: "Байхгүй",
    eligibility: "Тусгай нөхцөл",
    currency: "Валют",
    estimate: "Таны тооцоо",
    breakdown: "Задаргаа",
    baseFee: "Суурь төлбөр",
    extraScreens: "Нэмэлт дэлгэц",
    integrationsLine: "Холболтууд",
    speedAdjustment: "Хурдны тохируулга",
    subtotal: "Дүн",
    discount: "Хөнгөлөлт",
    volumeDiscount: "Хэмжээний хөнгөлөлт",
    projectTotal: "Төслийн дүн",
    supportLine: "Дэмжлэгийн төлбөр",
    vat: "НӨАТ (10%)",
    total: "Нийт",
    deposit: "Эхлэхэд төлөх (40%)",
    balance: "Хүлээлгэн өгөхөд",
    duration: "Тооцоолсон хугацаа",
    weeks: "долоо хоног",
    reset: "Тооцоог шинэчлэх",
    sendBrief: "Энэ тооцоог илгээх",
    includes: "Үргэлж багтдаг",
    popular: "Хамгийн эрэлттэй",
    disclaimer:
      "Зөвхөн чиглүүлэх зорилготой. Эцсийн хүрээ богино уулзалтын дараа бичгээр тохирно — энэ тооцоолол бодит үнийн дүрмээр ажиллана.",
    shareOfTotal: "нийт дүнгээс",
  },
  testimonials: {
    eyebrow: "Санал",
    title: "Багууд юу гэж хэлдэг вэ",
    previous: "Өмнөх",
    next: "Дараах",
  },
  contact: {
    eyebrow: "Холбоо барих",
    title: "Юу бүтээж байгаагаа хэлээрэй",
    subtitle: "Хамгийн хурдан зам бол богино танилцуулга. Би мессеж бүрт өөрөө хариулдаг.",
    name: "Нэр",
    namePlaceholder: "Танд хэрхэн хандах вэ?",
    email: "И-мэйл",
    emailPlaceholder: "ta@company.com",
    budget: "Төсвийн хүрээ",
    message: "Танилцуулга",
    messagePlaceholder: "Юу бүтээж байна, амжилт гэдэг нь юу вэ?",
    send: "Илгээх",
    sending: "Илгээж байна",
    sent: "Хүлээн авлаа",
    sentDetail: "Энэ жишээ хувилбар мессежийг зөвхөн хөтөч дотор хадгална — хаашаа ч дамжуулахгүй.",
    sendAnother: "Дахин бичих",
    copyEmail: "И-мэйл хуулах",
    copied: "Хуулагдлаа",
    directTitle: "Шууд холбоо",
    responseTime: "Ердийн хариу",
    responseValue: "Нэг ажлын өдрийн дотор",
    quoteAttached: "Тооцоо хавсаргасан",
    errors: {
      name: "Нэрээ бичнэ үү.",
      email: "И-мэйл хаяг буруу байна.",
      message: "Төслийн талаар нэг хоёр өгүүлбэр бичвэл тустай.",
    },
  },
  command: {
    placeholder: "Хэсэг, төсөл, үйлдэл рүү шилжих",
    sections: "Хэсгүүд",
    actions: "Үйлдлүүд",
    projects: "Төслүүд",
    empty: "Тохирох зүйл олдсонгүй.",
    navigate: "шилжих",
    select: "сонгох",
    dismiss: "хаах",
    toggleTheme: "Загвар солих",
    switchLanguage: "Англи руу шилжих",
    copyEmail: "И-мэйл хуулах",
    openGithub: "GitHub профайл нээх",
    openLinkedin: "LinkedIn профайл нээх",
  },
  footer: {
    builtWith: "Next.js, Tailwind CSS, Framer Motion, Recharts дээр бүтээв.",
    rights: "Бүх эрх хуулиар хамгаалагдсан.",
    sourceNote: "Зөвхөн frontend — энэ хуудасны бүх тоо типтэй mock өгөгдлөөс гарна.",
  },
};

export const dictionaries: Readonly<Record<Language, Dictionary>> = { en, mn };

export function getDictionary(language: Language): Dictionary {
  return dictionaries[language];
}
