/**
 * Team members and photos, verified directly from the live About page at autoselectgroups.com
 * (fetched 2026-09-10). Photos are self-hosted under public/team/ (migrated from the old WordPress
 * site's wp-content/uploads host once DNS moved off it). Confirm the roster is still current before
 * launch; people and titles can change.
 */
export interface TeamMember {
  id: string;
  name: string;
  /** Two-letter monogram shown if the photo fails to load. */
  initials: string;
  title: string;
  bio: string;
  photo: { url: string; alt: string };
  /** Languages listed on the previous site, in addition to English. */
  otherLanguages: string[];
  /** Open questions to resolve with the dealership. Not shown on the public site; see docs/site-content-todos.md. */
  needsConfirmation: string[];
}

export const team: TeamMember[] = [
  {
    id: "patrick-simon",
    name: "Patrick Simon",
    initials: "PS",
    title: "Owner",
    bio: "Patrick owns Auto Select and brings more than 22 years of experience as a General Sales Manager for new and used vehicles at Toyota and Volvo dealerships. Outgoing, with a positive outlook.",
    photo: { url: "/team/member-1.png", alt: "Patrick Simon, Owner of Auto Select" },
    otherLanguages: [],
    needsConfirmation: [],
  },
  {
    id: "veronica-simon",
    name: "Veronica Simon",
    initials: "VS",
    title: "Business Manager / Finance",
    bio: "Veronica oversees the business and finance side of Auto Select. She holds a bachelor's degree in education from UTSA and has more than 20 years of experience in customer service and finance. She is fluent in Spanish.",
    photo: {
      url: "/team/member-2.png",
      alt: "Veronica Simon, Business Manager / Finance at Auto Select",
    },
    otherLanguages: ["Spanish"],
    needsConfirmation: [],
  },
  {
    id: "tally-luna",
    name: "Tally Luna",
    initials: "TL",
    title: "Office Manager / Title Clerk",
    bio: "Tally has more than 11 years of experience and handles title transfers, contracts, billing, and state compliance. Energetic and family-oriented, and always ready to help customers.",
    photo: {
      url: "/team/member-3.png",
      alt: "Tally Luna, Office Manager / Title Clerk at Auto Select",
    },
    otherLanguages: [],
    needsConfirmation: ["The previous site lists Tally as both “General Sales Manager” and “Office Manager / Title Clerk.” Confirm the current title."],
  },
  {
    id: "brandon-simon",
    name: "Brandon Simon",
    initials: "BS",
    title: "Internet Manager (in training)",
    bio: "Brandon is training as Auto Select's Internet Manager while attending San Antonio College (SAC). He brings four years of experience in customer service and hospitality.",
    photo: {
      url: "/team/member-4.png",
      alt: "Brandon Simon, Internet Manager in training at Auto Select",
    },
    otherLanguages: [],
    needsConfirmation: [],
  },
];

/** True when the previous site showed an open "coming soon" slot in the team grid (currently one). */
export const hasOpenPosition = true;

/** Team members whose bios list Spanish fluency. Confirm before advertising Spanish-language service. */
export const spanishSpeakers = team.filter((m) => m.otherLanguages.includes("Spanish"));
