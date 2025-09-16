"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown, Linkedin, Mail, Facebook, Instagram } from "lucide-react"
import { useEffect, useState } from "react"
import { useLanguage } from "@/hooks/use-language"

export function Hero() {
  const [mounted, setMounted] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 bg-[url('/abstract-blockchain-network.png')] opacity-5 bg-repeat"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-bounce delay-1000"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-accent/10 rounded-full animate-bounce delay-2000"></div>
      <div className="absolute bottom-40 left-20 w-12 h-12 bg-primary/20 rounded-full animate-bounce"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <p className="text-lg text-muted-foreground">
              {t("hero.greeting")} {t("myInfo.shortName")}
            </p>
          </div>

          <h1 className="font-playfair font-bold text-4xl sm:text-6xl lg:text-7xl mb-6 text-balance">
            {t("hero.title")}
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <a href="#projects" className="flex items-center gap-2">
                {t("hero.cta")}
                <ArrowDown size={16} />
              </a>
            </Button>
            <Button variant="outline" size="lg">
              <a href="#contact" className="flex items-center gap-2">
                {t("contact.title")}
                <Mail size={16} />
              </a>
            </Button>
          </div>

          <div className="flex justify-center space-x-6">
            <a
              href={t("myInfo.linkedInUrl")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin size={24} />
            </a>
            <a
              href={t("myInfo.facebookUrl")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Facebook size={24} />
            </a>
            <a
              href={t("myInfo.instagramUrl")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram size={24} />
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="text-muted-foreground" size={24} />
      </div>
    </section>
  )
}
