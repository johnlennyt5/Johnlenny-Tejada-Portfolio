import { ChaptersSection } from "./Chapters";
import { Footer, Header } from "./Header";
import { Hero } from "./Hero";
import { Bookmark } from "./motion/Bookmark";
import { HouseRules, Letter, Preface, Spread } from "./Parts";
import { WorkSection } from "./Work";

/**
 * v4 home: "Providence, Built by Hand".
 * Title page, preface and contents, ten chapters on a terracotta thread, the work as a pile of
 * plates, house rules, an open book of work and life, and a letter to the reader.
 */
export function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Preface />
        <ChaptersSection />
        <WorkSection />
        <HouseRules />
        <Spread />
        <Letter />
      </main>
      <Footer />
      <Bookmark />
    </>
  );
}

export default Home;
