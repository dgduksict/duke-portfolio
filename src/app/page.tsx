import { BackToTop } from "@/components/layout/back-to-top";
import { CommandPalette } from "@/components/layout/command-palette";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Impact } from "@/components/sections/impact";
import { Pricing } from "@/components/sections/pricing";
import { Skills } from "@/components/sections/skills";
import { Testimonials } from "@/components/sections/testimonials";
import { Work } from "@/components/sections/work";
import { Aurora } from "@/components/visual/aurora";

export default function HomePage() {
  return (
    <>
      <Aurora />
      <SiteHeader />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Work />
        <Impact />
        <Testimonials />
        <Pricing />
        <Contact />
      </main>
      <SiteFooter />
      <CommandPalette />
      <BackToTop />
    </>
  );
}
