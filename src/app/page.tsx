import { Navbar } from "@/components/ui/Navbar";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { WhatIDo } from "@/components/sections/WhatIDo";
import { Career } from "@/components/sections/Career";
import { Projects } from "@/components/sections/Projects";
import { TechStack } from "@/components/sections/TechStack";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <SocialIcons />
      <main>
        <Hero />
        <About />
        <WhatIDo />
        <Career />
        <Projects />
        <TechStack />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
