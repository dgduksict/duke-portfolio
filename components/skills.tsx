"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Component } from "@/components/animated/Tech-Stack";
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/hooks/use-language"

export function Skills() {
  const { t } = useLanguage()

  const techStack = {
  frontend: [
    { name: 'Next.js', url: 'https://nextjs.org/', color: '#FFFFFF' },
    { name: 'React', url: 'https://react.dev/', color: '#61DAFB' },
    { name: 'TypeScript', url: 'https://www.typescriptlang.org/', color: '#3178C6' },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com/', color: '#06B6D4' },
    { name: 'Framer Motion', url: 'https://www.framer.com/motion/', color: '#0055FF' },
    { name: 'Vercel', url: 'https://vercel.com/', color: '#000000' },
  ],

  backend: [
    { name: 'Node.js', url: 'https://nodejs.org/en', color: '#68A063' },
    { name: 'Express.js', url: 'https://expressjs.com/', color: '#000000' },
    { name: 'FastAPI', url: 'https://fastapi.tiangolo.com/', color: '#009688' },
    { name: 'PostgreSQL', url: 'https://www.postgresql.org/', color: '#336791' },
    { name: 'MongoDB', url: 'https://www.mongodb.com/', color: '#47A248' },
    { name: 'Redis', url: 'https://redis.io/', color: '#DC382D' },
    { name: 'Docker', url: 'https://www.docker.com/', color: '#2496ED' },
    { name: 'Kubernetes', url: 'https://kubernetes.io/', color: '#326CE5' },
    { name: 'AWS', url: 'https://aws.amazon.com/', color: '#FF9900' },
  ],

  ai: [
    { name: 'Python', url: 'https://www.python.org/', color: '#3776AB' },
    { name: 'TensorFlow', url: 'https://www.tensorflow.org/', color: '#FF6F00' },
    { name: 'PyTorch', url: 'https://pytorch.org/', color: '#EE4C2C' },
    { name: 'Scikit-learn', url: 'https://scikit-learn.org/', color: '#F7931E' },
    { name: 'OpenAI API', url: 'https://openai.com/', color: '#412991' },
    { name: 'Hugging Face', url: 'https://huggingface.co/', color: '#FFCC4D' },
    { name: 'LangChain', url: 'https://www.langchain.com/', color: '#1A7BFF' },
    { name: 'Computer Vision', url: 'https://opencv.org/', color: '#5C3EE8' },
    { name: 'NLP', url: 'https://www.nltk.org/', color: '#9C27B0' },
  ],

  blockchain: [
    { name: 'Solidity', url: 'https://soliditylang.org/', color: '#363636' },
    { name: 'Ethereum', url: 'https://ethereum.org/', color: '#3C3C3D' },
    { name: 'Web3.js', url: 'https://web3js.org/', color: '#F16822' },
    { name: 'Hardhat', url: 'https://hardhat.org/', color: '#F4C542' },
    { name: 'Truffle', url: 'https://trufflesuite.com/', color: '#5E464D' },
    { name: 'IPFS', url: 'https://ipfs.tech/', color: '#65C2CB' },
    { name: 'Smart Contracts', url: 'https://ethereum.org/en/developers/docs/smart-contracts/', color: '#2E7D32' },
    { name: 'DeFi', url: 'https://defipulse.com/', color: '#00C9A7' },
    { name: 'NFTs', url: 'https://opensea.io/', color: '#2081E2' },
  ],

  tools: [
    { name: 'Git', url: 'https://git-scm.com/', color: '#F05032' },
    { name: 'Linux', url: 'https://www.linux.org/', color: '#FCC624' },
    { name: 'CI/CD', url: 'https://about.gitlab.com/topics/ci-cd/', color: '#E24329' },
    { name: 'GraphQL', url: 'https://graphql.org/', color: '#E10098' },
    { name: 'REST APIs', url: 'https://restfulapi.net/', color: '#009688' },
    { name: 'Microservices', url: 'https://microservices.io/', color: '#2196F3' },
    { name: 'Terraform', url: 'https://www.terraform.io/', color: '#844FBA' },
    { name: 'Monitoring', url: 'https://prometheus.io/', color: '#E6522C' },
    { name: 'Testing', url: 'https://jestjs.io/', color: '#C21325' },
  ],
};



  const skillCategories = [
    {
      title: t("skills.ai"),
      skills: [
        "Python",
        "TensorFlow",
        "PyTorch",
        "Scikit-learn",
        "OpenAI API",
        "Hugging Face",
        "LangChain",
        "Computer Vision",
        "NLP",
      ],
    },
    {
      title: t("skills.blockchain"),
      skills: ["Solidity", "Ethereum", "Web3.js", "Hardhat", "Truffle", "IPFS", "Smart Contracts", "DeFi", "NFTs"],
    },
    {
      title: t("skills.backend"),
      skills: ["Node.js", "Express.js", "FastAPI", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS"],
    },
    {
      title: t("skills.tools"),
      skills: ["Git", "Linux", "CI/CD", "GraphQL", "REST APIs", "Microservices", "Terraform", "Monitoring", "Testing"],
    },
  ]

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair font-bold text-3xl sm:text-4xl mb-4">{t("skills.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              A comprehensive toolkit spanning AI, blockchain, and backend technologies to build innovative solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {skillCategories.map((category, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl font-playfair">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="secondary"
                        className="bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
