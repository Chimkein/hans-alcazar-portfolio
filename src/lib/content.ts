/**
 * Every fact on this page comes from here.
 * `pending: true` marks a value Hans still has to supply — it renders as a
 * visible PENDING state rather than a dead link, so nothing is ever invented.
 */

/**
 * Canonical origin, used for metadata, sitemap, robots and JSON-LD.
 *
 * The fallback is a guess and is almost certainly wrong — set
 * NEXT_PUBLIC_SITE_URL in the Vercel project settings to the real domain before
 * publishing, or search engines will canonicalise to the wrong host.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hans-alcazar.vercel.app"
).replace(/\/$/, "");

/**
 * Emitted by the assistant when the visitor wants the CV. The client swaps it
 * for a real download control, so the link can never be hallucinated.
 * Lives here because both the server prompt and the client parser need it.
 */
export const RESUME_TOKEN = "[[RESUME]]";

export const PROFILE = {
  name: "Hans Stephen G. Alcazar",
  initials: "HSA",
  role: "Fullstack & AI Engineer",
  roleNote: "in training",
  degree: "Bachelor of Science in Computer Engineering",
  /** Abbreviated for the sheet header, where the full name will not fit. */
  degreeShort: "BS Computer Engineering",
  school: "Cebu Technological University — Danao Campus",
  batch: "2026",
  location: "Casili, Consolacion, Cebu",
  email: "hans.s.alcazar@gmail.com",
  phone: "0995 994 8436",
  resume: "/Hans-Alcazar-Resume.pdf",
  /**
   * The pivot the whole page argues.
   *
   * It leads with where he came from rather than with what he built, because
   * the projects already have a whole section and the background does not: two
   * years of paid technical support and the TESDA certifications are the part
   * a reader would otherwise have to scroll to find. Every claim is one the
   * fabrication notes below repeat verbatim — the client count, the training,
   * the certificates — and the last line says self-taught and unfinished
   * because that is what it is.
   */
  statement:
    "Computer Engineering graduate who came up through the hardware side — two years of freelance technical support across 10+ individual and small-business clients, on-the-job training diagnosing machines week after week, TESDA-certified in computer systems servicing, networks and servers. That is where the instinct for the physical layer comes from, and why the range runs the whole way: from an ESP32 sensor array doing on-device inference, up to multi-model AI orchestration in Next.js. Fullstack and AI engineering are the deliberate next step — self-taught, and honestly still in progress.",
} as const;

/* ------------------------------------------------------------------
   BILL OF MATERIALS — the skills.
   Designators are cross-referenced by the project footprints below,
   which is what keeps them functional rather than decorative.
   ------------------------------------------------------------------ */

export type BomItem = {
  ref: string;
  part: string;
  klass: "LANGUAGE" | "FRAMEWORK" | "INFRASTRUCTURE";
  note: string;
};

export const BOM: BomItem[] = [
  { ref: "L1", part: "HTML", klass: "LANGUAGE", note: "Semantic structure, accessible markup" },
  { ref: "L2", part: "CSS", klass: "LANGUAGE", note: "Layout, theming, custom properties" },
  { ref: "L3", part: "JavaScript", klass: "LANGUAGE", note: "Browser and Node runtime" },
  { ref: "L4", part: "TypeScript", klass: "LANGUAGE", note: "Typed application code across every web project" },
  { ref: "L5", part: "C", klass: "LANGUAGE", note: "Embedded firmware, microcontroller I/O" },
  { ref: "L6", part: "C++", klass: "LANGUAGE", note: "ESP32 / Arduino sensor and BLE firmware" },
  { ref: "L7", part: "SQL", klass: "LANGUAGE", note: "Schema design, queries against Postgres" },
  { ref: "F1", part: "React", klass: "FRAMEWORK", note: "Component architecture, hooks, state" },
  { ref: "F2", part: "Next.js", klass: "FRAMEWORK", note: "App Router, server components, routing" },
  { ref: "F3", part: "Tailwind CSS", klass: "FRAMEWORK", note: "Design tokens and utility styling" },
  { ref: "N1", part: "Supabase", klass: "INFRASTRUCTURE", note: "Postgres, auth, object storage" },
  { ref: "N2", part: "Docker", klass: "INFRASTRUCTURE", note: "Containerised Postgres and local services" },
  { ref: "N3", part: "n8n", klass: "INFRASTRUCTURE", note: "Self-hosted automation workflows" },
];

