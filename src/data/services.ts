import type { AddOn, DiscountRule, Service, TimelineOption, VolumeTier } from "@/types";

/**
 * Pricing catalogue for the estimator. Every number here is a real input to
 * `buildQuote` in `src/lib/pricing.ts` — the rules are documented in README.md.
 * All amounts are USD.
 */
export const services: readonly Service[] = [
  {
    id: "landing",
    name: { en: "Landing & Marketing Site", mn: "Лендинг & Маркетингийн сайт" },
    summary: {
      en: "A fast, animated marketing site with a CMS-ready content layer.",
      mn: "CMS-д бэлэн контентын давхаргатай, хурдан, хөдөлгөөнтэй маркетингийн сайт.",
    },
    icon: "layout",
    basePrice: 1800,
    includedScreens: 4,
    maxScreens: 14,
    pricePerScreen: 220,
    baseWeeks: 2,
    weeksPerScreen: 0.2,
    deliverables: {
      en: [
        "Design system, responsive layouts and motion pass",
        "Static rendering with a Lighthouse budget agreed up front",
        "Analytics events and SEO metadata wired in",
      ],
      mn: [
        "Дизайн систем, responsive layout, хөдөлгөөний тохиргоо",
        "Урьдчилан тохирсон Lighthouse үзүүлэлттэй статик рендер",
        "Аналитик event болон SEO мета өгөгдөл",
      ],
    },
    popular: false,
  },
  {
    id: "webapp",
    name: { en: "Full-Stack Product Build", mn: "Full-Stack бүтээгдэхүүн" },
    summary: {
      en: "An end-to-end product: typed API, database design, and the app on top.",
      mn: "Бүрэн бүтээгдэхүүн: типтэй API, өгөгдлийн сангийн загвар, түүн дээрх апп.",
    },
    icon: "layers",
    basePrice: 7200,
    includedScreens: 8,
    maxScreens: 32,
    pricePerScreen: 380,
    baseWeeks: 6,
    weeksPerScreen: 0.35,
    deliverables: {
      en: [
        "Schema design, migrations and seed data",
        "Typed API with contract tests and error budgets",
        "CI pipeline, staging environment and deployment runbook",
      ],
      mn: [
        "Схемийн загвар, migration болон seed өгөгдөл",
        "Гэрээний тесттэй типтэй API, алдааны хязгаар",
        "CI урсгал, staging орчин, deploy заавар",
      ],
    },
    popular: true,
  },
  {
    id: "ai",
    name: { en: "AI Integration & Automation", mn: "AI нэвтрүүлэлт & Автоматжуулалт" },
    summary: {
      en: "Retrieval, classification or generation built into an existing product.",
      mn: "Одоо байгаа бүтээгдэхүүнд retrieval, ангилал, текст үүсгэлт нэвтрүүлэх.",
    },
    icon: "brain",
    basePrice: 5400,
    includedScreens: 5,
    maxScreens: 20,
    pricePerScreen: 340,
    baseWeeks: 4,
    weeksPerScreen: 0.3,
    deliverables: {
      en: [
        "Evaluation harness with a labelled set before any model ships",
        "Embedding store, ranking logic and fallback behaviour",
        "Cost and latency dashboards for every model call",
      ],
      mn: [
        "Загвар нэвтрүүлэхээс өмнө шошготой өгөгдөл дээрх үнэлгээний систем",
        "Embedding сан, эрэмбэлэх логик, нөөц горим",
        "Загварын дуудлага бүрийн зардал, хугацааны хяналт",
      ],
    },
    popular: false,
  },
  {
    id: "blockchain",
    name: { en: "Smart Contract & Web3", mn: "Ухаалаг гэрээ & Web3" },
    summary: {
      en: "Contracts, indexers and wallet flows written audit-first.",
      mn: "Аудитыг эхэнд тавьж бичсэн гэрээ, индексер, түрийвчний урсгал.",
    },
    icon: "blocks",
    basePrice: 8600,
    includedScreens: 6,
    maxScreens: 24,
    pricePerScreen: 420,
    baseWeeks: 7,
    weeksPerScreen: 0.4,
    deliverables: {
      en: [
        "Contracts with unit, fork and invariant test suites",
        "Indexer with reorg-safe writes and a typed query layer",
        "Deployment scripts, verification and an incident playbook",
      ],
      mn: [
        "Unit, fork, invariant тесттэй ухаалаг гэрээ",
        "Reorg-д тэсвэртэй индексер, типтэй асуулгын давхарга",
        "Deploy скрипт, баталгаажуулалт, ослын журам",
      ],
    },
    popular: false,
  },
  {
    id: "audit",
    name: { en: "Architecture Review", mn: "Архитектурын шинжилгээ" },
    summary: {
      en: "A written review of an existing codebase with a prioritised plan.",
      mn: "Одоо байгаа кодын бичгэн шинжилгээ, эрэмбэлсэн төлөвлөгөө.",
    },
    icon: "search",
    basePrice: 2600,
    includedScreens: 3,
    maxScreens: 10,
    pricePerScreen: 260,
    baseWeeks: 2,
    weeksPerScreen: 0.25,
    deliverables: {
      en: [
        "Written findings ranked by risk and effort",
        "Benchmarks for the paths that actually hurt",
        "A migration plan your team can execute without me",
      ],
      mn: [
        "Эрсдэл, хүчин чармайлтаар эрэмбэлсэн бичгэн дүгнэлт",
        "Бодитоор асуудалтай хэсгүүдийн хэмжилт",
        "Багийнхан минийгүйгээр хэрэгжүүлж чадах шилжилтийн төлөвлөгөө",
      ],
    },
    popular: false,
  },
];

