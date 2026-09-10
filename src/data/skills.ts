import type { Skill, SkillGroup } from "@/types";

/**
 * Deterministic skill inventory. `level` is a self-assessed 0-100 proficiency
 * and `years` is hands-on production experience — both drive the radar chart
 * and the proficiency meters, so they must stay in sync with the domains.
 */
export const skills: readonly Skill[] = [
  // AI ---------------------------------------------------------------------
  { id: "python", name: "Python", domain: "ai", level: 94, years: 6, url: "https://www.python.org/", accent: "#3776AB" },
  { id: "pytorch", name: "PyTorch", domain: "ai", level: 82, years: 3, url: "https://pytorch.org/", accent: "#EE4C2C" },
  { id: "tensorflow", name: "TensorFlow", domain: "ai", level: 78, years: 3, url: "https://www.tensorflow.org/", accent: "#FF6F00" },
  { id: "huggingface", name: "Hugging Face", domain: "ai", level: 86, years: 3, url: "https://huggingface.co/", accent: "#FFCC4D" },
  { id: "langchain", name: "LangChain", domain: "ai", level: 80, years: 2, url: "https://www.langchain.com/", accent: "#1A7BFF" },
  { id: "pgvector", name: "pgvector", domain: "ai", level: 84, years: 2, url: "https://github.com/pgvector/pgvector", accent: "#4B8BBE" },

  // Blockchain -------------------------------------------------------------
  { id: "solidity", name: "Solidity", domain: "blockchain", level: 88, years: 4, url: "https://soliditylang.org/", accent: "#7B7B7B" },
  { id: "hardhat", name: "Hardhat", domain: "blockchain", level: 85, years: 4, url: "https://hardhat.org/", accent: "#F4C542" },
  { id: "viem", name: "viem / wagmi", domain: "blockchain", level: 82, years: 3, url: "https://viem.sh/", accent: "#F16822" },
  { id: "bitcoinjs", name: "bitcoinjs-lib", domain: "blockchain", level: 76, years: 2, url: "https://github.com/bitcoinjs/bitcoinjs-lib", accent: "#F7931A" },
  { id: "foundry", name: "Foundry", domain: "blockchain", level: 74, years: 2, url: "https://book.getfoundry.sh/", accent: "#B4A078" },
  { id: "ipfs", name: "IPFS", domain: "blockchain", level: 70, years: 3, url: "https://ipfs.tech/", accent: "#65C2CB" },

  // Backend ----------------------------------------------------------------
  { id: "nodejs", name: "Node.js", domain: "backend", level: 92, years: 6, url: "https://nodejs.org/en", accent: "#68A063" },
  { id: "nestjs", name: "NestJS", domain: "backend", level: 88, years: 4, url: "https://nestjs.com/", accent: "#E0234E" },
  { id: "fastapi", name: "FastAPI", domain: "backend", level: 86, years: 3, url: "https://fastapi.tiangolo.com/", accent: "#009688" },
  { id: "laravel", name: "Laravel", domain: "backend", level: 80, years: 3, url: "https://laravel.com/", accent: "#FF2D20" },
  { id: "postgres", name: "PostgreSQL", domain: "backend", level: 90, years: 6, url: "https://www.postgresql.org/", accent: "#336791" },
  { id: "redis", name: "Redis", domain: "backend", level: 84, years: 5, url: "https://redis.io/", accent: "#DC382D" },

  // Frontend ---------------------------------------------------------------
  { id: "typescript", name: "TypeScript", domain: "frontend", level: 93, years: 6, url: "https://www.typescriptlang.org/", accent: "#3178C6" },
  { id: "nextjs", name: "Next.js", domain: "frontend", level: 90, years: 5, url: "https://nextjs.org/", accent: "#8B8B8B" },
  { id: "react", name: "React", domain: "frontend", level: 91, years: 6, url: "https://react.dev/", accent: "#61DAFB" },
  { id: "tailwind", name: "Tailwind CSS", domain: "frontend", level: 89, years: 4, url: "https://tailwindcss.com/", accent: "#06B6D4" },
  { id: "framer-motion", name: "Framer Motion", domain: "frontend", level: 81, years: 3, url: "https://www.framer.com/motion/", accent: "#0055FF" },
  { id: "zustand", name: "Zustand", domain: "frontend", level: 83, years: 3, url: "https://zustand.docs.pmnd.rs/", accent: "#A0714F" },

  // DevOps -----------------------------------------------------------------
  { id: "docker", name: "Docker", domain: "devops", level: 88, years: 5, url: "https://www.docker.com/", accent: "#2496ED" },
  { id: "kubernetes", name: "Kubernetes", domain: "devops", level: 74, years: 3, url: "https://kubernetes.io/", accent: "#326CE5" },
  { id: "aws", name: "AWS", domain: "devops", level: 80, years: 4, url: "https://aws.amazon.com/", accent: "#FF9900" },
  { id: "githubactions", name: "GitHub Actions", domain: "devops", level: 86, years: 4, url: "https://github.com/features/actions", accent: "#9B8AFB" },
  { id: "grafana", name: "Grafana", domain: "devops", level: 72, years: 3, url: "https://grafana.com/", accent: "#F46800" },
  { id: "terraform", name: "Terraform", domain: "devops", level: 68, years: 2, url: "https://www.terraform.io/", accent: "#844FBA" },
];

const groupMeta = {
  ai: {
    title: { en: "AI & Machine Learning", mn: "AI & Машин сургалт" },
    summary: {
      en: "Retrieval, classification and generation pipelines that run on a schedule and get evaluated.",
      mn: "Тогтмол ажиллаж, үнэлэгддэг retrieval, ангилал, текст үүсгэх системүүд.",
    },
  },
  blockchain: {
    title: { en: "Blockchain & Web3", mn: "Блокчейн & Web3" },
    summary: {
      en: "Contracts, indexers and wallet flows for both EVM chains and Bitcoin tooling.",
      mn: "EVM болон Bitcoin дээрх ухаалаг гэрээ, индексер, түрийвчний урсгал.",
    },
  },
  backend: {
    title: { en: "Backend Engineering", mn: "Backend инженерчлэл" },
    summary: {
      en: "Typed services, queues and schemas designed for the traffic that actually arrives.",
      mn: "Бодит ачааллыг тооцоолсон типтэй сервис, дараалал, өгөгдлийн схем.",
    },
  },
  frontend: {
    title: { en: "Product Frontend", mn: "Бүтээгдэхүүний Frontend" },
    summary: {
      en: "Interfaces that stay fast and accessible while still feeling designed.",
      mn: "Хурдан, хүртээмжтэй хэвээр дизайны амттай интерфэйсүүд.",
    },
  },
  devops: {
    title: { en: "Platform & DevOps", mn: "Платформ & DevOps" },
    summary: {
      en: "Reproducible builds, boring deploys and dashboards that answer questions.",
      mn: "Давтагдах build, уйтгартай найдвартай deploy, хариулт өгдөг dashboard.",
    },
  },
} as const;

export const skillGroups: readonly SkillGroup[] = (
  Object.keys(groupMeta) as (keyof typeof groupMeta)[]
).map((domain) => ({
  domain,
  title: groupMeta[domain].title,
  summary: groupMeta[domain].summary,
  skills: skills.filter((skill) => skill.domain === domain),
}));

export const marqueeSkills: readonly Skill[] = skills.filter((skill) => skill.level >= 80);
