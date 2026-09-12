import type { Review } from "@/lib/types";

/**
 * Customer reviews from the previous site (autoselectgroups.com) and hand-picked from Auto
 * Select's Google Business Profile. Grammar and punctuation are lightly corrected; meaning is
 * unchanged. This is a small curated subset, not a complete pull of every review — do NOT
 * generate AggregateRating/site-wide review schema from this list; Google's structured-data
 * guidelines require that to reflect genuine, complete review data, not a hand-picked sample.
 * Per-review star ratings are fine to display since each one is real and verifiable.
 */
export const reviews: Review[] = [
  {
    id: "anna-bertetti",
    author: "Anna Bertetti",
    body: "A big thank you to Patrick and Veronica for making the whole car-buying process unbelievably easy. They knew I didn't have hours to spare, so they let me test-drive the car I wanted during my lunch break and made sure it was the perfect fit. I went back to work and signed everything online — no 4-hour dealership wait. I'll absolutely be recommending them to my friends and family.",
    rating: 5,
    source: "Google",
    sourceUrl: null,
  },
  {
    id: "dora-chau",
    author: "Dora Chau",
    body: "I went to Auto Select not expecting to drive out in a different car as a satisfied customer. Patrick and Johnny are the go-to guys if you want great deals quickly. I cannot stress how flexible these guys are. They will work with you — just come in and see what they've got. They'll have something that works for you! Update: I got a warranty through Auto Select and again they were willing to work with me. Thanks, Veronica!",
    rating: 5,
    source: "Google",
    sourceUrl: null,
  },
  {
    id: "hector-parrilla",
    author: "Hector Parrilla",
    body: "Thank you, Patrick and Veronica! I truly appreciate the excellent service and smooth process. You both made the experience easy and enjoyable from start to finish. I'm very happy with my Toyota 4Runner and grateful for your help! Definitely recommended.",
    rating: 5,
    source: "Google",
    sourceUrl: null,
  },
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