export const addOns: readonly AddOn[] = [
  {
    id: "designSystem",
    name: { en: "Design system", mn: "Дизайн систем" },
    description: {
      en: "Tokens, primitives and documented components instead of one-off screens.",
      mn: "Нэг удаагийн дэлгэц биш, токен, primitive, баримтжуулсан компонентууд.",
    },
    flatPrice: 0,
    basePercent: 0.18,
    weeks: 1,
  },
  {
    id: "i18n",
    name: { en: "Multi-language", mn: "Олон хэл" },
    description: {
      en: "Typed dictionaries, locale routing and translated content workflows.",
      mn: "Типтэй толь бичиг, хэлний routing, орчуулгын ажлын урсгал.",
    },
    flatPrice: 1100,
    basePercent: 0,
    weeks: 0.5,
  },
  {
    id: "analytics",
    name: { en: "Analytics & dashboards", mn: "Аналитик & Dashboard" },
    description: {
      en: "Event schema, funnels and a dashboard the team will actually open.",
      mn: "Event схем, funnel болон баг үнэхээр нээдэг dashboard.",
    },
    flatPrice: 800,
    basePercent: 0.05,
    weeks: 0.5,
  },
  {
    id: "cms",
    name: { en: "Headless CMS", mn: "Headless CMS" },
    description: {
      en: "Editor-friendly content modelling with preview and scheduled publishing.",
      mn: "Урьдчилан харах, товлон нийтлэх боломжтой контентын загварчлал.",
    },
    flatPrice: 1500,
    basePercent: 0,
    weeks: 1,
  },
  {
    id: "handover",
    name: { en: "Handover & training", mn: "Хүлээлгэн өгөх & Сургалт" },
    description: {
      en: "Architecture walkthrough, runbooks and two live sessions with your team.",
      mn: "Архитектурын танилцуулга, ажиллагааны заавар, багтай хийх хоёр удаагийн уулзалт.",
    },
    flatPrice: 650,
    basePercent: 0,
    weeks: 0.5,
  },
];

export const timelineOptions: readonly TimelineOption[] = [
  {
    id: "standard",
    name: { en: "Standard", mn: "Энгийн" },
    description: {
      en: "Normal cadence, shared with one other engagement.",
      mn: "Хэвийн хэмнэл, өөр нэг төслийн хамт.",
    },
    priceMultiplier: 1,
    durationMultiplier: 1,
  },
  {
    id: "priority",
    name: { en: "Priority", mn: "Тэргүүн ээлж" },
    description: {
      en: "First in the queue, same-day replies on weekdays.",
      mn: "Дараалалд эхэнд, ажлын өдөр тэр өдөртөө хариу.",
    },
    priceMultiplier: 1.15,
    durationMultiplier: 0.8,
  },
  {
    id: "rush",
    name: { en: "Rush", mn: "Яаралтай" },
    description: {
      en: "Sole focus until delivery, including evenings when it matters.",
      mn: "Хүргэх хүртэл зөвхөн энэ төсөл дээр, шаардлагатай үед оройн цагаар ч.",
    },
    priceMultiplier: 1.35,
    durationMultiplier: 0.65,
  },
];

export const discountRules: readonly DiscountRule[] = [
  {
    id: "nonprofit",
    name: { en: "Non-profit or education", mn: "Ашгийн бус эсвэл боловсрол" },
    description: {
      en: "Registered non-profits, universities and public-interest projects.",
      mn: "Бүртгэлтэй ашгийн бус байгууллага, их сургууль, нийтийн ашиг сонирхлын төсөл.",
    },
    rate: 0.15,
  },
  {
    id: "openSource",
    name: { en: "Open source", mn: "Нээлттэй эх" },
    description: {
      en: "The deliverable ships under an OSI-approved licence.",
      mn: "Үр дүн нь OSI-аар зөвшөөрөгдсөн лицензээр нийтлэгдэнэ.",
    },
    rate: 0.1,
  },
];

/** Highest matching tier wins; thresholds are compared against the scoped subtotal. */
export const volumeTiers: readonly VolumeTier[] = [
  { threshold: 10000, rate: 0.05 },
  { threshold: 20000, rate: 0.1 },
];

/** Ceiling on all stacked discounts, as a share of the scoped subtotal. */
export const MAX_DISCOUNT_RATE = 0.2;

/** Monthly support is billed as a share of the discounted project subtotal. */
export const SUPPORT_MONTHLY_RATE = 0.12;
export const SUPPORT_MONTHLY_MINIMUM = 400;
export const SUPPORT_MONTH_OPTIONS: readonly number[] = [0, 3, 6, 12];

/** Mongolian VAT, applied to the discounted project total plus support. */
export const VAT_RATE = 0.1;

/** Share of the grand total invoiced before work starts. */
export const DEPOSIT_RATE = 0.4;

/** Fixed display rate. No live FX call — this is a front-end-only app. */
export const USD_TO_MNT = 3450;

export const MAX_INTEGRATIONS = 8;
export const PRICE_PER_INTEGRATION = 520;
export const WEEKS_PER_INTEGRATION = 0.25;
export const MIN_PROJECT_WEEKS = 1;
