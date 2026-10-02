import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Highlights } from "@/components/Highlights";
import { LittleThings } from "@/components/LittleThings";
import { Projects } from "@/components/Projects";
import { Sky } from "@/components/Sky";

export default function Home() {
  return (
    <>
      <Sky />
      <Header />
      <main>
        <Hero />
        <Highlights />
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <LittleThings />
    </>
  );
}
