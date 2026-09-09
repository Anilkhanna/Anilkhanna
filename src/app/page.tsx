import { AvailabilityBanner } from "@/components/ui/AvailabilityBanner";
import { Navbar } from "@/components/ui/Navbar";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { WhatIDo } from "@/components/sections/WhatIDo";
import { Career } from "@/components/sections/Career";
import { Products } from "@/components/sections/Products";
import { Projects } from "@/components/sections/Projects";
import { Initiatives } from "@/components/sections/Initiatives";
import { Testimonials } from "@/components/sections/Testimonials";
import { TechStack } from "@/components/sections/TechStack";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  return (
    <>
      <AvailabilityBanner />
      <Navbar />
      <SocialIcons />
      <main>
        <Hero />
        <About />
        <WhatIDo />
        <Products />
        <Career />
        <Initiatives />
        <Projects />
        <Testimonials />
        <TechStack />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
