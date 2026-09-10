import { business } from "@/config/business";

/**
 * Car-buying guides. Plain-text blocks (no HTML) rendered by /blog/[slug].
 * Keep guidance general and cautious: no rate promises, no guarantees, and a short
 * disclaimer where the topic touches financial, legal, or mechanical decisions.
 */
export type BlogBlock =
  | { type: "p" | "h2" | "h3"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "callout"; text: string };

export type BlogCategory =
  | "Financing"
  | "Test Drives"
  | "Trade-Ins"
  | "Delivery"
  | "Service Contracts"
  | "Vehicle Locating"
  | "Buying Guide";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  datePublished: string;
  readingMinutes: number;
  category: BlogCategory;
  body: BlogBlock[];
}

const provider = business.financing.providerName;

const drafts: Omit<BlogPost, "readingMinutes">[] = [
  /* ───────────────────────── Financing ───────────────────────── */
  {
    slug: "how-auto-financing-works",
    title: "How Auto Financing Works",
    description:
      "Pre-qualification vs. approval, APR, loan term, down payment, and total cost — what each one means and what lenders look at before you apply.",
    datePublished: "2026-09-10",
    category: "Financing",
    body: [
      {
        type: "p",
        text: "Most people finance at least part of a vehicle purchase. The process is much easier when you understand a few terms before you apply. Here's how auto financing generally works, what lenders look at, and how to compare offers so you know the full cost — not just the monthly payment.",
      },
      { type: "h2", text: "Pre-qualification vs. approval" },
      {
        type: "p",
        text: "Pre-qualification is an early estimate. You share basic information, and a lender or credit service gives you an idea of whether you're likely to qualify and what terms might look like. It's useful for setting a budget, but it isn't a loan offer.",
      },
      {
        type: "p",
        text: "Approval comes later. The lender reviews a full application — including your credit report, income, and the specific vehicle — and decides whether to lend, how much, and at what rate and term. Final terms can differ from a pre-qualification estimate.",
      },
      {
        type: "callout",
        text: "Pre-qualification helps you plan, but it doesn't guarantee approval or a specific rate. Only the lender's final approval sets your terms.",
      },
      { type: "h2", text: "The numbers that shape your loan" },
      { type: "h3", text: "Annual percentage rate (APR)" },
      {
        type: "p",
        text: "APR is the yearly cost of borrowing, expressed as a percentage. It includes the interest rate and may include certain lender fees. A lower APR means you pay less to borrow the same amount. Rates are set by the lender based on your application and market conditions.",
      },
      { type: "h3", text: "Loan term" },
      {
        type: "p",
        text: "The term is how long you have to repay the loan, usually stated in months, such as 48, 60, or 72. A longer term lowers the monthly payment but usually increases the total interest you pay. It can also leave you owing more than the vehicle is worth for a longer period.",
      },
      { type: "h3", text: "Down payment" },
      {
        type: "p",
        text: "Your down payment — cash, trade-in equity, or both — reduces the amount you borrow. A larger down payment lowers your monthly payment and total interest, and it can strengthen your application.",
      },
      { type: "h3", text: "Amount financed" },
      {
        type: "p",
        text: "This is the price of the vehicle plus tax, title, license, and any fees or optional products you choose, minus your down payment and trade-in equity. Interest is calculated on this amount.",
      },
      { type: "h2", text: "Compare total cost, not just the monthly payment" },
      {
        type: "p",
        text: "Two loans can have similar monthly payments and very different total costs. Before you sign, make sure you know:",
      },
      {
        type: "ul",
        items: [
          "The APR and the loan term in months",
          "The amount financed",
          "The total of all payments over the life of the loan",
          "Any fees or optional products included in the amount financed",
        ],
      },
      {
        type: "p",
        text: "Lenders are required to disclose these figures in writing before you sign a credit contract. Read them carefully, and ask about anything that isn't clear.",
      },
      { type: "h2", text: "What lenders typically consider" },
      { type: "p", text: "Every lender has its own criteria, but most look at a similar set of factors:" },
      {
        type: "ul",
        items: [
          "Credit history and credit score",
          "Income and how steady it is",
          "Existing monthly debts compared with your income",
          "The size of your down payment",
          "The vehicle's age, mileage, and price",
          "The loan term you're requesting",
        ],
      },
      {
        type: "p",
        text: "If your credit history is limited or has some challenges, you can still apply. Approval and terms depend on each lender's requirements.",
      },
      { type: "h2", text: "How to prepare before you apply" },
      {
        type: "ol",
        items: [
          "Check your credit reports for errors. You can request free reports at AnnualCreditReport.com.",
          "Set a monthly budget that includes insurance, fuel, and maintenance — not just the loan payment.",
          "Decide how much you can put down and whether you'll trade in a vehicle.",
          "Gather recent pay stubs or other proof of income, plus proof of residence.",
          "Use a payment calculator as a rough guide, keeping in mind that actual terms come from the lender.",
        ],
      },
      { type: "h2", text: "Applying with Auto Select" },
      {
        type: "p",
        text: `When you're ready, you can start with our secure online financing application. It's provided by a third-party service, ${provider}, so the information you enter goes through that provider's secure system. Our team will review the results with you, explain your options, and answer questions before you commit to anything.`,
      },
      {
        type: "p",
        text: "Submitting an application doesn't obligate you to buy, and it doesn't guarantee approval. Approval, rates, and terms depend on lender requirements and your qualifications.",
      },
      {
        type: "callout",
        text: "This article is general information, not financial advice. For guidance on your specific situation, talk with a qualified financial professional.",
      },
    ],
  },

  /* ───────────────────────── Test drives ───────────────────────── */
  {
    slug: "what-to-bring-to-a-test-drive",
    title: "What to Bring to a Test Drive (and What to Check)",
    description:
      "A practical test-drive checklist: the documents to bring, what to evaluate before and during the drive, and the questions to ask before you buy a used vehicle.",
    datePublished: "2026-09-10",
    category: "Test Drives",
    body: [
      {
        type: "p",
        text: "A test drive is your best chance to find out whether a vehicle fits your daily life. A little preparation helps you make the most of that time. Here's what to bring, what to check, and what to ask.",
      },
      { type: "h2", text: "What to bring" },
      {
        type: "ul",
        items: [
          "A valid driver's license. Expect the dealership to check it before you drive.",
          "Proof of auto insurance, such as your insurance card or app.",
          "Your phone, to test Bluetooth, charging ports, and smartphone connections.",
          "Any car seats or gear you use regularly, to confirm they fit.",
          "Your list of questions and notes from your research.",
          "A second driver, if someone else will share the vehicle.",
        ],
      },
      {
        type: "p",
        text: "If you plan to trade in a vehicle, drive it to the appointment and bring its title or payoff information. That way it can be looked at the same day.",
      },
      { type: "h2", text: "Before you start the engine" },
      { type: "p", text: "Take a few minutes to walk around the vehicle and sit in it before you drive." },
      {
        type: "ul",
        items: [
          "Check the tire tread and make sure all four tires match.",
          "Look for uneven gaps between body panels or paint that doesn't match, which can point to past repairs.",
          "Look under the vehicle for fresh drips.",
          "Adjust the seat, steering wheel, and mirrors. Make sure you can see clearly and reach every control comfortably.",
          "Test the lights, turn signals, wipers, windows, locks, and power seats.",
          "Turn the A/C to its coldest setting and confirm it blows cold — especially important in South Texas.",
        ],
      },
      { type: "h2", text: "On the road" },
      {
        type: "p",
        text: "Try to drive the kinds of roads you use every day: neighborhood streets, stop-and-go traffic, and a highway on-ramp if possible. Pay attention to:",
      },
      {
        type: "ul",
        items: [
          "Acceleration: Is it smooth when you merge or pass?",
          "Braking: Does the vehicle stop straight, without pulling, grinding, or a pulsing pedal?",
          "Steering: Does it track straight on a level road, and does the wheel return to center after a turn?",
          "Transmission: Are shifts smooth, without slipping, hesitation, or clunks?",
          "Ride and noise: Listen for rattles, wind noise, or a hum that changes with speed.",
          "Warning lights: Every dashboard warning light should go off shortly after the engine starts.",
        ],
      },
      {
        type: "p",
        text: "Before you finish, park the vehicle. Make sure it's easy to maneuver in a parking lot and that the backup camera and any parking sensors work.",
      },
      { type: "h2", text: "Questions to ask" },
      {
        type: "ul",
        items: [
          "Is a vehicle history report available?",
          "What service records come with the vehicle?",
          "Are there any open safety recalls? You can also check the VIN at NHTSA.gov/recalls.",
          "Is any manufacturer warranty coverage remaining?",
          "What's the total price, including tax, title, license, and fees?",
          "Can I have the vehicle inspected by a mechanic of my choice before I buy?",
        ],
      },
      { type: "h2", text: "After the drive" },
      {
        type: "p",
        text: "Write down your impressions while they're fresh, especially if you're comparing several vehicles. Note anything you liked, anything that bothered you, and any questions that came up. A short list makes it much easier to compare options side by side.",
      },
      { type: "h2", text: "Scheduling a test drive with Auto Select" },
      {
        type: "p",
        text: "We can arrange test drives around your schedule during business hours. Request a time online or give us a call, and a team member will contact you to confirm. Your request isn't confirmed until you hear from us.",
      },
    ],
  },

  /* ───────────────────────── Trade-ins ───────────────────────── */
  {
    slug: "how-trade-in-estimates-work",
    title: "How Trade-In Estimates Work",
    description:
      "Why an online trade-in estimate can change after inspection, what affects your vehicle's value, and how payoff, paperwork, and the title work.",
    datePublished: "2026-09-10",
    category: "Trade-Ins",
    body: [
      {
        type: "p",
        text: "Trading in your current vehicle can simplify buying your next one. You handle both sides of the transaction in one place, and any equity in your trade-in can go toward your purchase. Here's how trade-in values are determined and how to prepare.",
      },
      { type: "h2", text: "Online estimate vs. in-person inspection" },
      {
        type: "p",
        text: "An online estimate is a starting point based on the details you provide: year, make, model, trim, mileage, condition, and photos. It helps you plan, but it's preliminary.",
      },
      {
        type: "p",
        text: "The final number comes after the vehicle is inspected in person. The appraiser confirms the condition and equipment, looks for issues that don't show up in photos, and reviews the vehicle's history. The more accurate your description and photos, the fewer surprises there are at inspection.",
      },
      { type: "callout", text: "An online trade-in estimate is not an offer. The final value depends on an in-person inspection." },
      { type: "h2", text: "What affects trade-in value" },
      {
        type: "ul",
        items: [
          "Mileage: Lower mileage for the vehicle's age generally helps.",
          "Mechanical condition: Warning lights, leaks, unusual noises, or overdue maintenance lower value.",
          "Cosmetic condition: Dents, scratches, damaged wheels, cracked glass, and interior wear or odors all count.",
          "Tires and brakes: Items that will need replacing soon reduce value.",
          "Vehicle history: Accidents, flood damage, or a branded title can significantly reduce value.",
          "Equipment: Trim level and options matter, and so do missing keys or remotes.",
          "Market demand: Values rise and fall with what buyers in the area are looking for.",
        ],
      },
      { type: "h2", text: "If you still owe money on the vehicle" },
      {
        type: "p",
        text: "You can often trade in a vehicle that isn't paid off. The payoff amount — the exact amount needed to close the loan on a given date — is confirmed with your lender, and it can differ slightly from the balance on your statement.",
      },
      {
        type: "ul",
        items: [
          "Positive equity: If the trade-in value is more than the payoff, the difference can be applied to your next purchase.",
          "Negative equity: If you owe more than the vehicle is worth, the difference still has to be paid. It may be paid in cash or, if the lender allows, added to your new loan, which increases the amount you finance.",
        ],
      },
      {
        type: "p",
        text: "Keep making your regular payments until the old loan is confirmed paid off, and keep a copy of that confirmation for your records.",
      },
      { type: "h2", text: "Paperwork to bring" },
      {
        type: "ul",
        items: [
          "The title, if the vehicle is paid off. Everyone listed on the title may need to sign.",
          "Your lender's name and your account number, if there's a loan",
          "Current registration",
          "A valid photo ID",
          "All keys, remotes, and key fobs",
          "Service records, if you have them",
        ],
      },
      { type: "h2", text: "About the title" },
      {
        type: "p",
        text: "The title shows who legally owns the vehicle. If your lender holds the title, it's released once the loan is paid off. If you've lost your title, you'll typically need to request a certified copy through the Texas Department of Motor Vehicles before the sale can be completed. Our team can tell you what's needed for your situation.",
      },
      { type: "h2", text: "How to get the most accurate estimate" },
      {
        type: "ol",
        items: [
          "Describe the condition honestly, including any warning lights or damage.",
          "Upload clear photos of every side, the interior, the odometer, and any damage.",
          "Clean the vehicle inside and out before the inspection.",
          "Gather your service records.",
          "Bring every key and remote.",
        ],
      },
      {
        type: "p",
        text: "Ready to start? Share your vehicle's details and photos through our trade-in form, and we'll follow up with a preliminary estimate and the next steps.",
      },
    ],
  },

  /* ───────────────────────── Delivery ───────────────────────── */
  {
    slug: "how-vehicle-delivery-works",
    title: "How Vehicle Delivery Works",
    description:
      "What to expect when you have a vehicle delivered: the steps, the paperwork to have ready, and what to inspect before you sign.",
    datePublished: "2026-09-10",
    category: "Delivery",
    body: [
      {
        type: "p",
        text: "Having a vehicle delivered can save you a trip, especially if you're shopping online or have a busy schedule. Here's how the process generally works, what paperwork to expect, and what to check when the vehicle arrives.",
      },
      {
        type: "callout",
        text: "Delivery availability, area, and any fees are confirmed by Auto Select for each purchase. Please contact us before planning around delivery.",
      },
      { type: "h2", text: "Step by step" },
      {
        type: "ol",
        items: [
          "Choose your vehicle. Confirm the price, the total out-the-door cost, and availability with our team.",
          "Arrange payment. Complete a financing application or confirm how you'll pay. If you're trading in a vehicle, share its details so it can be included in the numbers.",
          "Review the paperwork. We'll go over the purchase documents and explain the costs before anything is signed.",
          "Schedule the delivery. Choose a date, time window, and address — home or office — and tell us about parking, gate codes, or other access notes.",
          "Inspect and sign. When the vehicle arrives, look it over, review the documents, and sign once you're satisfied.",
        ],
      },
      {
        type: "p",
        text: "If you're trading in a vehicle, we'll explain how and when the trade-in will be inspected and handed off.",
      },
      { type: "h2", text: "Paperwork to have ready" },
      {
        type: "ul",
        items: [
          "A valid driver's license for each buyer",
          "Proof of insurance for the vehicle you're buying — call your insurance company before delivery day",
          "Your down payment method, if a payment is due at delivery",
          "Proof of income or residence, if your lender asked for it",
          "Your trade-in's title or payoff information, plus all of its keys",
        ],
      },
      {
        type: "p",
        text: "Our team will walk you through the title and registration paperwork, including Texas sales tax and fees, so you know what to expect before delivery day.",
      },
      { type: "h2", text: "What to inspect when the vehicle arrives" },
      {
        type: "p",
        text: "Take your time. Delivery is your chance to confirm you're receiving exactly the vehicle you agreed to buy.",
      },
      {
        type: "ul",
        items: [
          "Match the VIN on the vehicle — on the dashboard near the windshield and on the driver's door jamb — to the VIN on your paperwork.",
          "Compare the odometer reading with the documents.",
          "Walk around the vehicle in good light and look for any scratches, dents, or damage you weren't told about.",
          "Confirm the tires, wheels, and glass are in the condition you expected.",
          "Start the engine and make sure no warning lights stay on.",
          "Test the A/C, lights, windows, locks, and infotainment system.",
          "Make sure you receive every key and remote you were told about.",
          "Confirm that any promised repairs or items were completed, and get them in writing.",
        ],
      },
      {
        type: "p",
        text: "If something doesn't match, point it out before you sign. Questions are easiest to resolve while the paperwork is still open.",
      },
      { type: "h2", text: "Questions to ask before delivery day" },
      {
        type: "ul",
        items: [
          "Is delivery available to my address, and is there a fee?",
          "What time window should I expect?",
          "Who needs to be present to sign?",
          "What forms of payment are accepted at delivery?",
          "How will license plates and registration be handled?",
        ],
      },
      { type: "h2", text: "Requesting delivery from Auto Select" },
      {
        type: "p",
        text: "To request delivery, use our delivery form or give us a call. A team member will confirm availability, timing, and any costs for your specific purchase before anything is scheduled.",
      },
    ],
  },

  /* ───────────────────────── Service contracts ───────────────────────── */
  {
    slug: "what-service-contracts-may-cover",
    title: "What Vehicle Service Contracts May Cover",
    description:
      "How a service contract differs from a manufacturer warranty and auto insurance, common coverage categories, and what to read before you sign.",
    datePublished: "2026-09-10",
    category: "Service Contracts",
    body: [
      {
        type: "p",
        text: "A vehicle service contract — often called an extended warranty — helps pay for certain repairs after you buy a vehicle. It can make repair costs more predictable, but contracts vary widely. Here's how they work and what to look for.",
      },
      { type: "h2", text: "Service contract vs. warranty vs. insurance" },
      {
        type: "ul",
        items: [
          "A manufacturer warranty comes from the automaker and is included with a new vehicle for a set time or mileage. A used vehicle may still have some factory coverage remaining, depending on its age and mileage.",
          "A service contract is a separate, optional agreement you can purchase. It covers specific repairs for a set term, according to the contract's terms.",
          "Auto insurance covers damage from events such as accidents, theft, and weather. It generally doesn't cover mechanical breakdowns or normal wear.",
        ],
      },
      {
        type: "p",
        text: "These work alongside each other; one doesn't replace another. You'll need auto insurance whether or not you buy a service contract.",
      },
      { type: "h2", text: "Common coverage categories" },
      { type: "p", text: "Contracts are often offered in levels. Depending on the plan, coverage may include:" },
      {
        type: "ul",
        items: [
          "Powertrain: engine, transmission, and drive axle components",
          "Steering and suspension",
          "Brake system components, usually excluding pads and rotors, which wear with normal use",
          "Air conditioning and heating",
          "Electrical systems, such as the alternator, starter, and power accessories",
          "Fuel and cooling systems",
          "Technology such as navigation, sensors, and infotainment, on more comprehensive plans",
        ],
      },
      {
        type: "p",
        text: "Some plans also include extras such as roadside assistance, towing, or rental reimbursement. Whether any of these are included depends on the specific contract.",
      },
      { type: "h2", text: "What's usually not covered" },
      {
        type: "ul",
        items: [
          "Routine maintenance, such as oil changes, filters, and tire rotations",
          "Wear items, such as brake pads, wiper blades, and tires",
          "Damage from accidents, misuse, or skipped maintenance",
          "Problems that existed before the contract started",
          "Cosmetic items",
        ],
      },
      { type: "h2", text: "Read the contract before you decide" },
      {
        type: "p",
        text: "The contract itself — not a brochure or a summary — defines what's covered. Before you buy, look for:",
      },
      {
        type: "ul",
        items: [
          "Term: how many months or miles the coverage lasts, and when it starts",
          "Deductible: what you pay out of pocket, and whether it applies per visit or per repair",
          "Covered components: whether the contract lists what is covered, or lists only what isn't",
          "Repair shops: whether you can use any licensed repair facility or must use specific shops",
          "Claims process: whether repairs need approval before work begins",
          "Maintenance requirements: the records you must keep for coverage to stay valid",
          "Cancellation and transfer: whether you can cancel for a partial refund or transfer the contract if you sell the vehicle. These terms vary by contract.",
          "Who backs the contract: the company responsible for paying claims",
        ],
      },
      { type: "h2", text: "Is a service contract right for you?" },
      {
        type: "p",
        text: "It depends on the vehicle, how long you plan to keep it, how much you drive, and how comfortable you are paying for an unexpected repair out of pocket. Some drivers value the predictability; others prefer to set money aside for repairs instead. Both are reasonable choices.",
      },
      {
        type: "p",
        text: "At Auto Select, service contracts are always optional. They're never required to buy a vehicle, and we won't pressure you to add one. If you're interested, we'll help you compare options and answer your questions so you can decide what fits.",
      },
      {
        type: "callout",
        text: "This article is general information, not legal or financial advice. Coverage is defined only by the terms of the specific service contract.",
      },
    ],
  },

  /* ───────────────────────── Vehicle locating ───────────────────────── */
  {
    slug: "how-our-vehicle-locating-service-works",
    title: "How Our Vehicle Locating Service Works",
    description:
      "Can't find the right vehicle in stock? Here's how Auto Select searches for it: you describe what you want, we search, you review the options, and you decide.",
    datePublished: "2026-09-10",
    category: "Vehicle Locating",
    body: [
      {
        type: "p",
        text: "Sometimes the vehicle you want isn't in our inventory today. Our vehicle locating service helps close that gap: you tell us what you're looking for, and our team searches for vehicles that match. Here's how it works, step by step.",
      },
      {
        type: "p",
        text: "A locating request is a good fit if you have a specific model, trim, or feature list in mind, if you've been searching on your own without luck, or if you'd rather have someone with dealership experience do the legwork. It also helps when you want the same team to handle your trade-in and financing.",
      },
      { type: "h2", text: "1. Describe the vehicle you want" },
      { type: "p", text: "The more specific you are, the better we can search. Our Find a Vehicle request asks for:" },
      {
        type: "ul",
        items: [
          "Year range, make, model, and trim",
          "Body style and must-have features",
          "Preferred exterior and interior colors",
          "Maximum mileage",
          "Your budget or target monthly payment range",
          "Your timeline",
          "Whether you have a trade-in",
        ],
      },
      {
        type: "p",
        text: "Tell us what matters most and where you're flexible. Being open on color or trim, for example, can widen the search considerably.",
      },
      { type: "h2", text: "2. We search" },
      {
        type: "p",
        text: "Our team draws on decades of combined dealership experience to look for vehicles that match your request. We look at more than price: mileage, condition, history, and equipment all factor into whether a vehicle is worth recommending.",
      },
      {
        type: "p",
        text: "How long this takes depends on how common the vehicle is and how specific your request is. We'll keep you updated and let you know if adjusting a detail would open up more options.",
      },
      { type: "h2", text: "3. Review your options" },
      { type: "p", text: "When we find a potential match, we'll share the details with you, including:" },
      {
        type: "ul",
        items: [
          "Year, make, model, trim, and mileage",
          "Photos and the vehicle's equipment",
          "Vehicle history information, when available",
          "The price and an estimate of the total cost, including tax, title, license, and fees",
          "The expected timing to get the vehicle to you",
        ],
      },
      {
        type: "p",
        text: "Ask as many questions as you like. If an option isn't right, tell us why — it helps us refine the search.",
      },
      { type: "h2", text: "4. You decide" },
      {
        type: "p",
        text: "Nothing is final until you decide. When you choose a vehicle, we can help with the rest of the purchase in one place:",
      },
      {
        type: "ul",
        items: [
          "Your financing application, if you're financing",
          "Your trade-in evaluation, if you have one",
          "Title and registration paperwork",
          "Delivery or pickup, depending on what works for you and what's available",
        ],
      },
      { type: "h2", text: "Tips for a smoother search" },
      {
        type: "ul",
        items: [
          "Get pre-qualified early, so you know your budget before a good match comes along.",
          "Share your trade-in details up front, so they can be included in the numbers.",
          "Rank your must-haves, so we can quickly tell whether a vehicle is a good fit.",
          "Respond quickly when we send options — well-priced used vehicles can sell fast.",
        ],
      },
      {
        type: "callout",
        text: "We can't guarantee that a specific vehicle will be found or will stay available, but we'll be upfront about what we find and how long it may take.",
      },
      {
        type: "p",
        text: "Ready to start? Submit a Find a Vehicle request, or call us to talk through what you're looking for.",
      },
    ],
  },

  /* ───────────────────────── Buying guide ───────────────────────── */
  {
    slug: "buying-a-used-car-in-san-antonio",
    title: "Buying a Used Car in San Antonio: A Practical Guide",
    description:
      "Tips for buying a used car in the San Antonio area: heat and sun wear, flood-damage warning signs, checking the title, Texas registration basics, and budgeting for tax and fees.",
    datePublished: "2026-09-10",
    category: "Buying Guide",
    body: [
      {
        type: "p",
        text: "Buying a used vehicle in San Antonio comes with a few local considerations. Long, hot summers, strong sun, and occasional flash flooding all affect how vehicles age here, and Texas has its own process for title, registration, and taxes. Use this guide as a checklist.",
      },
      { type: "h2", text: "Heat and sun: what to check" },
      { type: "p", text: "South Texas heat is hard on vehicles. Pay extra attention to the parts that work hardest here." },
      {
        type: "ul",
        items: [
          "Air conditioning: Run it on the coldest setting for several minutes. It should blow steadily cold, even at idle. Weak cooling can point to a refrigerant leak or a failing component.",
          "Battery: Heat shortens battery life. Look for a date on the battery label, and ask whether it has been tested recently.",
          "Tires: Check tread depth and look for cracks in the sidewalls, which heat and sun can speed up. Every tire has a date code on the sidewall — tires age even when tread remains.",
          "Cooling system: Look for coolant leaks, and watch the temperature gauge during your test drive.",
          "Paint and interior: Sun exposure can fade paint, crack dashboards, and wear out seat material. Look closely at the roof, hood, and dashboard.",
          "Rubber and plastic: Belts, hoses, and wiper blades can dry out and crack faster in the heat.",
        ],
      },
      { type: "h2", text: "Watch for flood damage" },
      {
        type: "p",
        text: "Heavy rain can cause flash flooding in the San Antonio area, and flood-damaged vehicles sometimes return to the market. Warning signs include:",
      },
      {
        type: "ul",
        items: [
          "A musty or mildew smell, or heavy air freshener covering one up",
          "Damp carpet, or carpet that looks newer than the rest of the interior",
          "Silt, mud, or a water line in the trunk, under the seats, or in the spare-tire well",
          "Rust on seat rails, screws, or under the dashboard where you wouldn't expect it",
          "Fogging inside the headlights or taillights",
          "Electrical problems, such as flickering lights or windows that act up",
        ],
      },
      {
        type: "p",
        text: "A vehicle history report can show a reported flood event or a flood-branded title, but not all damage gets reported. An independent pre-purchase inspection adds another layer of protection.",
      },
      { type: "h2", text: "Check the title" },
      { type: "p", text: "Before you buy, review the title or ask to see it." },
      {
        type: "ul",
        items: [
          "Confirm that the VIN on the title matches the VIN on the vehicle.",
          "Look for brands such as salvage, rebuilt, or flood. A branded title affects value, insurance, and financing.",
          "Check whether a lien is listed. A lien must be released before ownership can transfer.",
          "Make sure the seller's name matches the name on the title.",
        ],
      },
      { type: "h2", text: "Inspection and registration basics" },
      {
        type: "p",
        text: "When you buy from a Texas dealership, the dealer generally submits the title and registration paperwork for you. When you buy from a private seller, you're typically responsible for filing the title transfer with your county tax office, generally within 30 days of the sale. At Auto Select, our team will walk you through the title and registration paperwork for your purchase.",
      },
      {
        type: "p",
        text: "Texas inspection requirements have changed in recent years and can depend on the vehicle and the county where it's registered, including whether emissions testing applies. Check the current rules with the Texas Department of Motor Vehicles and the Texas Department of Public Safety before you register.",
      },
      { type: "h2", text: "Budget for tax, title, and license" },
      { type: "p", text: "The vehicle's price isn't the whole cost. In Texas, plan for:" },
      {
        type: "ul",
        items: [
          "Motor vehicle sales tax of 6.25% of the sales price. When you trade in a vehicle at a dealership, the tax is generally calculated on the price after the trade-in credit.",
          "A title application fee",
          "Registration fees, which vary by vehicle type and can include local county fees",
          "Any dealer documentary fee, if one is charged",
        ],
      },
      {
        type: "p",
        text: "Fees change from time to time and can vary by county. Confirm current amounts with the Bexar County Tax Assessor-Collector's office, or with the tax office in the county where you'll register the vehicle.",
      },
      {
        type: "p",
        text: "Don't forget ongoing costs such as insurance, fuel, and maintenance. Get an insurance quote on the specific vehicle before you buy, since rates can vary widely by model.",
      },
      { type: "h2", text: "A quick pre-purchase checklist" },
      {
        type: "ol",
        items: [
          "Set a total budget, including tax, title, license, and insurance.",
          "Get pre-qualified for financing, if you're financing.",
          "Review the vehicle history report and the title.",
          "Check the A/C, battery, tires, and cooling system.",
          "Look for signs of flood damage.",
          "Test drive on both city streets and the highway.",
          "Consider an independent pre-purchase inspection.",
          "Ask for the total out-the-door price in writing.",
        ],
      },
      {
        type: "callout",
        text: "This article is general information, not legal, tax, or mechanical advice. Texas requirements and fees change, so confirm current rules with the Texas DMV and your county tax office.",
      },
    ],
  },
];

function wordCount(blocks: BlogBlock[]) {
  return blocks.reduce((n, b) => {
    const text = "items" in b ? b.items.join(" ") : b.text;
    return n + text.split(/\s+/).filter(Boolean).length;
  }, 0);
}

/** All guides, newest first. Reading time is computed from the body at ~225 words per minute. */
export const posts: BlogPost[] = drafts
  .map((p) => ({ ...p, readingMinutes: Math.max(1, Math.round(wordCount(p.body) / 225)) }))
  .sort((a, b) => b.datePublished.localeCompare(a.datePublished));

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

/** Other guides to suggest after an article (deterministic: the next posts in list order). */
export function getRelatedPosts(slug: string, count = 3): BlogPost[] {
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return posts.slice(0, count);
  return Array.from({ length: Math.min(count, posts.length - 1) }, (_, k) => posts[(i + 1 + k) % posts.length]);
}

const postDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

/** "2026-09-10" → "September 10, 2026" (UTC, so the date never shifts by time zone). */
export function formatPostDate(iso: string) {
  return postDate.format(new Date(`${iso}T00:00:00Z`));
}

/** Stable anchor id for an in-article heading. */
export function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
