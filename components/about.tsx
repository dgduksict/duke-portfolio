"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Brain, Code, Blocks } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export function About() {
  const { t } = useLanguage()

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair font-bold text-3xl sm:text-4xl mb-4">{t("about.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">{t("about.description")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/professional-developer-portrait.png"
                alt="Professional portrait"
                className="rounded-lg shadow-lg w-full max-w-md mx-auto"
              />
            </div>

            <div className="space-y-6">
              <p className="text-foreground leading-relaxed">{t("about.description")}</p>

              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">{t("about.specializations")}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <Card className="text-center p-4">
                  <CardContent className="pt-4">
                    <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">{t("skills.ai")}</h3>
                    <p className="text-sm text-muted-foreground">Machine Learning & Deep Learning</p>
                  </CardContent>
                </Card>

                <Card className="text-center p-4">
                  <CardContent className="pt-4">
                    <Code className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">{t("skills.backend")}</h3>
                    <p className="text-sm text-muted-foreground">Scalable Systems & APIs</p>
                  </CardContent>
                </Card>

                <Card className="text-center p-4">
                  <CardContent className="pt-4">
                    <Blocks className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">{t("skills.blockchain")}</h3>
                    <p className="text-sm text-muted-foreground">Smart Contracts & DApps</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