/* ------------------------------------------------------------------
   COMPONENT FOOTPRINTS — the three projects. U1 is the portrait, so these run U2-U4.
   ------------------------------------------------------------------ */

export type ProjectLink = {
  label: string;
  href: string;
  pending?: boolean;
};

/** A captured screen. `label` is the silkscreen caption, `alt` the real description. */
export type Shot = {
  src: string;
  label: string;
  alt: string;
};

export type Project = {
  ref: string;
  name: string;
  kind: string;
  year: string;
  summary: string;
  /** The technical detail that makes the claim checkable. */
  detail: string[];
  /** Cross-references into the BOM above. */
  uses: string[];
  /** Captured screens. Omit entirely for projects with nothing to show. */
  shots?: Shot[];
  /**
   * How the slides are framed. "wide" is a 2:1 plate filled edge to edge, for
   * desktop captures. "device" is a taller plate the portrait screen sits
   * inside, letterboxed against the pad — a phone screenshot cropped to 2:1
   * would be unreadable.
   */
  shotFrame?: "wide" | "device";
  links: ProjectLink[];
  /** Capstone has no external link by design — it is hardware. */
  linkNote?: string;
};

export const PROJECTS: Project[] = [
  {
    ref: "U2",
    name: "Evergreen",
    /** The name alone says nothing about fruit, so the rail carries the subject. */
    kind: "Capstone Project · Avocado Freshness · Embedded ML",
    year: "2026",
    summary:
      "A sensor rig that reads the air around an avocado and tells you how ripe it is and roughly how many days of shelf life are left — without cutting it open. Ripening fruit gives off volatile compounds and carbon dioxide as it softens, so the composition of the air in a closed container is a usable proxy for what is happening under the skin. The rig samples that continuously and turns it into a plain answer: a ripeness stage, a day count, and whether to eat it now or leave it.",
    detail: [
      "An ESP32 WROOM reads a BME680 (temperature, humidity, gas resistance), an SHT31 (temperature, humidity) and an MH-Z14A CO₂ sensor from the air around the fruit.",
      "Readings stream over Bluetooth Low Energy to an Expo / React Native app, where two TensorFlow Lite models run on-device: a classifier for ripeness stage and a regressor for remaining shelf life.",
      "Both architectures were built and compared — inference on the ESP32 itself (56 KB tensor arena, no internet needed) against inference on the phone (larger model, better shelf-life accuracy). The phone-side design won on error margin.",
      "Retrained on a merged 1,293-row dataset and verified by matching the app's predictions against the Python CLI output value for value.",
      "The app carries the whole loop, not just a number: a live Standard Readings panel for gas, humidity, temperature and CO₂; a per-sensor Reading History that logs every sample with its absolute and percentage change so drift is visible; a Settings screen for choosing which sensors to track; and a Freshness Report that states the predicted shelf life next to the raw readings it was derived from, so the prediction can always be checked against its own inputs.",
    ],
    uses: ["L5", "L6", "L4", "F1"],
    shotFrame: "device",
    shots: [
      {
        src: "/shots/avo-home.webp",
        label: "Home",
        alt: "The app's home screen: an avocado trivia card, and a Standard Readings panel listing live gas, humidity, temperature and carbon dioxide values, with a Read Now button for the full freshness report.",
      },
      {
        src: "/shots/avo-history.webp",
        label: "History",
        alt: "The Statistics screen: a Reading History table for the gas sensor, logging each sample with its timestamp, value, absolute change and percentage change so drift is visible over time.",
      },
      {
        src: "/shots/avo-report.webp",
        label: "Report",
        alt: "The Freshness Report: a predicted shelf life in days above the sensor readings it was derived from — CO₂ in ppm, VOC gas resistance in kilohms, temperature, humidity and pressure — with a note on whether to consume or discard.",
      },
      {
        src: "/shots/avo-settings.webp",
        label: "Settings",
        alt: "The Settings screen: toggles for which sensors appear in statistics — gas, humidity, temperature, pressure and carbon dioxide — above terms, privacy policy and about entries.",
      },
    ],
    links: [],
    linkNote:
      "Hardware project — the rig, sensors and firmware are the deliverable. Walkthrough available on request.",
  },
  {
    ref: "U3",
    name: "AI Content Generator",
    kind: "Web Application · Multi-model AI",
    year: "2026",
    summary:
      "Turns a video, an image or a rough idea into ready-to-post captions and teaser visuals in a single pass. The gap it closes is the one between having content and having a post — the writing, the sizing and the visual each have to happen before anything ships, and each is its own small friction. This does all three from one input, and it does it with no paid API key anywhere in the stack.",
    detail: [
      "Caption generation runs through a four-model fallback chain — Gemini Flash, then Qwen, then Llama 3.3 70B, then GPT-OSS 120B — so a rate limit on one provider never blocks the user.",
      "Image generation spans seven models with style and aspect-ratio control; teaser videos are produced client-side with a Ken Burns pass.",
      "Google OAuth and object storage on Supabase, with folder-based history, pinning and a usage analytics view.",
      "Built deliberately on free-tier AI services only — the whole stack runs at no API cost.",
    ],
    uses: ["L4", "F1", "F2", "F3", "N1", "L7"],
    shots: [
      {
        src: "/shots/acg-landing.webp",
        label: "Landing",
        alt: "AI Content Generator landing page: a dark hero reading “Your content, refined for social”, a Get Started button, and three feature summaries for smart captions, teaser images and multi-language output.",
      },
      {
        src: "/shots/acg-create.webp",
        label: "Create",
        alt: "The Create Content screen: content-type tabs for video, image and text, a drag-and-drop upload area, an additional-instructions field, and a caption-model picker listing Gemini 2.5 Flash, Qwen 3.6 27B, Llama 3.3 70B and GPT-OSS 120B.",
      },
      {
        src: "/shots/acg-analytics.webp",
        label: "Analytics",
        alt: "The Analytics screen: totals for generations, average per day, best day and day streak, above a bar chart of generations per day.",
      },
    ],
    links: [
      { label: "Live demo", href: "https://ai-contentgen-app.vercel.app/" },
      { label: "Source", href: "https://github.com/Chimkein/ai-content-generator" },
    ],
  },
  {
    ref: "U4",
    name: "LifeFlow",
    kind: "Web Application · Productivity",
    year: "2026",
    summary:
      "A private productivity hub that pulls calendar, notes, tasks and reminders into one place, built for me and a small circle of friends rather than for a market. Everything that would normally carry a subscription runs self-hosted or on a free tier instead — Postgres in a container, a Telegram bot for push, a local model for the AI — which is what holds the running cost at exactly zero. An assistant sits across all of it and can create, update and complete items, and asks first before it deletes anything.",
    detail: [
      "Next.js and Prisma over a PostgreSQL instance running in Docker, with NextAuth handling sessions.",
      "Integrates the Google Calendar and Gmail APIs, and pushes reminders through a Telegram bot.",
      "AI features run against a local Ollama model rather than a paid API, which is what holds the operating cost at zero.",
    ],
    uses: ["L4", "F1", "F2", "F3", "L7", "N2"],
    shots: [
      {
        src: "/shots/lf-signin.webp",
        label: "Sign-in",
        alt: "LifeFlow sign-in screen: the wordmark above a Continue with Google button, with calendar, tasks, notes and AI assistant shown beneath.",
      },
      {
        src: "/shots/lf-dashboard.webp",
        label: "Dashboard",
        alt: "LifeFlow dashboard: a time-of-day greeting, counters for events today, open tasks, notes and items due this week, a Today's Schedule panel, and an Ask LifeFlow assistant column with suggested prompts.",
      },
      {
        src: "/shots/lf-calendar.webp",
        label: "Calendar",
        alt: "LifeFlow calendar: an August 2026 month grid with a scheduled event, a New Event button, and Month, Week, Day and Agenda view switches.",
      },
      {
        src: "/shots/lf-assistant.webp",
        label: "Assistant",
        alt: "LifeFlow AI assistant: a chat screen with suggested prompts for focusing the day, adding a task, checking the calendar and creating a note.",
      },
    ],
    links: [
      { label: "Live demo", href: "https://lifeflow-hsa.vercel.app/" },
      { label: "Source", href: "https://github.com/Chimkein/lifeflow" },
    ],
  },
];

