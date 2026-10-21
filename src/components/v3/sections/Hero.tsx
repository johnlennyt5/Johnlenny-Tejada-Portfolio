import { CopyEmail } from "@/components/shared/CopyEmail";
import { ResumeButton } from "@/components/shared/ResumeButton";
import { nowBuilding, primaryIdentity, profile } from "@/content";
import { HeroStage } from "../motion/Parallax";
import { Out, Prompt } from "../ui";

/**
 * The oversized outlined [JT] behind the terminal, drawn as paths so it paints with the
 * first frame instead of waiting for the mono web font. Decorative only.
 */
function HeroGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 96" className={className} aria-hidden="true" focusable="false">
      <path d="M18 2H48V14H32V82H48V94H18Z" />
      <path d="M72 8H112V20H106V60C106 74 97 82 84 82C73 82 65 76 62 66L75 62C77 68 80 70 84 70C89 70 92 66 92 60V20H72Z" />
      <path d="M124 8H176V20H157V80H143V20H124Z" />
      <path d="M192 2H222V94H192V82H208V14H192Z" />
    </svg>
  );
}

/**
 * The whoami hero. The name is static at first paint (it is the LCP element); the prompts
 * type themselves with a CSS steps() cover and the outputs fade in after them.
 * Any key press or tap skips straight to the finished screen.
 */
export function Hero({ id, nextId }: { id: string; nextId: string }) {
  const now = nowBuilding[0];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="v3-node relative px-4 pt-8 pb-14 sm:px-8 lg:px-14 lg:pt-14">
      <HeroStage
        backdrop={
          <HeroGlyph className="v3-hero-glyph absolute top-[4%] -right-[18vw] sm:-right-[6vw]" />
        }
      >
        <p className="v3-eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="v3-dot" data-state="running" aria-hidden="true" />
          <span>The Robot Room</span>
          <span aria-hidden="true">/</span>
          <span>{profile.location.short}</span>
        </p>

        <div className="v3-term mt-6 max-w-5xl">
          <div className="v3-term-bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <span className="ml-2 truncate">jt@providence: ~/portfolio</span>
          </div>
          <div className="p-5 sm:p-8 lg:p-10">
            <Prompt cmd="whoami" typed delay={0.2} />
            <h1 id={`${id}-title`} className="v3-hero-name mt-3">
              <span className="block">{profile.givenName}</span>{" "}
              <span className="block">
                {profile.familyName}
                <span className="v3-caret-block jt-caret align-baseline" aria-hidden="true" />
              </span>
            </h1>
            <p className="mt-6 font-mono text-lg font-bold sm:text-2xl v3-tone-ok">{profile.headline}</p>
            <p className="v3-comment mt-2 max-w-3xl text-sm sm:text-base"># {profile.subhead}</p>

            <Prompt cmd="cat about.txt" typed delay={0.75} className="mt-8" />
            <p className="mt-3 max-w-3xl text-base leading-relaxed sm:text-lg">{profile.intro}</p>

            <Out delay={1.25}>
              <dl className="v3-kv mt-6 font-mono text-sm">
                <dt className="text-muted">role</dt>
                <dd>{primaryIdentity.title}</dd>
                <dt className="text-muted">also</dt>
                <dd>{profile.secondaryHeadline}</dd>
                <dt className="text-muted">now</dt>
                <dd>{now ? now.title : profile.headline}</dd>
                <dt className="text-muted">speaks</dt>
                <dd>{profile.languages.join(" and ")}</dd>
                <dt className="text-muted">open to</dt>
                <dd>{profile.availability}</dd>
              </dl>
            </Out>

            <Prompt cmd="orchestrator run portfolio" typed delay={1.55} className="mt-8" caret />
            <Out delay={2.75} as="p" className="mt-2 font-mono text-sm">
              <span className="v3-tone-queue">queue loaded.</span>{" "}
              <a href={`#${nextId}`} className="v3-link">
                Scroll to start the robot
              </a>
              <span aria-hidden="true"> &darr;</span>
            </Out>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <CopyEmail className="v3-btn v3-btn-primary" label="Copy email address" copiedLabel="Copied to clipboard" />
          <ResumeButton className="v3-btn">Download resume (PDF)</ResumeButton>
          <a className="v3-btn" href={profile.links.linkedin.href}>
            LinkedIn
          </a>
          <a className="v3-btn" href={profile.links.github.href}>
            GitHub
          </a>
        </div>
      </HeroStage>
    </section>
  );
}
