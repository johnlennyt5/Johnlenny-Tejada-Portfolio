import { CopyEmail } from "@/components/shared/CopyEmail";
import { ResumeButton } from "@/components/shared/ResumeButton";
import { profile } from "@/content";
import { LedgerSlip, Polaroid } from "./artifacts/Artifacts";
import { HeroScene, Layer } from "./motion/HeroScene";
import { SealStamp } from "./motion/SealStamp";

/**
 * The title page. The name is set huge and static (it is the LCP), and the desk beside it
 * holds a few papers that drift apart at different speeds as the page scrolls.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative">
      <HeroScene className="v4-wrap relative grid gap-12 pt-10 pb-16 sm:pt-14 lg:grid-cols-12 lg:gap-8 lg:pt-20 lg:pb-28">
        <div className="relative z-10 lg:col-span-7">
          <p className="v4-eyebrow">Hola, hello. A story in chapters, 2009 to now</p>
          <h1 id="hero-title" className="v4-hero-name mt-6">
            <span className="block">{profile.givenName}</span>
            <span className="v4-hero-last block pl-[0.45em]">{profile.familyName}</span>
          </h1>
          <p className="v4-display mt-8 text-[clamp(1.6rem,3.6vw,2.4rem)] font-medium leading-tight">
            <span className="underline decoration-[var(--c-accent)] decoration-2 underline-offset-[0.2em]">{profile.headline}</span>
            <span className="text-muted">, {profile.location.label}</span>
          </p>
          <p className="mt-3 max-w-xl text-lg text-muted">{profile.subhead}</p>
          <p className="v4-prose mt-6">{profile.intro}</p>
          {/* Phones: a fixed 2 by 2 grid of one-line buttons, so the block is the same height in
              every font and the hero below it never moves when the web fonts arrive. */}
          <div className="v4-hero-actions mt-9">
            <a className="v4-btn" href="#chapters">
              Read the story
            </a>
            <a className="v4-btn-ghost" href="#work">
              See the work
            </a>
            <ResumeButton className="v4-btn-ghost">Resume (PDF)</ResumeButton>
            <CopyEmail className="v4-btn-ghost" />
          </div>
        </div>

        <div className="relative h-[23rem] sm:h-[27rem] lg:col-span-5 lg:h-auto lg:min-h-[36rem]">
          <Layer className="absolute top-0 right-[3%] z-20 sm:right-[8%]" y={-150} rotate={[4, 11]}>
            <Polaroid caption="Hola, I'm Johnlenny" priority />
          </Layer>
          <Layer className="absolute top-[42%] left-0 z-10 sm:top-[38%]" y={-50} x={[0, -24]} rotate={[-7, -15]}>
            <LedgerSlip />
          </Layer>
          <Layer className="absolute top-[6%] left-[4%] z-0 hidden sm:block" y={-90} rotate={[-3, -8]}>
            <div className="v4-kraft w-[12.5rem] p-4">
              <p className="v4-smallcaps text-xs text-muted">Greetings from</p>
              <p className="v4-italic mt-1 text-2xl leading-tight text-accent-2">{profile.location.label}</p>
              <p className="mt-2 text-sm">{profile.languages.join(" and ")}</p>
            </div>
          </Layer>
          <Layer className="absolute right-[2%] bottom-0 z-30 sm:right-[12%] lg:bottom-[14%]" y={-230}>
            <SealStamp size="100%" spin={120} delay={0.15} className="h-28 w-28 sm:h-36 sm:w-36" />
          </Layer>
        </div>
      </HeroScene>
    </section>
  );
}
