import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

export function Experience() {
  const experiences = [
    {
      title: "Backend Developer",
      company: "NumadLabs",
      location: "Hybrid",
      period: "2024 - 2025",
      description:
        "Blockchain and backend development on web3 and web2s. Designing hybrid approach on both.",
      technologies: ["Solidity", "Ethereum", "Hardhat", "Web3.js", "Node.js", "Bitcoin.js", "Postgres"],
    },
    {
      title: "Blockchain and AI expert",
      company: "ErchimLabs",
      location: "Hybrid",
      period: "2025 - Present",
      description:
        "Blockchain and backend development on web3 and web2s. Designing hybrid approach on both. Also automating using ai.",
      technologies: ["Solidity", "Ethereum", "Hardhat", "Web3.js", "Node.js", "Bitcoin.js", "Postgres", "Python", "Tensorflow", "Huggingface"],
    },
  ]

  return (
    <section id="experience" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair font-bold text-3xl sm:text-4xl mb-4">Experience</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              A journey through innovative companies, building cutting-edge solutions and leading technical initiatives.
            </p>
          </div>

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-xl font-playfair">{exp.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {exp.period}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {exp.location}
                      </div>
                    </div>
                  </div>
                  <p className="text-primary font-semibold">{exp.company}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-4 leading-relaxed">{exp.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="outline" className="border-primary/20 text-primary">
                        {tech}
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
