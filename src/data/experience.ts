import type { ExperienceEntry } from "@/types";

/** Newest first. `end: null` marks a role that is still running. */
export const experience: readonly ExperienceEntry[] = [
  {
    id: "mongol-content",
    role: { en: "Software Developer", mn: "Программ хангамжийн хөгжүүлэгч" },
    company: "Mongol Content LLC",
    companyUrl: "https://gogo.mn",
    location: { en: "Ulaanbaatar, Mongolia", mn: "Улаанбаатар, Монгол" },
    start: "2026-02",
    end: null,
    summary: {
      en: "Full-stack and AI work across the Gogo media group: news delivery, newsletters and editorial automation.",
      mn: "Gogo медиа группын full-stack болон AI ажил: мэдээ хүргэлт, мэдээллийн товхимол, редакцын автоматжуулалт.",
    },
    highlights: {
      en: [
        "Rebuilt the newsletter delivery engine around a queue-driven FastAPI service with idempotent sends.",
        "Shipped an article monitoring pipeline that classifies and de-duplicates incoming wire content.",
        "Moved the reader-facing app to a typed Next.js frontend backed by NestJS APIs.",
      ],
      mn: [
        "Мэдээллийн товхимлын систем дараалалд суурилсан FastAPI сервис болгон дахин бүтээж, давхардалгүй илгээлт хийсэн.",
        "Ирж буй мэдээг ангилж, давхардлыг арилгадаг хяналтын урсгалыг нэвтрүүлсэн.",
        "Уншигчийн апп-ыг NestJS API-тай холбогдсон типтэй Next.js frontend рүү шилжүүлсэн.",
      ],
    },
    stack: ["Next.js", "NestJS", "Laravel", "FastAPI", "PostgreSQL", "Redis", "Docker"],
  },
  {
    id: "mobicom",
    role: { en: "Software Developer", mn: "Программ хангамжийн хөгжүүлэгч" },
    company: "MobiCom Corporation",
    companyUrl: "https://www.mobicom.mn",
    location: { en: "Ulaanbaatar, Mongolia", mn: "Улаанбаатар, Монгол" },
    start: "2026-01",
    end: null,
    summary: {
      en: "Enterprise systems for telecom infrastructure — internal tooling, ML forecasting and delivery pipelines.",
      mn: "Телеком дэд бүтцийн корпорацийн систем — дотоод хэрэгсэл, ML урьдчилсан таамаглал, deploy урсгал.",
    },
    highlights: {
      en: [
        "Built forecasting models for network capacity planning and exposed them through an internal API.",
        "Standardised CI/CD across services so releases stopped depending on individual laptops.",
        "Introduced typed contracts between legacy Laravel services and new Next.js dashboards.",
      ],
      mn: [
        "Сүлжээний багтаамжийн төлөвлөлтөд зориулж таамаглалын загвар бүтээж, дотоод API болгон нээсэн.",
        "Сервис бүрт CI/CD-г нэгтгэж, релиз хувь хүний компьютерээс хамаарахаа болиулсан.",
        "Хуучин Laravel сервис болон шинэ Next.js dashboard хооронд типтэй гэрээ нэвтрүүлсэн.",
      ],
    },
    stack: ["Laravel", "Next.js", "Python", "Kubernetes", "GitHub Actions", "Grafana"],
  },
  {
    id: "erchimlabs",
    role: { en: "Blockchain & AI Engineer", mn: "Блокчейн & AI инженер" },
    company: "ErchimLabs",
    companyUrl: "https://github.com/dgduksict",
    location: { en: "Hybrid", mn: "Хосолсон" },
    start: "2025-01",
    end: "2026-01",
    summary: {
      en: "Hybrid web2/web3 product work with an automation layer built on top of open models.",
      mn: "Web2/web3 хосолсон бүтээгдэхүүн, нээлттэй загвар дээр суурилсан автоматжуулалтын давхарга.",
    },
    highlights: {
      en: [
        "Designed contract + indexer pairs so on-chain state could be queried like an ordinary database.",
        "Automated report generation for token operations, cutting a weekly manual routine to minutes.",
        "Ran the internal review process for every contract change before mainnet deploys.",
      ],
      mn: [
        "Гэрээ болон индексерийг хослуулан зохион байгуулж, on-chain өгөгдлийг энгийн мэдээллийн сан шиг асуух боломжтой болгосон.",
        "Токены үйл ажиллагааны тайланг автоматжуулж, долоо хоногийн гар ажлыг минут болгон багасгасан.",
        "Mainnet deploy бүрийн өмнөх дотоод хяналтын процессыг удирдсан.",
      ],
    },
    stack: ["Solidity", "Hardhat", "viem", "Node.js", "Python", "Hugging Face"],
  },
  {
    id: "numadlabs",
    role: { en: "Backend Developer", mn: "Backend хөгжүүлэгч" },
    company: "NumadLabs",
    companyUrl: "https://www.numadlabs.com",
    location: { en: "Hybrid", mn: "Хосолсон" },
    start: "2024-01",
    end: "2025-01",
    summary: {
      en: "Backend and smart-contract development for consumer web3 products bridging Bitcoin and EVM chains.",
      mn: "Bitcoin болон EVM сүлжээг холбосон хэрэглэгчийн web3 бүтээгдэхүүний backend, ухаалаг гэрээний хөгжүүлэлт.",
    },
    highlights: {
      en: [
        "Implemented PSBT-based Bitcoin flows alongside EVM minting in a single typed backend.",
        "Modelled ownership and royalty rules in Postgres so the app never queried a node on the hot path.",
        "Wrote the regression suite that gated every release of the contract package.",
      ],
      mn: [
        "PSBT дээр суурилсан Bitcoin урсгалыг EVM mint-тэй нэг типтэй backend дотор нэгтгэсэн.",
        "Эзэмшил, royalty дүрмийг Postgres-д загварчилж, апп нь hot path дээр node руу хандахаа больсон.",
        "Гэрээний багц релиз бүрийг хамгаалдаг regression тестийн багц бичсэн.",
      ],
    },
    stack: ["Node.js", "TypeScript", "Solidity", "bitcoinjs-lib", "PostgreSQL", "AWS"],
  },
];
