import type { ExperienceEntry } from "@/types";

/**
 * Newest first. `end: null` marks a role that is still running. Copy follows
 * Duke's own work history; add `highlights` only for things that can be checked.
 */
export const experience: readonly ExperienceEntry[] = [
  {
    id: "mongol-content",
    role: { en: "Software Developer", mn: "Программ хангамжийн хөгжүүлэгч" },
    company: "Mongol Content",
    companyUrl: "https://mongolcontent.mn",
    location: { en: "Ulaanbaatar", mn: "Улаанбаатар" },
    start: "2026-02",
    end: null,
    summary: {
      en: "Full-stack, AI and DevOps work on Gogo.mn and Sonsy: scalable applications, and AI features running in production.",
      mn: "Gogo.mn болон Sonsy дээр full-stack, AI, DevOps чиглэлээр ажиллаж, өргөтгөх боломжтой аппликейшн бүтээж, AI боломжуудыг продакшнд ажиллуулдаг.",
    },
    stack: [
      "Next.js",
      "NestJS",
      "Laravel",
      "Python",
      "FastAPI",
      "MySQL",
      "Qdrant",
      "OpenAI",
      "TensorFlow",
      "Docker",
      "AWS",
    ],
  },
  {
    id: "mobicom",
    role: { en: "Software Developer", mn: "Программ хангамжийн хөгжүүлэгч" },
    company: "MobiCom",
    companyUrl: "https://www.mobicom.mn",
    location: { en: "Ulaanbaatar", mn: "Улаанбаатар" },
    start: "2026-01",
    end: null,
    summary: {
      en: "Full-stack, machine learning and DevOps work on enterprise systems for telecom infrastructure.",
      mn: "Телеком дэд бүтцийн байгууллагын системүүд дээр full-stack, машин сургалт, DevOps чиглэлээр ажилладаг.",
    },
    stack: ["Laravel", "Next.js", "NestJS", "Python", "Kubernetes"],
  },
  {
    id: "erchimlabs",
    role: { en: "Blockchain & AI Expert", mn: "Блокчейн & AI мэргэжилтэн" },
    company: "ErchimLabs",
    companyUrl: null,
    location: { en: "Hybrid", mn: "Хосолсон" },
    start: "2025-01",
    end: "2026-01",
    summary: {
      en: "Blockchain and backend development across web3 and web2, designing products that combine the two, and automating the work around them with AI.",
      mn: "Web3 болон web2 дээр блокчейн, backend хөгжүүлэлт хийж, хоёуланг хослуулсан шийдэл зохион бүтээж, эргэн тойрны ажлыг AI-аар автоматжуулсан.",
    },
    stack: [
      "Solidity",
      "Ethereum",
      "Hardhat",
      "Web3.js",
      "Node.js",
      "Bitcoin.js",
      "PostgreSQL",
      "Python",
      "TensorFlow",
      "Hugging Face",
    ],
  },
  {
    id: "numadlabs",
    role: { en: "Backend Developer", mn: "Backend хөгжүүлэгч" },
    company: "NumadLabs",
    companyUrl: null,
    location: { en: "Hybrid", mn: "Хосолсон" },
    start: "2024-01",
    end: "2025-01",
    summary: {
      en: "Blockchain and backend development across web3 and web2, designing products that combine the two.",
      mn: "Web3 болон web2 дээр блокчейн, backend хөгжүүлэлт хийж, хоёуланг хослуулсан шийдэл зохион бүтээсэн.",
    },
    stack: ["Solidity", "Ethereum", "Hardhat", "Web3.js", "Node.js", "Bitcoin.js", "PostgreSQL"],
  },
];
