import { CopyEmail } from "@/components/shared/CopyEmail";
import { ResumeButton } from "@/components/shared/ResumeButton";
import { GhostPlate, HeroStage, PlateShift, RegistrationMark, WordmarkRule } from "./HeroMotion";

export interface HeroProps {
  given: string;
  family: string;
  kicker: string;
  kickerNote: string;
  location: string;
  edition: string;
  headline: string;
  subhead: string;
  secondary: string;
  availability: string;
  intro: string;
}

/**
 * The cover. The name is set full width like a printing plate; on scroll the two lines
 * slide apart in opposite directions and a red plate drifts out of register behind the
 * family name. A server component: the section, standfirst, intro and buttons are plain
 * server HTML; only the wordmark block (HeroStage and its leaves) and the two shared
 * contact buttons hydrate.
 * The wordmark box is reserved in CSS (fixed line heights, no wrapping, a fixed measure for
 * the right-set family name), so the swap from fallback to Inter Tight moves nothing.
 * Static under reduced motion: the cover simply sits there, fully set.
 */
export function Hero({
  given,
  family,
  kicker,
  kickerNote,
  location,
  edition,
  headline,
  subhead,
  secondary,
  availability,
  intro,
}: HeroProps) {
  return (
    <section aria-labelledby="v1-hero-title" className="relative pb-16 md:pb-24" data-running-head="Cover">
      <div className="v1-wrap relative">
        <span className="v1-crop -left-[9px] top-[54px] hidden lg:block" aria-hidden="true" />
        <span className="v1-crop -right-[9px] top-[54px] hidden lg:block" aria-hidden="true" />

        <div className="v1-grid v1-label gap-y-1 border-b border-fg py-3">
          <p className="col-span-6 text-fg md:col-span-3">{kicker}</p>
          <p className="hidden md:col-span-3 md:block">{kickerNote}</p>
          <p className="col-span-6 text-right md:col-span-3 md:text-left">{location}</p>
          <p className="hidden text-right md:col-span-3 md:block">{edition}</p>
        </div>

        <HeroStage className="relative">
          <RegistrationMark className="pointer-events-none absolute right-0 top-[38%] hidden h-14 w-14 text-accent sm:block lg:h-16 lg:w-16" />

          <h1 id="v1-hero-title" className="v1-wordmark relative pt-6 md:pt-10">
            <span className="v1-wordmark-line">
              <PlateShift className="inline-block" to="-24%">
                {given}
              </PlateShift>
            </span>
            <WordmarkRule className="my-[0.06em] block h-[0.045em] w-[58%] origin-left bg-accent" />
            <span className="v1-wordmark-line text-right">
              <PlateShift className="v1-wordmark-family relative inline-block" to="14%">
                <GhostPlate className="absolute inset-0 text-accent opacity-90">{family}.</GhostPlate>
                <span className="relative">
                  {family}
                  <span className="text-accent">.</span>
                </span>
              </PlateShift>
            </span>
          </h1>
        </HeroStage>

        <div className="v1-grid mt-10 gap-y-8 md:mt-16">
          <div className="col-span-12 lg:col-span-6">
            <p className="v1-label">Primary practice</p>
            <p className="v1-standfirst mt-2">{headline}.</p>
            <p className="v1-deck mt-4">{subhead}</p>
          </div>
          <div className="col-span-12 border-t border-fg pt-3 sm:col-span-6 lg:col-span-3">
            <p className="v1-label">Also</p>
            <p className="mt-2 text-lg font-semibold leading-snug">{secondary}</p>
          </div>
          <div className="col-span-12 border-t border-fg pt-3 sm:col-span-6 lg:col-span-3">
            <p className="v1-label">Status</p>
            <p className="mt-2 text-lg leading-snug">{availability}</p>
          </div>
        </div>

        <div className="v1-grid mt-12 gap-y-8 md:mt-16">
          <p className="v1-prose-lg col-span-12 lg:col-span-7">{intro}</p>
          <div className="col-span-12 flex flex-col sm:col-span-8 lg:col-span-4 lg:col-start-9">
            <a href="#work" className="v1-btn v1-btn-solid">
              Read the index <span className="v1-arrow v1-arrow-down" aria-hidden="true">↓</span>
            </a>
            <ResumeButton className="v1-btn -mt-px">
              Download resume (PDF) <span className="v1-arrow v1-arrow-down" aria-hidden="true">↓</span>
            </ResumeButton>
            <div className="v1-copy-wide -mt-px">
              <CopyEmail
                className="v1-btn"
                label={
                  <>
                    Copy email address <span className="v1-arrow" aria-hidden="true">→</span>
                  </>
                }
                copiedLabel="Copied to clipboard"
                addressClassName="v1-email-address"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
