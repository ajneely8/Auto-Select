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
  /* ───────────────────────── Buying guide (local) ───────────────────────── */
  {
    slug: "best-used-suvs-for-texas-families-live-oak",
    title: "Best Used SUVs for Texas Families: A Live Oak Buyer's Guide",
    description:
      "What to look for in a used SUV for a Texas family: third-row seating, towing, ground clearance for weather, and how to balance size against fuel costs and price.",
    datePublished: "2026-09-11",
    category: "Buying Guide",
    body: [
      {
        type: "p",
        text: "SUVs are one of the most popular vehicle types for families around Live Oak and San Antonio, and for good reason — they handle a car-seat-and-cargo lifestyle, highway commutes, and the occasional road trip better than most sedans. But \"SUV\" covers a wide range of vehicles, from compact crossovers to full-size three-row models. Here's how to figure out which size and features actually fit your family, rather than just the biggest one on the lot.",
      },
      { type: "h2", text: "Start with how you actually use the vehicle" },
      {
        type: "p",
        text: "It's easy to size up \"just in case,\" but a bigger SUV costs more to fuel, park, and maintain every single day, whether or not you use the extra space. Before you compare specific vehicles, get honest about a few things:",
      },
      {
        type: "ul",
        items: [
          "How many people ride with you regularly, and how often you need every seat filled versus just occasionally",
          "Whether you need three rows, or a two-row SUV with a large cargo area would actually work better",
          "How much you tow — a trailer, boat, or camper — since towing capacity varies enormously between models",
          "Your daily commute distance, especially if you're driving I-35 or 1604 into San Antonio regularly, where fuel economy adds up fast",
          "Where you park at home and at work or school — full-size SUVs can be a tight fit in some older Live Oak driveways and garages",
        ],
      },
      { type: "h2", text: "Compact vs. midsize vs. full-size" },
      { type: "h3", text: "Compact SUVs" },
      {
        type: "p",
        text: "Compact SUVs are the most fuel-efficient and easiest to park, with enough room for most small-to-medium families day to day. They're usually the better value if you rarely carry more than four or five people and don't tow.",
      },
      { type: "h3", text: "Midsize SUVs" },
      {
        type: "p",
        text: "Midsize SUVs, including many three-row models, balance passenger and cargo space with more manageable fuel costs than a full-size SUV. This size covers most families who occasionally need a third row for a carpool, grandparents, or a friend's kid, without the size and cost of a full-size model.",
      },
      { type: "h3", text: "Full-size SUVs" },
      {
        type: "p",
        text: "Full-size SUVs offer the most towing capacity and the most usable third-row space for adults, not just kids. They make sense if you regularly tow, regularly seat six or more adults, or need serious cargo room — but expect higher fuel and maintenance costs.",
      },
      { type: "h2", text: "Texas-specific things worth checking" },
      {
        type: "ul",
        items: [
          "Air conditioning performance: with a used SUV, run the A/C on its coldest setting for several minutes, including in the third row if it has separate rear controls. Weak rear cooling is a common, sometimes expensive, complaint on used three-row SUVs.",
          "Tire age and condition: SUVs are heavier than sedans, and Texas heat speeds up tire wear. Check the date code on the sidewall, not just tread depth.",
          "Towing package specifics, if you tow: a factory tow package usually includes a stronger cooling system and wiring, not just a hitch bolted on later. Ask what's actually included.",
          "Ground clearance and drivetrain, if you're near low-water crossings or flood-prone roads: all-wheel drive and higher clearance help, but no vehicle is safe to drive through moving floodwater.",
        ],
      },
      { type: "h2", text: "Weighing price against size" },
      {
        type: "p",
        text: "A larger, older SUV and a smaller, newer SUV can land at a similar price. Before you decide, compare more than the sticker number:",
      },
      {
        type: "ul",
        items: [
          "Estimated fuel cost for your actual commute, not just the EPA rating",
          "Mileage relative to age — a higher-mileage newer model may have more useful life left than a low-mileage older one",
          "What's included: third-row seating, roof rails, a tow package, or driver-assist features can be worth paying more for if you'll actually use them",
          "Total out-the-door cost, including Texas sales tax, title, and registration, not just the listed price",
        ],
      },
      {
        type: "callout",
        text: "There's no single \"best\" SUV for every family — the right size depends on how many people and how much cargo you actually carry most weeks, not the occasional trip.",
      },
      { type: "h2", text: "Finding the right one at Auto Select" },
      {
        type: "p",
        text: "You can filter our inventory by body style and price to see what's currently available, or submit a Find a Vehicle request if you have a specific size, row count, or towing need in mind and don't see it in stock today. Our team can also walk you through the differences between specific models side by side before you commit to a test drive.",
      },
    ],
  },

  {
    slug: "used-trucks-live-oak-tx-what-to-know",
    title: "Used Trucks in Live Oak, TX: What to Look for Before You Buy",
    description:
      "Bed length, cab size, towing and payload, 2WD vs. 4WD, and how Texas heat affects a used truck — a practical checklist before you buy in the San Antonio area.",
    datePublished: "2026-09-11",
    category: "Buying Guide",
    body: [
      {
        type: "p",
        text: "Trucks stay in demand around Live Oak and San Antonio for work, towing, and everyday driving alike. But the right used truck depends heavily on what you actually need it to do — a truck set up for hauling landscaping equipment is a very different vehicle from one set up for a daily commute with occasional weekend hauling. Here's what to think through before you buy.",
      },
      { type: "h2", text: "Cab and bed size trade-offs" },
      {
        type: "ul",
        items: [
          "Regular cab: the most bed length and typically the lowest price, with little to no back-seat space — best if you rarely carry passengers.",
          "Extended or double cab: a middle ground with small rear seats or jump seats and a slightly shorter bed than a regular cab on the same frame.",
          "Crew cab: full-size rear seating for passengers or car seats, usually paired with a shorter bed — the common choice for trucks used as a daily family vehicle.",
          "Bed length: a longer bed helps with full sheets of plywood, longer trailers, or bulky equipment; a short bed is easier to park and maneuver day to day.",
        ],
      },
      { type: "h2", text: "Towing and payload aren't the same thing" },
      {
        type: "p",
        text: "Towing capacity is how much a truck can pull behind it; payload is how much weight it can carry in the bed and cabin, including passengers and cargo. A truck can be well within its towing rating and still be overloaded on payload, or the other way around. If you tow or haul regularly:",
      },
      {
        type: "ul",
        items: [
          "Ask for the specific truck's payload and towing capacity, not just the model's advertised maximum — these vary by trim, cab, bed length, and engine.",
          "Check whether it has a factory tow package, which usually includes a stronger cooling system, transmission cooler, and wiring, not just a hitch.",
          "If you tow a trailer, boat, or camper regularly, weigh it (or get its listed weight) and compare it honestly against the truck's rated capacity, not just what feels fine on a short drive.",
        ],
      },
      { type: "h2", text: "2WD vs. 4WD for this area" },
      {
        type: "p",
        text: "Around Live Oak and San Antonio, most driving is on dry pavement, so two-wheel drive is often enough for day-to-day use and typically costs less to buy and maintain. Four-wheel drive is worth the extra cost if you regularly drive unpaved roads, tow heavy loads, or want more confidence in occasional heavy rain. It's rarely necessary for typical local commuting.",
      },
      { type: "h2", text: "What Texas heat and towing do to a used truck" },
      {
        type: "p",
        text: "Trucks that tow or haul work hard, and Texas summers add extra strain. Pay close attention to:",
      },
      {
        type: "ul",
        items: [
          "Transmission condition: shifts should be smooth with no slipping, hesitation, or hard clunks, especially under load or going up an on-ramp.",
          "Cooling system: check for leaks and watch the temperature gauge, particularly if the truck has clearly been used for towing.",
          "Suspension and tires: a truck used for hauling shows extra wear on shocks, tires, and sometimes the bed itself — look for uneven tire wear and check tire age via the sidewall date code.",
          "Frame and undercarriage: look underneath for rust or damage, especially on trucks that may have worked outside the immediate area.",
          "A/C performance: run it on the coldest setting for several minutes — a truck that's been idled a lot for work can show A/C wear sooner than a typical commuter vehicle.",
        ],
      },
      { type: "h2", text: "Questions worth asking before you buy" },
      {
        type: "ul",
        items: [
          "Was this truck used for towing, work, or fleet duty? A vehicle history report doesn't always capture heavy use.",
          "What's the actual payload and towing capacity for this specific configuration?",
          "Is there a spray-in or drop-in bed liner, and what does the bed look like underneath it?",
          "Are all the keys, remotes, and any tailgate or bed locks included?",
        ],
      },
      {
        type: "callout",
        text: "The right truck is the one sized for what you actually haul and tow most often — not the biggest available, and not the cheapest available, but the one that matches your regular use.",
      },
      { type: "h2", text: "Finding the right truck at Auto Select" },
      {
        type: "p",
        text: "Browse our current truck inventory by cab style, drivetrain, and price, or let us know your towing or payload needs through a Find a Vehicle request if you don't see the right fit today. We're happy to walk through the specific capacity numbers for any truck on our lot before you test drive it.",
      },
    ],
  },

  {
    slug: "commuting-live-oak-san-antonio-choosing-a-reliable-used-car",
    title: "Commuting from Live Oak to San Antonio: Choosing a Reliable Used Car",
    description:
      "What matters most in a used commuter car for the Live Oak–San Antonio drive: fuel economy, highway comfort, maintenance history, and reliability over raw features.",
    datePublished: "2026-09-11",
    category: "Buying Guide",
    body: [
      {
        type: "p",
        text: "If you commute from Live Oak into San Antonio, or across the metro for work, your daily drive probably means a mix of highway miles on I-35 or 1604 and stop-and-go traffic. A commuter car earns its keep through reliability and comfort on repeat trips, not just how it looks on a test drive around the block. Here's what to prioritize.",
      },
      { type: "h2", text: "Reliability matters more than features for a commuter" },
      {
        type: "p",
        text: "A car you drive 20,000+ miles a year needs to start every morning and handle routine maintenance without surprises. Before you fall for a feature list, look at the basics:",
      },
      {
        type: "ul",
        items: [
          "Service records: consistent oil changes and maintenance are a better sign than low mileage alone.",
          "Vehicle history report: check for accidents, and pay attention to how many previous owners the vehicle has had.",
          "Warning lights: every dashboard light should turn off shortly after starting the engine — anything that stays on deserves an explanation before you buy.",
          "Remaining factory warranty: some used vehicles still carry manufacturer coverage, which can reduce your risk in the first year or two of ownership.",
        ],
      },
      { type: "h2", text: "Fuel economy adds up faster than it seems" },
      {
        type: "p",
        text: "A small difference in miles per gallon compounds over a daily highway commute. When comparing two vehicles, estimate the actual fuel cost difference over a year based on your real commute distance, not just the EPA sticker numbers — traffic patterns and how much of your drive is highway versus stop-and-go both affect real-world mileage." ,
      },
      { type: "h2", text: "Comfort for the drive you actually do" },
      {
        type: "ul",
        items: [
          "Seat comfort on a longer drive: a short test drive around the block won't tell you how a seat feels after 30 or 45 minutes. If possible, take a longer test drive that includes highway speed.",
          "Road and wind noise at highway speed, since that's where you'll spend most commuting miles.",
          "Adaptive cruise control or lane-keeping features, if stop-and-go traffic on your route is a regular frustration — these are worth testing, not just reading about.",
          "A/C performance at highway speed and at idle in traffic, especially important for a Texas commute in summer.",
        ],
      },
      { type: "h2", text: "Sedan, hatchback, or crossover for commuting?" },
      {
        type: "p",
        text: "For a solo or two-person commute, a sedan or compact crossover is usually the most fuel-efficient and easiest to park option, without sacrificing much comfort. A crossover adds a higher seating position and more cargo flexibility at a modest fuel-economy cost. Larger SUVs and trucks cost more to fuel for a pure commute and are worth it mainly if you need the size for other regular uses, not just the drive to work." ,
      },
      { type: "h2", text: "A quick pre-purchase checklist for a commuter car" },
      {
        type: "ol",
        items: [
          "Review the vehicle history report and any available service records.",
          "Test drive on both highway and stop-and-go traffic, not just surface streets.",
          "Check A/C performance at idle and at speed.",
          "Confirm tire condition and age via the sidewall date code.",
          "Ask about remaining factory warranty coverage.",
          "Estimate your real annual fuel cost based on your actual commute distance.",
        ],
      },
      {
        type: "callout",
        text: "The most reliable-looking car on paper isn't always the best fit — weigh service history and how it feels on a real highway test drive as heavily as the spec sheet.",
      },
      { type: "h2", text: "Finding a dependable commuter at Auto Select" },
      {
        type: "p",
        text: "Filter our inventory by body style, mileage, and price, or tell us about your commute and budget through a Find a Vehicle request. Our team can point you toward vehicles with strong service history and answer questions about a specific vehicle's maintenance before you schedule a test drive.",
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
