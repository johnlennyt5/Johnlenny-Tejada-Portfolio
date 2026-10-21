import type { Link } from "./types";

/**
 * Who he is, in one place. No phone, no street address, no second email.
 * The email address is never stored here as one string: CopyEmail assembles it in the browser.
 */
export const profile = {
  name: "Johnlenny Tejada",
  givenName: "Johnlenny",
  familyName: "Tejada",
  initials: "JT",
  headline: "Automation and AI engineer",
  subhead: "UiPath RPA, agentic workflows, and the full-stack TypeScript apps around them.",
  secondaryHeadline: "Full-stack TypeScript engineer who ships tested, secure products.",
  /** One sentence for meta descriptions and previews. */
  description:
    "Johnlenny Tejada is an automation and AI engineer in Providence, RI: UiPath RPA and agentic workflows at HumanixOS, plus full-stack TypeScript products like truckWhat and PrismShift.",
  intro:
    "I build automations that turn manual, multi-step work into exception-only work, and the full-stack products around them. Since January 2023 I have done that at HumanixOS, a nonprofit software platform in Providence. On my own time I founded truckWhat, built PrismShift, and co-founded SmartFit Metrics.",
  /** First-person bio for About sections. Paragraphs in order. */
  bio: [
    "I am a software engineer at HumanixOS, where I build AI and automation features for a live multi-tenant platform that nonprofits run on. That work spans UiPath robots with humans in the loop, AI-assisted data migrations from legacy databases and spreadsheets, and the TypeScript product code around them. Before the platform moved to TypeScript, I designed and built its original Java and Spring Boot backend.",
    "Outside the day job I build products end to end. truckWhat is my own logistics startup, a web and mobile trucking marketplace I am building solo with a CI gate on every push. PrismShift migrates Blue Prism automations into UiPath for banks that cannot let their source exports leave the building. I co-founded SmartFit Metrics and was one of its two engineers; the app is live on the App Store and Google Play.",
    "I came to software from the business side. I hold a BBA in Accounting from the University of Rhode Island, and for more than seven years I managed a barbershop in Providence: hiring barbers, keeping clients, and keeping the books in Excel. That is why I care about what an automation saves, who it serves, and what happens when it fails.",
    "I also like building rooms full of builders. I was Assistant Coordinator for TEDxProvidence 2025, I hosted a hackathon at Bryant University, and I teach people to code with AI at hackathons and community events. I work in English and Spanish.",
  ],
  location: {
    city: "Providence",
    region: "RI",
    regionName: "Rhode Island",
    country: "US",
    label: "Providence, Rhode Island",
    short: "Providence, RI",
    timeZone: "America/New_York",
  },
  availability: "Open to automation, AI and full-stack engineering roles in New England or remote.",
  languages: ["English", "Spanish"],
  links: {
    linkedin: {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/johnlennytejada",
      kind: "profile",
    },
    github: {
      label: "GitHub",
      href: "https://github.com/johnlennyt5",
      kind: "profile",
    },
  } satisfies Record<string, Link>,
  resume: {
    href: "/resume/Johnlenny_Tejada_Resume.pdf",
    label: "Resume (PDF)",
    fileName: "Johnlenny_Tejada_Resume.pdf",
  },
  headshot: {
    src: "/img/headshot.jpg",
    width: 300,
    height: 300,
    alt: "Portrait of Johnlenny Tejada",
  },
  /** Email parts. Join with "@" and "." in the browser only (see CopyEmail). */
  emailParts: { user: "johnlennyt", domain: ["gmail", "com"] },
} as const;

export type Profile = typeof profile;
