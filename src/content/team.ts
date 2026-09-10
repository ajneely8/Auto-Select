/**
 * Team members and photos, verified directly from the live About page at autoselectgroups.com
 * (fetched 2026-09-10). Photos are hot-linked from the same wp-content/uploads host already used
 * for inventory photos — see next.config.ts remotePatterns. Confirm the roster is still current
 * before launch; people and titles can change.
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
  /** Open questions to resolve with the dealership. Rendered as visible TODO flags. */
  needsConfirmation: string[];
}

export const team: TeamMember[] = [
  {
    id: "patrick-simon",
    name: "Patrick Simon",
    initials: "PS",
    title: "Owner",
    bio: "Patrick owns Auto Select and brings more than 22 years of experience as a General Sales Manager for new and used vehicles at Toyota and Volvo dealerships. Outgoing, with a positive outlook.",
    photo: { url: "https://autoselectgroups.com/wp-content/uploads/2021/04/PATRICKS.png", alt: "Patrick Simon, Owner of Auto Select" },
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
      url: "https://autoselectgroups.com/wp-content/uploads/elementor/thumbs/VERONICAS-p8c05nwtkp41hrf994ytnbuvrdv5nqxscft2thnrse.png",
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
      url: "https://autoselectgroups.com/wp-content/uploads/elementor/thumbs/TALLYL-p8c058vejcjgc013oygsjfni97xa8la2yddb52a2jy.png",
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
      url: "https://autoselectgroups.com/wp-content/uploads/elementor/thumbs/BRANDONS-p8c03c96ofxisgsrtmt0zeyuw3bhmopocxqv3v3t66.png",
      alt: "Brandon Simon, Internet Manager in training at Auto Select",
    },
    otherLanguages: [],
    needsConfirmation: [],
  },
  {
    id: "francisco-raphael",
    name: "Francisco Raphael",
    initials: "FR",
    title: "Certified Trade Appraisal",
    bio: "Francisco has more than 22 years of new and used car sales experience with Toyota, Nissan, and Ford, and has been part of the Auto Select team for five years. He is fluent in Spanish.",
    photo: {
      url: "https://autoselectgroups.com/wp-content/uploads/elementor/thumbs/FRANCISCOR-p8c03xvh1mr47hxdbe5g2rigjycxjq3i3wr1587r72.png",
      alt: "Francisco Raphael, Certified Trade Appraisal at Auto Select",
    },
    otherLanguages: ["Spanish"],
    needsConfirmation: [],
  },
  {
    id: "tina-latt",
    name: "Tina Latt",
    initials: "TL",
    title: "Office Manager",
    bio: "Tina has been in the car business since her twenties, with experience in titles, arbitration, fleet and lease, and marketing. Friendly and outgoing, she loves helping people get into the car they've been wanting.",
    photo: { url: "https://autoselectgroups.com/wp-content/uploads/elementor/thumbs/IMG_0198-scaled-pdqykma2bpndqwdv238w6pnv2qblehcrlydpdns1gu.jpg", alt: "Tina Latt, Office Manager at Auto Select" },
    otherLanguages: [],
    needsConfirmation: [],
  },
  {
    id: "carlos-luengo",
    name: "Carlos Luengo",
    initials: "CL",
    title: "IT Specialist / Website Developer",
    bio: "Carlos brings more than 7 years of experience in customer service, marketing, and sales. Reliable and easy to work with, with a positive outlook. Fluent in Spanish.",
    photo: {
      url: "https://autoselectgroups.com/wp-content/uploads/elementor/thumbs/CARLOSL-p8c03nj8ygcynscdzrojtc4e0prw71ygehkov6n33i.png",
      alt: "Carlos Luengo, IT Specialist / Website Developer at Auto Select",
    },
    otherLanguages: ["Spanish"],
    needsConfirmation: [],
  },
  {
    id: "josie-reyes",
    name: "Josie Reyes",
    initials: "JR",
    title: "Bookkeeper",
    bio: "Josie has more than 15 years of bookkeeping experience and has worked with Auto Select for 5 years. Professional and friendly.",
    photo: { url: "https://autoselectgroups.com/wp-content/uploads/elementor/thumbs/JOSIER-p8c04a3dih7ueffmc1flh6fg9yopbsg0hl8cdtpmy6.png", alt: "Josie Reyes, Bookkeeper at Auto Select" },
    otherLanguages: [],
    needsConfirmation: [],
  },
  {
    id: "robert-garcia",
    name: "Robert Garcia",
    initials: "RG",
    title: "Certified Mobile Mechanic",
    bio: "Robert has more than 25 years of experience working on new and used cars. Reliable, dependable, and honest.",
    photo: {
      url: "https://autoselectgroups.com/wp-content/uploads/elementor/thumbs/ROBERT-GARCIA-p8c04zh0n06l3wer7ueiui0wbd7m3m8rl2ugcao0a6.png",
      alt: "Robert Garcia, Certified Mobile Mechanic at Auto Select",
    },
    otherLanguages: [],
    needsConfirmation: [],
  },
];

/** True when the previous site showed an open "coming soon" slot in the team grid (currently one). */
export const hasOpenPosition = true;

/** Team members whose bios list Spanish fluency. Confirm before advertising Spanish-language service. */
export const spanishSpeakers = team.filter((m) => m.otherLanguages.includes("Spanish"));
