import type { Review } from "@/lib/types";

/**
 * Customer reviews published on the previous site (autoselectgroups.com).
 * Grammar and punctuation are lightly corrected; meaning is unchanged.
 * These are the only verified reviews — no star ratings exist, so none are shown and
 * no aggregate-rating schema should ever be generated from this list.
 */
export const reviews: Review[] = [
  {
    id: "tremayne-williams",
    author: "Tremayne Williams",
    body: "The salesmen were awesome and very helpful. I'm a very happy customer, and I would recommend them to friends and family when it comes to selling and looking for a car. Thank you, Larry and Patrick — you guys are awesome.",
    rating: null,
    source: "autoselectgroups.com",
    sourceUrl: null,
  },
  {
    id: "karen-herzing",
    author: "Karen Herzing",
    body: "Auto Select's car-buying experience was eye-opening. Patrick Simon and his family-owned business shared an experience with us that changed the way we buy a vehicle. If you're looking for less hassle and an opportunity to save money on your deal, Auto Select will be there for you.",
    rating: null,
    source: "autoselectgroups.com",
    sourceUrl: null,
  },
];