/* ------------------------------------------------------------------
   FABRICATION NOTES — the about section.
   ------------------------------------------------------------------ */

export const NOTES: { n: number; text: string }[] = [
  {
    n: 1,
    text: "Computer Engineering graduate, Cebu Technological University — Danao Campus, 2022–2026. Before that, STEM strand at University of Cebu — Banilad.",
  },
  {
    n: 2,
    text: "Currently teaching myself fullstack and AI engineering. The three projects on this sheet are the record of that — each one taught me a layer I did not have before, and I would rather be judged on them than on a list of adjectives.",
  },
  {
    n: 3,
    text: "Freelance computer technical support since 2024, for 10+ individual and small-business clients. Remote and on-site: connectivity faults, hardware diagnosis, OS reinstalls and upgrades. Repeat clients came from fast turnaround and explaining the problem in plain language.",
  },
  {
    n: 4,
    text: "On-the-job training at Green's Compugadgets Computer Center Corp. — diagnosing hardware and software faults on client machines weekly, OS installation and configuration, and printer repair across walk-in and repeat clients.",
  },
  {
    n: 5,
    text: "Certified through TESDA in Computer Systems Servicing, Setting Up Computer Networks, and Setting Up Computer Servers. Cisco Networking Academy — Get Connected.",
  },
  {
    n: 6,
    text: "The hardware background is not incidental. ESP32 and Arduino configuration, soldering, LAN cabling and network setup are why the capstone reached working silicon instead of stopping at a simulation.",
  },
];

