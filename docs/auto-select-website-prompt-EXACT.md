# Original Auto Select website prompt (exact text)

The exact first prompt used to build autoselectgroups.com, copied unchanged from the build session (September 10, 2026).
The very first sentence was an add-on the owner typed in front of the main prompt (the working vehicle-questions agent). The main prompt starts at "You are a senior automotive website designer...".
Built with Claude Sonnet 5 (most of the work) and Claude Opus 5, in Claude Code. Not "Fable".
It contains Auto Select's own details. To reuse it for another dealership, use docs/dealership-website-prompt-template.md instead.

---

i also want a working agent on the website to answer question about vehicles that are currently on the inventory section You are a senior automotive website designer, conversion strategist, UX architect, copywriter, and full-stack developer.

Redesign and build a complete, production-ready website for:

AUTO SELECT
Tagline: We Make Car Buying Simple
Existing website: [autoselectgroups.com](https://autoselectgroups.com/)

The new site must look significantly more professional, credible, modern, clean, and conversion-focused than the existing website. It should feel like a premium automotive marketplace combined with the personal service of a trusted, family-owned local dealership.

IMPORTANT:
- Review the existing website and preserve all accurate public business information.
- Rewrite weak or repetitive copy into clear, polished American English.
- Do not invent certifications, awards, vehicle availability, lender relationships, review counts, APR guarantees, or business claims.
- Clearly mark content that needs dealership confirmation.
- Do not use AI-themed visuals or icons.
- Do not use robot icons, sparkle icons, magic-wand icons, chatbot mascots, brains, circuit patterns, AI gradients, or phrases such as "AI-powered."
- Avoid the generic AI-generated website appearance: excessive rounded cards, random gradients, oversized empty sections, excessive glass effects, fake statistics, and vague marketing copy.
- Use tasteful automotive icons only where they improve usability.
- Build working interactions, not static mockups.
- The result must be responsive, accessible, SEO-friendly, fast, and ready to deploy.

## Verified business information

Use the following information from the current website:

Business name:
Auto Select

Positioning:
An online car dealership offering inventory, vehicle-location assistance, financing, trade-ins, delivery, service contracts, and automotive services.

Address:
12702 Toepperwein Rd #230
Live Oak, TX 78233, USA

Office:
(210) 455-3050

Email:
info@autoselectgroups.com

Hours:
Monday-Saturday: 10:00 AM-6:00 PM
Sunday: Closed

Primary services:
- Vehicle inventory
- Vehicle locating and car-buying assistance
- Financing applications
- Trade-in evaluations
- Vehicle delivery
- Extended service contracts
- Certified mobile mechanic
- Tires and wheel balancing
- Body repair and painting
- Towing service
- Jump-start service

Existing financing application:
[700dealer.com](https://www.700dealer.com/QuickQualify/807b82f244f643f3b7a7a6255772a0db-2020624)

Social profiles:
Facebook: [facebook.com](https://www.facebook.com/AutoSelectgroups)
Instagram: [instagram.com](https://www.instagram.com/autoselect_usa/)

Existing customer comments:
1. "Salesmen were awesome and very helpful, I'm a very happy customer and I would recommend them to friends and family when it come to selling and looking for a car, thank you Larry and Patrick you guys are awesome." - Tremayne Williams

2. "Auto select's car buying experience was eye opening. Patrick Simon and his family owned business shared a experience with us that changed the way we buy a vehicle. If you're looking for less hassle and a opportunity to save money on your deal, auto select will be there for you." - Karen Herzing

Correct obvious grammar and punctuation in displayed reviews without changing their meaning.

Existing legal and informational pages:
- Terms of Use
- Privacy Policy
- FAQ
- Blog

Existing service-contract message:
Extended service protection may be available for vehicles outside the manufacturer's warranty. Customers should request a quote for details.

Do not display "financing from 1.49% APR" unless the dealership confirms that this offer is current and provides the required legal disclosure. Use safer copy such as:
"Explore competitive financing options. Approval, rates, and terms depend on lender requirements and applicant qualifications."

## Design direction

Create a refined automotive design with:

- White, charcoal, black, and deep navy as the core colors
- One restrained accent color, such as electric blue or red
- Strong contrast and clean spacing
- High-quality vehicle photography
- Large, crisp inventory photos
- Confident typography
- A premium but approachable local-business feel
- Subtle borders and restrained shadows
- Square or moderately rounded corners
- Consistent component spacing
- No visual clutter
- No unnecessary animation

The visual hierarchy should make it immediately clear that visitors can:
1. Browse inventory
2. Get financed
3. Value a trade
4. Ask Auto Select to locate a vehicle
5. Schedule an appointment
6. Arrange delivery

## Recommended technology

Use:
- Next.js with the App Router
- TypeScript
- Tailwind CSS
- Accessible reusable components
- Server components where appropriate
- Client components only when interaction requires them
- A structured local data layer for demo inventory that can later be replaced with an inventory-management API
- Next/Image for optimized photos
- Schema.org JSON-LD
- Clean environment-variable configuration
- ESLint and strict TypeScript

Do not require a paid UI library.

Use Lucide only for ordinary interface icons such as phone, map pin, filter, calendar, fuel, transmission, and mileage. Do not use decorative technology or AI icons.

## Required pages

Build these routes:

- /
- /inventory
- /inventory/[slug]
- /financing
- /trade-in
- /find-a-vehicle
- /delivery
- /service-contracts
- /services
- /about
- /reviews
- /faq
- /contact
- /blog
- /privacy-policy
- /terms-of-use

Create a useful 404 page with links to inventory and contact.

## Global header

Create a slim utility bar containing:
- Phone number
- Business hours
- Address
- Financing link

Create a sticky main navigation containing:
- Logo or tasteful text wordmark
- Inventory
- Financing
- Trade-In
- Find a Vehicle
- Services
- About
- Contact
- A prominent "Book an Appointment" button

On mobile:
- Use an accessible menu
- Keep Call, Inventory, and Financing actions easy to reach
- Add a restrained sticky bottom action bar with Call, Inventory, and Apply

The sticky navigation should shrink slightly after scrolling.

## Homepage structure

### Hero

Use a premium vehicle-focused hero with:
- Heading: "Car Buying Made Simple"
- Supporting message explaining that customers can browse vehicles, obtain financing, trade in their current vehicle, request delivery, or have Auto Select locate the right car
- Primary CTA: "Browse Inventory"
- Secondary CTA: "Get Pre-Qualified"
- Supporting CTA: "Find My Vehicle"
- Small trust note: "Serving Live Oak and the San Antonio area"

Do not use a rotating carousel in the hero.

### Quick inventory search

Place a prominent search panel below or partially overlapping the hero.

Include:
- New/used selection if applicable
- Make
- Model
- Body style
- Maximum price
- Search button
- Link to advanced filters

Populate available values from the inventory data.

### Featured inventory

Show six featured vehicle cards with:
- Photo
- Year, make, and model
- Trim
- Price or "Call for Price"
- Mileage
- Exterior color
- Transmission
- Fuel type
- Stock number
- Availability status
- Favorite button
- Compare checkbox
- "View Details" button
- "Check Availability" button

Never invent real inventory. If no inventory feed is available, use clearly marked demonstration vehicles and place all demo data in one replaceable file.

### Why choose Auto Select

Explain the dealership's real advantages:
- Personalized vehicle-locating service
- Competitive financing options
- Trade-in assistance
- Home or office delivery
- Service-contract options
- Local assistance before and after purchase

Avoid unsupported claims such as "best prices guaranteed."

### Simple buying process

Present four clear steps:
1. Search or describe the vehicle
2. Explore financing and trade-in options
3. Confirm vehicle details
4. Pick up the vehicle or request delivery

### Financing section

Include:
- Clear explanation of the financing process
- Pre-qualification CTA linked to the existing 700Dealer application
- Credit-sensitive, respectful language
- Disclosure that approval, rates, and terms depend on lender requirements
- No unsupported APR claims

### Trade-in section

Include a short valuation form:
- VIN or license plate
- Year
- Make
- Model
- Trim
- Mileage
- Condition
- Payoff amount, optional
- Photo uploads
- Name
- Phone
- Email
- Preferred contact method
- Consent checkbox

Explain that the online estimate is preliminary and subject to physical inspection.

### Vehicle locator

Create a strong section for customers who cannot find the right vehicle.

Collect:
- New or used preference
- Preferred year range
- Make
- Model
- Trim
- Body style
- Exterior and interior colors
- Maximum mileage
- Budget
- Desired monthly-payment range, clearly marked as an estimate
- Required features
- Purchase timeline
- Trade-in status
- Contact details
- Notes

### Delivery

Explain home or office delivery without inventing a delivery radius or fee. Add:
"Availability, eligibility, timing, distance, and fees must be confirmed by Auto Select."

### Service contracts and automotive services

Clearly separate:
- Vehicle service contracts
- Mechanical and roadside-related services

Show the known services:
- Mobile mechanic assistance
- Tires and wheel balancing
- Body repair and painting
- Towing
- Jump starts

Use "Request Service" rather than implying instant online scheduling if no calendar integration exists.

### Reviews

Display the two supplied customer comments with names. Do not add star ratings unless the rating source is verified.

### Contact and location

Include:
- Address
- Phone
- Email
- Hours
- Contact form
- Map embed with a privacy-conscious fallback link
- Appointment CTA
- Directions link

## Inventory page

Build a polished automotive inventory experience.

### Search and filters

Include:
- Keyword search
- Make
- Model
- Year range
- Price range
- Mileage range
- Body style
- Fuel type
- Transmission
- Drivetrain
- Exterior color
- Interior color
- Features
- Availability
- Sort by newest, price, year, and mileage

Desktop behavior:
- Sticky filter sidebar
- Results count
- Grid/list view switch
- Active filter chips
- Clear-all control

Mobile behavior:
- Filter drawer
- Sticky sort and filter bar
- Easy one-handed controls

Store filters in URL query parameters so filtered results can be shared and browser navigation works correctly.

### Inventory cards

Each vehicle card should support:
- Primary photo
- Image-count badge
- 360-view badge only if 360 media exists
- Year, make, model, and trim
- Price
- Estimated-payment link
- Mileage
- Drivetrain
- Fuel type
- Stock number
- Favorite
- Compare
- Share
- View-details CTA
- Check-availability CTA

Use skeleton loading states and a well-designed empty state.

## Vehicle detail page

Create a high-conversion vehicle detail page.

Include:
- Breadcrumbs
- Vehicle title
- Price
- Availability
- Stock number
- VIN, with an option to partially mask it
- Mileage
- Specifications
- Features and equipment
- Vehicle description
- History-report link only when a real report URL is supplied
- Photo gallery
- Full-screen gallery
- 360 exterior viewer
- Optional 360 interior viewer
- Financing calculator
- Trade-in CTA
- Delivery CTA
- Check-availability form
- Schedule-test-drive form
- Click-to-call button
- Similar vehicles
- Recently viewed vehicles
- Share and favorite controls
- Pricing disclaimer
- Sticky desktop lead card
- Sticky mobile action bar

Do not display fake urgency such as "17 people are viewing this car."

## 360 vehicle viewer

Implement a real 360-degree viewer architecture rather than faking it with one photo.

Requirements:
- Drag horizontally to rotate the vehicle
- Touch-swipe support
- Keyboard arrow controls
- Mouse-wheel or button-based zoom
- Full-screen mode
- Loading progress
- Reset-view control
- Auto-rotate option that stops immediately after user interaction
- Lazy loading
- Image preloading near the current frame
- Accessible labels and instructions
- Poster image fallback
- Standard photo gallery fallback when no 360 media is available
- Respect prefers-reduced-motion
- Do not autoplay on mobile

Use a frame-sequence model such as:
vehicle.media.exterior360.frames: string[]

Support 36, 48, or 72 frames. Also make the component adaptable to an embedded third-party 360 URL.

Do not generate missing angles from a single image and do not claim that ordinary photos form a true 360 view. Add an internal admin note explaining that each vehicle requires a properly captured 360 image sequence or compatible hosted tour.

Create:
- Vehicle360Viewer component
- frame-loading utility
- preload strategy
- error fallback
- sample demo frame configuration
- documentation describing how to add real frame files to a vehicle

## Scroll behavior and micro-interactions

Use subtle, purposeful interactions:

- Header condenses after scrolling
- Sections fade or rise into view once
- Inventory cards receive a small hover elevation
- Vehicle photos gently zoom on hover
- Filter counts update immediately
- Active filters animate in and out
- Forms show inline validation
- Successful submissions show clear confirmation
- A back-to-top control appears after meaningful scrolling
- Anchor links scroll smoothly
- Image galleries support swipe gestures
- Sticky CTAs appear only when useful
- Avoid parallax, scroll hijacking, cursor effects, excessive counters, and long entrance animations
- Respect prefers-reduced-motion everywhere

Animations should generally take 150-300 ms and should never delay access to content.

## Useful automations

Implement these automations in a provider-neutral way. Use interface adapters, server actions, webhook endpoints, and environment variables so the dealership can connect its preferred CRM, email, SMS, inventory feed, and calendar later.

### Lead handling

For financing, availability, test-drive, trade-in, vehicle-locator, delivery, service, and contact forms:

1. Validate and sanitize input.
2. Save the lead securely.
3. Categorize the lead by source and vehicle.
4. Send an internal notification.
5. Send a customer confirmation email.
6. Optionally send an SMS confirmation after explicit consent.
7. Attach UTM parameters and the referring page.
8. Prevent duplicate submissions.
9. Include spam protection and rate limiting.
10. Send failed integrations to a retry queue or log.

Never expose sensitive financial information in emails or analytics.

### Inventory automation

Prepare adapters for:
- CSV inventory import
- JSON or API inventory import
- Scheduled stock synchronization
- Automatic sold-vehicle unpublishing
- Price and mileage updates
- Image synchronization
- Sitemap updates
- Featured-vehicle rules
- Low-photo-count warnings
- Missing-price and missing-description warnings

Do not scrape third-party vehicle listings without authorization.

### Shopping tools

Implement:
- Recently viewed vehicles
- Saved favorites in local storage, with an upgrade path to user accounts
- Vehicle comparison for up to three vehicles
- Saved search structure
- Optional alerts when matching vehicles are added or prices change
- Shareable filtered-inventory URLs

### Appointment automation

Create a provider-neutral scheduling interface for:
- Test drives
- Dealership appointments
- Phone consultations
- Service requests

Include business-hour validation and prevent bookings on Sunday. Do not claim an appointment is confirmed until the scheduling provider returns confirmation.

### Abandoned-interest reminder

With explicit consent, support a workflow that reminds a shopper about a saved vehicle or unfinished inquiry. Include unsubscribe handling and frequency limits. Do not create manipulative popups.

## Forms and compliance

Every form must include:
- Clear labels
- Helpful errors
- Accessible focus states
- Required-field indicators
- Submission state
- Success state
- Privacy link
- Consent language where needed
- Server-side validation
- Spam protection
- No pre-checked marketing consent

Financing:
- Link to the existing secure third-party application
- Do not collect Social Security numbers directly in the new site unless a compliant secure provider is implemented
- Explain that submitting an inquiry does not guarantee approval

SMS:
- Require affirmative consent
- State that message and data rates may apply
- State that consent is not a condition of purchase
- Provide STOP/HELP language when SMS is activated

Cookies and analytics:
- Use privacy-conscious analytics
- Support consent controls when legally required
- Do not send financial-form data, VIN-associated personal data, phone numbers, or emails to analytics tools

## Content improvements

Rewrite all copy so it is:
- Grammatically correct
- Helpful
- Concise
- Specific
- Warm without being overly casual
- Focused on customer decisions
- Free of repetitive blocks
- Free of exaggerated claims
- Free of generic phrases such as "unlock your journey"

Add useful educational content:
- How financing works
- What to bring to a test drive
- How trade-in estimates work
- How vehicle delivery works
- What service contracts may cover
- How Auto Select's vehicle-locating service works
- Frequently asked questions
- San Antonio-area car-buying guidance

Do not present legal, financial, warranty, or mechanical guidance as guaranteed advice.

## SEO

Implement:
- Unique page titles and meta descriptions
- Canonical URLs
- Open Graph metadata
- Twitter card metadata
- XML sitemap
- robots.txt
- Breadcrumb schema
- Organization or AutoDealer schema using verified information
- Vehicle schema on inventory detail pages
- FAQ schema only for visible FAQ content
- LocalBusiness information with consistent name, address, and phone
- Descriptive image alt text
- Semantic headings
- Clean URLs

Do not add fake aggregate-rating schema.

Target relevant local intent naturally:
- Used cars in Live Oak, Texas
- Used vehicles near San Antonio
- Auto financing in Live Oak
- Trade-in assistance near San Antonio
- Vehicle delivery and car-locating assistance

Avoid keyword stuffing and doorway pages.

## Accessibility

Meet WCAG 2.2 AA as closely as practical.

Ensure:
- Keyboard-accessible navigation
- Visible focus states
- Skip-to-content link
- Correct heading hierarchy
- Accessible form errors
- Sufficient color contrast
- 44-by-44-pixel touch targets where practical
- Screen-reader labels
- No important information conveyed only by color
- Reduced-motion support
- Accessible gallery and 360-viewer controls
- Captions or transcripts for video content

## Performance

Target:
- Lighthouse performance score above 90 where practical
- Fast Largest Contentful Paint
- Minimal layout shift
- Responsive image sizes
- WebP or AVIF images
- Lazy loading below the fold
- Font optimization
- Minimal client-side JavaScript
- No autoplaying background video
- No unnecessarily heavy animation package
- Route-level loading and error states

## Data models

Create typed models for:

Vehicle:
- id
- slug
- status
- condition
- year
- make
- model
- trim
- bodyStyle
- price
- salePrice
- mileage
- vin
- stockNumber
- exteriorColor
- interiorColor
- transmission
- drivetrain
- fuelType
- engine
- mpgCity
- mpgHighway
- doors
- seats
- description
- features
- photos
- exterior360Frames
- interior360Url
- historyReportUrl
- featured
- dateAdded

Lead:
- id
- type
- vehicleId
- firstName
- lastName
- email
- phone
- preferredContactMethod
- message
- marketingConsent
- smsConsent
- sourcePage
- referrer
- utmData
- createdAt
- status

Create separate typed models for:
- TradeIn
- VehicleRequest
- Appointment
- ServiceRequest
- DeliveryRequest
- Review
- BusinessInformation

Keep verified business details in one configuration file so they are not duplicated throughout the codebase.

## Analytics events

Create a privacy-conscious event abstraction for:
- inventory_search
- filter_applied
- vehicle_view
- gallery_opened
- vehicle_360_started
- financing_clicked
- trade_in_started
- form_started
- form_submitted
- phone_clicked
- directions_clicked
- appointment_started

Do not include personal information in event payloads.

## Required deliverables

Produce:

1. A concise audit of the current site's weaknesses.
2. The improved site map.
3. Design-system tokens.
4. Component architecture.
5. Complete folder structure.
6. Production-quality code for every major page.
7. Reusable inventory components.
8. Fully functional filtering and sorting.
9. The 360 vehicle viewer.
10. Form validation and submission handlers.
11. Integration adapters and webhook placeholders.
12. Demo inventory clearly labeled as sample content.
13. SEO metadata and structured data.
14. Responsive behavior.
15. Accessibility implementation.
16. Setup instructions.
17. Environment-variable example.
18. Deployment instructions.
19. A content-verification checklist.
20. A dealership handoff guide explaining how to update inventory, images, 360 frames, hours, contact details, and financing links.

## Working method

Do not stop after producing a plan or homepage mockup.

First:
- Inspect the existing project files.
- Preserve useful assets and verified business information.
- Identify the current framework and dependencies.
- Create an implementation plan.

Then:
- Build the shared layout and design system.
- Build the homepage.
- Build inventory search and vehicle detail pages.
- Build the 360 viewer.
- Build the forms and supporting pages.
- Add SEO, accessibility, performance, and automation architecture.
- Run type checks, linting, and the production build.
- Fix every blocking error.
- Review mobile, tablet, and desktop layouts.
- Check for overflow, broken links, missing states, inaccessible controls, and placeholder text.

When information cannot be verified, use a clearly visible TODO label in the code or content configuration rather than inventing it.

The final result should feel trustworthy, fast, locally relevant, easy to shop, and easy for dealership staff to maintain.