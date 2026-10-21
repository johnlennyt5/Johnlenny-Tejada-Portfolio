import { Contact } from "./Contact";
import { Footer, Header } from "./Header";
import { DayJob, Hero, Lineup, MoreWork, ProjectScene, STAGE_PROJECTS, Spotlight } from "./scenes";
import { BeyondCode, Credits, HowIWork, NowBuilding } from "./sections";
import { Sweep } from "./ui";

/**
 * v2 home, "Launch": the career as a product keynote.
 * Scene numbers run in page order; the flagship scenes are whichever projects carry a diagram.
 */
export function Home() {
  const firstStage = 3;
  const film = firstStage + STAGE_PROJECTS.length;
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Sweep />
        <DayJob />
        <Sweep />
        <Lineup />
        {STAGE_PROJECTS.map((p, i) => (
          <ProjectScene key={p.slug} project={p} n={firstStage + i} flip={i % 2 === 1} />
        ))}
        <Sweep />
        <MoreWork n={film} />
        <Sweep />
        <Spotlight n={film + 1} />
        <Sweep />
        <HowIWork n={film + 2} />
        <BeyondCode n={film + 3} />
        <Sweep />
        <Credits n={film + 4} />
        <NowBuilding n={film + 5} />
        <Contact eyebrow={`Scene ${String(film + 6).padStart(2, "0")} · Finale`} />
      </main>
      <Footer />
    </>
  );
}

export default Home;
