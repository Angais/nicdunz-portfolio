import { About } from "@/components/About";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Highlights } from "@/components/Highlights";
import { LittleThings } from "@/components/LittleThings";
import { WorkedWith } from "@/components/WorkedWith";

export default function Home() {
  return (
    <>
      <div className="atmosphere" aria-hidden="true" />
      <Header />
      <main id="top">
        <div className="container">
          <Hero />
        </div>
        <Highlights />
        <About />
        <WorkedWith />
      </main>
      <Footer />
      <LittleThings />
    </>
  );
}
