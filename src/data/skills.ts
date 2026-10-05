import type { Skill } from "@/types";

/**
 * The tools index. No self-ratings: the Stack section shows where each one was
 * used, computed from the role and project stacks. A tool listed in a stack
 * must appear here (a data test checks it); use `aliases` for other spellings.
 */
export const skills: readonly Skill[] = [
  { id: "openai", name: "OpenAI API", group: "ai", aliases: ["OpenAI"] },
  { id: "qdrant", name: "Qdrant", group: "ai" },
  { id: "tensorflow", name: "TensorFlow", group: "ai" },
  { id: "huggingface", name: "Hugging Face", group: "ai", aliases: ["Huggingface"] },
  { id: "scikit-learn", name: "scikit-learn", group: "ai" },
  { id: "langchain", name: "LangChain", group: "ai" },

  { id: "python", name: "Python", group: "backend" },
  { id: "nodejs", name: "Node.js", group: "backend" },
  { id: "nestjs", name: "NestJS", group: "backend" },
  { id: "fastapi", name: "FastAPI", group: "backend" },
  { id: "laravel", name: "Laravel", group: "backend" },
  { id: "mysql", name: "MySQL", group: "backend" },
  { id: "postgres", name: "PostgreSQL", group: "backend", aliases: ["Postgres"] },
  { id: "redis", name: "Redis", group: "backend" },
  { id: "typeorm", name: "TypeORM", group: "backend" },
  { id: "sqlalchemy", name: "SQLAlchemy", group: "backend" },

  { id: "solidity", name: "Solidity", group: "web3" },
  { id: "ethereum", name: "Ethereum", group: "web3" },
  { id: "hardhat", name: "Hardhat", group: "web3" },
  { id: "web3js", name: "Web3.js", group: "web3" },
  { id: "bitcoinjs", name: "bitcoinjs-lib", group: "web3", aliases: ["Bitcoin.js"] },

  { id: "typescript", name: "TypeScript", group: "frontend" },
  { id: "nextjs", name: "Next.js", group: "frontend" },
  { id: "react", name: "React", group: "frontend" },
  { id: "tailwind", name: "Tailwind CSS", group: "frontend" },

  { id: "docker", name: "Docker", group: "infra" },
  { id: "kubernetes", name: "Kubernetes", group: "infra" },
  { id: "aws", name: "AWS", group: "infra" },
];
