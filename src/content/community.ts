import type { Award, CommunityItem, Education } from "./types";

/** Leadership and community. Titles are exact; do not upgrade them. */
export const community: CommunityItem[] = [
  {
    id: "tedxprovidence",
    title: "Assistant Coordinator, TEDxProvidence 2025",
    org: "TEDxProvidence",
    dates: "Feb 2025",
    detail:
      "On the core team of three that ran TEDxProvidence 2025 at The VETS in Providence. I sourced and negotiated with vendors, performers and speakers.",
    link: { label: "TEDxProvidence", href: "https://www.tedxprovidence.com/", kind: "site" },
    kind: "leadership",
  },
  {
    id: "speaking-society",
    title: "Board member, Providence Speaking Society",
    org: "Providence Speaking Society",
    detail: "Board member of the nonprofit behind TEDxProvidence.",
    link: { label: "TEDxProvidence team", href: "https://www.tedxprovidence.com/", kind: "site" },
    kind: "leadership",
  },
  {
    id: "bryant-hackathon",
    title: "Hosted a hackathon at Bryant University",
    org: "Bryant University",
    detail: "Hosted a hackathon at Bryant University in Smithfield, Rhode Island.",
    kind: "community",
  },
  {
    id: "teaching",
    title: "Teaching people to build with AI",
    org: "Hackathons and community events",
    detail:
      "I teach people to code with AI and build simple full-stack apps at hackathons and community events, and I have supervised volunteers and participants at hackathons.",
    kind: "teaching",
  },
  {
    id: "mentoring",
    title: "Mentoring and onboarding",
    org: "DevAccelerator and HumanixOS",
    detail: "Helped onboard fellow students at DevAccelerator and new teammates at HumanixOS.",
    kind: "mentoring",
  },
  {
    id: "uri-treasurer",
    title: "Treasurer, URI student organization",
    org: "University of Rhode Island",
    dates: "2012 to 2014",
    detail: "Built each semester's activity and event budget and oversaw the funds.",
    kind: "leadership",
  },
  {
    id: "fox-point",
    title: "Youth mentor, Fox Point Boys and Girls Club",
    org: "Fox Point Boys and Girls Club, Providence",
    dates: "Summer 2009",
    detail: "Organized activities, kept attendance logs and taught healthy habits.",
    kind: "mentoring",
  },
];

/** The business side, for "Beyond code" strips. Supporting angle only. */
export const beyondCode: string[] = [
  "BBA in Accounting, University of Rhode Island.",
  "Managed a Providence barbershop for 7+ years and kept its books in Excel.",
  "Assistant Coordinator, TEDxProvidence 2025.",
  "Hosted a hackathon at Bryant University.",
  "Bilingual: English and Spanish.",
];

export const awards: Award[] = [
  {
    id: "aws-enterprise-agents",
    title: "Winner (team), Best use of AWS AI",
    event: "MCP - AWS - Enterprise Agents Challenge",
    place: "San Francisco",
    date: "July 2025",
    wording: "Winner (team), Best use of AWS AI, MCP - AWS - Enterprise Agents Challenge, San Francisco, July 2025",
    detail: "The yconic team's CFO agent, built with AWS Bedrock, HeyGen and MongoDB, at the AWS Builder Loft.",
    link: {
      label: "The winning entry on Devpost",
      href: "https://devpost.com/software/yc0n1c-developer-agent",
      kind: "award",
    },
    relatedProject: "yconic",
  },
];

export const education: Education[] = [
  {
    id: "devaccelerator",
    school: "DevAccelerator",
    credential: "Certificate in Computer Science",
    dates: "2023",
    location: "Providence, RI",
    detail: "Completed while working. Proven Skill Certificates in UiPath, SQL, XML, JavaScript and React.",
  },
  {
    id: "uri",
    school: "University of Rhode Island",
    credential: "BBA, Accounting",
    dates: "2010 to 2014",
    location: "Kingston, RI",
  },
];
