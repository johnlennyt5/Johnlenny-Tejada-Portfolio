import Image from "next/image";
import Link from "next/link";
import { education, identities, profile } from "@/content";
import { routes } from "@/lib/site";
import { PlateHeader } from "./CaseParts";
import { Masthead } from "./Masthead";
import { Reveal } from "./motion";
import { Colophon, ContactSection, PeopleSection, RecordSection, SystemsSection } from "./sections";

/**
 * v1 about: the profile spread. Portrait and facts in the margin, the first-person
 * bio as the article, then the record, the practices, the community and correspondence.
 */
export function About() {
  const [first, ...rest] = profile.bio;
  const facts: { term: string; detail: string }[] = [
    { term: "Based in", detail: profile.location.label },
    { term: "Languages", detail: profile.languages.join(" and ") },
    ...identities.map((i) => ({ term: i.rank === "primary" ? "Practice" : "Also", detail: i.title })),
    ...education.map((e) => ({ term: "Education", detail: `${e.credential}, ${e.school}` })),
  ];

  return (
    <>
      <Masthead name={profile.name} />
      <main id="main">
        <PlateHeader
          title={`About ${profile.givenName}`}
          titleId="about-title"
          top={
            <nav aria-label="Breadcrumb" className="v1-label border-b border-fg pb-3">
              <ol className="flex flex-wrap items-center gap-x-2">
                <li>
                  <Link href={routes.home("v1")} className="inline-flex min-h-11 items-center hover:text-fg">
                    The Index
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <span aria-current="page" className="text-fg">
                    Profile
                  </span>
                </li>
              </ol>
            </nav>
          }
        >
          <p className="v1-standfirst mt-6 max-w-[22ch]">{profile.headline}.</p>
          <p className="v1-deck mt-3">{profile.subhead}</p>
        </PlateHeader>

        <section aria-label="Profile" data-running-head="Profile" className="v1-wrap mt-14 md:mt-20">
          <div className="v1-grid gap-y-12 border-t-4 border-fg pt-8">
            <div className="col-span-12 sm:col-span-6 lg:col-span-4">
              <figure className="max-w-[300px]">
                <div className="v1-halftone border border-fg p-2">
                  <Image
                    src={profile.headshot.src}
                    width={profile.headshot.width}
                    height={profile.headshot.height}
                    alt={profile.headshot.alt}
                    className="v1-portrait block h-auto w-full"
                    sizes="300px"
                  />
                </div>
                <figcaption className="v1-label mt-3">Fig. 1. {profile.name}.</figcaption>
              </figure>
              <dl className="mt-10 border-t border-fg">
                {facts.map((f) => (
                  <div key={`${f.term}-${f.detail}`} className="grid grid-cols-[7rem_1fr] gap-x-3 border-b border-line py-3">
                    <dt className="v1-label pt-0.5">{f.term}</dt>
                    <dd className="text-[0.9375rem] font-medium leading-snug">{f.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-6">
              {first ? <p className="v1-prose-lg v1-dropcap">{first}</p> : null}
              {rest.map((para) => (
                <Reveal key={para.slice(0, 40)} className="mt-6">
                  <p className="v1-prose-lg">{para}</p>
                </Reveal>
              ))}
              <p className="mt-10">
                <Link href={`${routes.home("v1")}#work`} className="v1-btn v1-btn-solid">
                  Read the index of work <span className="v1-arrow" aria-hidden="true">→</span>
                </Link>
              </p>
            </div>
          </div>
        </section>

        <RecordSection s={{ id: "record", num: "01", label: "Record", title: "Employment record" }} />
        <SystemsSection s={{ id: "systems", num: "02", label: "Systems", title: "How I work" }} />
        <PeopleSection s={{ id: "off-the-books", num: "03", label: "Community", title: "Off the books" }} />
        <ContactSection s={{ id: "contact", num: "04", label: "Contact", title: "Correspondence" }} />
      </main>
      <Colophon />
    </>
  );
}

export default About;
