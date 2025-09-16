"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, ChevronLeft, ChevronRight } from "lucide-react"

export function Projects() {
  const [currentProject, setCurrentProject] = useState(0)

  const projects = [
    {
      title: "DeFi Yield Optimizer",
      description:
        "An intelligent DeFi protocol that automatically optimizes yield farming strategies using AI-powered algorithms. Features automated rebalancing, risk assessment, and multi-chain support.",
      image: "/defi-dashboard-interface.jpg",
      technologies: ["Solidity", "Python", "TensorFlow", "Web3.js", "React"],
      github: "#",
      demo: "#",
      category: "Blockchain",
    },
    {
      title: "AI-Powered Trading Bot",
      description:
        "A sophisticated trading bot that uses machine learning to analyze market patterns and execute trades. Implements sentiment analysis, technical indicators, and risk management.",
      image: "/trading-bot-dashboard.png",
      technologies: ["Python", "PyTorch", "FastAPI", "PostgreSQL", "Docker"],
      github: "#",
      demo: "#",
      category: "AI",
    },
    {
      title: "NFT Marketplace with AI Curation",
      description:
        "A next-generation NFT marketplace that uses AI to curate and recommend digital assets. Features smart contract automation and personalized discovery algorithms.",
      image: "/nft-marketplace-interface.png",
      technologies: ["Solidity", "Next.js", "IPFS", "OpenAI API", "Ethereum"],
      github: "#",
      demo: "#",
      category: "Web3",
    },
    {
      title: "Blockchain Analytics Platform",
      description:
        "A comprehensive analytics platform for blockchain data visualization and insights. Provides real-time monitoring, transaction analysis, and predictive modeling.",
      image: "/blockchain-analytics-dashboard.png",
      technologies: ["Node.js", "D3.js", "MongoDB", "GraphQL", "AWS"],
      github: "#",
      demo: "#",
      category: "Analytics",
    },
  ]

  const nextProject = () => {
    setCurrentProject((prev) => (prev + 1) % projects.length)
  }

  const prevProject = () => {
    setCurrentProject((prev) => (prev - 1 + projects.length) % projects.length)
  }

  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair font-bold text-3xl sm:text-4xl mb-4">Featured Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Innovative solutions combining AI, blockchain, and backend technologies to solve real-world problems.
            </p>
          </div>

          {/* Featured Project Carousel */}
          <div className="relative mb-16">
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={projects[currentProject].image || "/placeholder.svg"}
                    alt={projects[currentProject].title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {projects[currentProject].category}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={prevProject}>
                        <ChevronLeft size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={nextProject}>
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-playfair font-bold text-2xl mb-4">{projects[currentProject].title}</h3>

                  <p className="text-muted-foreground mb-6 leading-relaxed">{projects[currentProject].description}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {projects[currentProject].technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="border-primary/20">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" size="sm">
                      <Github size={16} className="mr-2" />
                      Code
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <ExternalLink size={16} className="mr-2" />
                      Live Demo
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Project Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="p-0">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      {project.category}
                    </Badge>
                  </div>

                  <CardTitle className="font-playfair text-lg mb-2">{project.title}</CardTitle>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{project.description}</p>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Github size={14} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink size={14} />
                      </Button>
                    </div>
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
