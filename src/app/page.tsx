import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Stack } from "@/components/sections/stack";
import { Testimonials } from "@/components/sections/testimonials";
import { Work } from "@/components/sections/work";
import { testimonials } from "@/data/testimonials";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Experience />
        <Work />
        <Stack />
        <Testimonials items={testimonials} />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