/* ------------------------------------------------------------------
   CONNECTORS — the contact section.
   ------------------------------------------------------------------ */

export type Connector = {
  ref: string;
  label: string;
  handle: string;
  href: string;
  pending?: boolean;
};

export const CONNECTORS: Connector[] = [
  {
    ref: "J1",
    label: "GitHub",
    handle: "@Chimkein",
    href: "https://github.com/Chimkein",
  },
  {
    ref: "J2",
    label: "LinkedIn",
    handle: "hans-stephen-alcazar",
    href: "https://www.linkedin.com/in/hans-stephen-alcazar-8545a53a6/",
  },
  {
    ref: "J3",
    label: "Facebook",
    handle: "hans.s.alcazar",
    href: "https://www.facebook.com/hans.s.alcazar",
  },
  {
    ref: "J4",
    label: "Instagram",
    handle: "@_h.alcazar",
    href: "https://www.instagram.com/_h.alcazar/",
  },
  {
    ref: "J5",
    label: "Discord",
    handle: "chimkeiin",
    href: "https://discord.com/users/762923181098270720",
  },
];

/* ------------------------------------------------------------------
   SHEET INDEX — the nav / net list.
   ------------------------------------------------------------------ */

export const SHEET = [
  { id: "overview", ref: "U1", label: "Overview" },
  { id: "skills", ref: "BOM", label: "Skills" },
  { id: "about", ref: "NOTES", label: "About" },
  { id: "projects", ref: "U2–U4", label: "Projects" },
  { id: "contact", ref: "J1–J5", label: "Contact" },
] as const;
