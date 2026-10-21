import { CopyEmail, ResumeButton } from "@/components/shared";
import { profile } from "@/content";
import { Cue, Scene } from "./cue";
import { BTN_GHOST, BTN_PRIMARY, Eyebrow, ExternalArrow } from "./ui";

/** The finale: the call to action every v2 page ends on. Owns the #contact anchor. */
export function Contact({ eyebrow = "Final scene" }: { eyebrow?: string }) {
  return (
    <Scene id="contact" length={170} labelledBy="v2-contact-title" className="v2-contact">
      <div className="v2-layers" aria-hidden="true">
        <Cue enter={{ at: [0, 1], y: 280, scale: 0.75 }} className="v2-glow v2-glow-c" style={{ translate: "0 -60px", scale: "1.1" }} decorative />
        <div className="v2-horizon" />
      </div>
      <div className="v2-container text-center">
        <Cue enter={{ at: [0, 0.45], y: 60, scale: 0.92 }} className="mx-auto max-w-5xl">
          <Eyebrow className="justify-center">{eyebrow}</Eyebrow>
          <h2 id="v2-contact-title" className="v2-display-md mt-5">
            <span className="v2-grad">Let&apos;s ship the next launch together.</span>
          </h2>
          <p className="v2-lead mx-auto mt-6 max-w-2xl text-muted">{profile.availability}</p>
        </Cue>
        <Cue enter={{ at: [0.2, 0.55], y: 40, opacity: 0 }} className="mt-10">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CopyEmail className={BTN_PRIMARY} label="Copy my email" copiedLabel="Email copied" addressClassName="v2-mono basis-full text-center text-sm" />
            <ResumeButton className={BTN_GHOST}>Download resume (PDF)</ResumeButton>
            <a className={BTN_GHOST} href={profile.links.linkedin.href} rel="me noopener">
              LinkedIn <ExternalArrow />
            </a>
            <a className={BTN_GHOST} href={profile.links.github.href} rel="me noopener">
              GitHub <ExternalArrow />
            </a>
          </div>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {profile.location.label} · {profile.languages.join(" and ")}
          </p>
        </Cue>
      </div>
    </Scene>
  );
}
