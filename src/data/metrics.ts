import type { ActivityPoint, DomainScore, HeadlineStat, StackShare } from "@/types";

/**
 * Deterministic engineering-activity series for the last twelve months.
 * `shipped` = merged pull requests, `reviewed` = reviews left on other people's
 * work, `automated` = manual hours removed by automation that month.
 */
export const activitySeries: readonly ActivityPoint[] = [
  { month: "Oct", shipped: 34, reviewed: 41, automated: 12 },
  { month: "Nov", shipped: 41, reviewed: 38, automated: 15 },
  { month: "Dec", shipped: 28, reviewed: 30, automated: 11 },
  { month: "Jan", shipped: 46, reviewed: 44, automated: 18 },
  { month: "Feb", shipped: 52, reviewed: 49, automated: 21 },
  { month: "Mar", shipped: 48, reviewed: 53, automated: 24 },
  { month: "Apr", shipped: 57, reviewed: 47, automated: 26 },
  { month: "May", shipped: 63, reviewed: 58, automated: 29 },
  { month: "Jun", shipped: 59, reviewed: 61, automated: 31 },
  { month: "Jul", shipped: 68, reviewed: 55, automated: 34 },
  { month: "Aug", shipped: 72, reviewed: 64, automated: 38 },
  { month: "Sep", shipped: 66, reviewed: 60, automated: 41 },
];

/** Share of committed code by language, in percent. Sums to 100. */
export const stackShare: readonly StackShare[] = [
  { name: "TypeScript", share: 34, accent: "#3178C6" },
  { name: "Python", share: 27, accent: "#3776AB" },
  { name: "Solidity", share: 14, accent: "#8b8b8b" },
  { name: "SQL", share: 12, accent: "#336791" },
  { name: "PHP", share: 8, accent: "#777BB4" },
  { name: "Shell", share: 5, accent: "#89e051" },
];

export const domainScores: readonly DomainScore[] = [
  { domain: "ai", label: { en: "AI / ML", mn: "AI / ML" }, score: 84 },
  { domain: "blockchain", label: { en: "Blockchain", mn: "Блокчейн" }, score: 79 },
  { domain: "backend", label: { en: "Backend", mn: "Backend" }, score: 87 },
  { domain: "frontend", label: { en: "Frontend", mn: "Frontend" }, score: 88 },
  { domain: "devops", label: { en: "DevOps", mn: "DevOps" }, score: 78 },
];

export const headlineStats: readonly HeadlineStat[] = [
  {
    id: "experience",
    label: { en: "Years shipping", mn: "Продакшн туршлага" },
    value: 6,
    suffix: "+",
    decimals: 0,
    caption: {
      en: "Backend, AI and web3 work in production, not prototypes.",
      mn: "Прототип биш, продакшнд ажилладаг backend, AI, web3 систем.",
    },
  },
  {
    id: "reach",
    label: { en: "Monthly reach", mn: "Сарын хүрээ" },
    value: 2.4,
    suffix: "M",
    decimals: 1,
    caption: {
      en: "People served by platforms I help run every month.",
      mn: "Миний хөгжүүлдэг платформуудыг сар бүр ашигладаг хүмүүс.",
    },
  },
  {
    id: "automation",
    label: { en: "Hours automated", mn: "Автоматжуулсан цаг" },
    value: 300,
    suffix: "+",
    decimals: 0,
    caption: {
      en: "Manual work removed from editorial and ops teams this year.",
      mn: "Энэ жил редакц, үйл ажиллагааны багаас хассан гар ажиллагаа.",
    },
  },
  {
    id: "uptime",
    label: { en: "Uptime held", mn: "Тогтвортой ажиллагаа" },
    value: 99.95,
    suffix: "%",
    decimals: 2,
    caption: {
      en: "Across the services I am on call for.",
      mn: "Миний хариуцдаг сервисүүдийн хэмжээнд.",
    },
  },
];
