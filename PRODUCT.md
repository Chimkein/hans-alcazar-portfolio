# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS. Chosen by the user in the init round over Vite and static HTML, explicitly so the site is itself evidence of the React/Next.js/TypeScript/Tailwind skills it claims. Deploy target: Vercel (free tier) — assumed, not yet confirmed.

## Users

Primary: technical recruiters, hiring managers, and internship/junior-role screeners in the Philippines (Cebu region and remote) who land on the site from a resume link, a LinkedIn profile, or a job application. They arrive with a specific question — "can this person actually build software?" — and typically give the page well under a minute before deciding to read on or leave.

Secondary: prospective freelance clients who already know Hans does IT support and are evaluating whether he can also take on software work.

Tertiary: peers and fellow students who reach the site from GitHub.

## Product Purpose

A single-page personal portfolio for Hans Stephen G. Alcazar that converts a Computer Engineering graduate with a freelance IT-support track record into a credible candidate for fullstack and AI engineering work. It exists because his resume reads as an IT technician while his actual recent output is three non-trivial software projects; the resume alone loses him the interview. Success means a visitor understands the pivot, believes the three projects are real, and takes one of three actions: opens a project, downloads the resume, or makes contact.

## Positioning

The pivot itself is the position, and it is defensible because it spans layers most junior candidates never touch: an embedded ML capstone (ESP32 sensor array to BLE to on-device TFLite inference) sits beside two full production-shaped web apps (Next.js + TypeScript + Postgres/Supabase + OAuth + multi-provider AI orchestration). Hardware-to-cloud range from one person, backed by a real CpE degree and a paying client base — not a bootcamp portfolio of tutorial clones.

## Operating Context

Reached primarily on mobile (resume QR/link, LinkedIn on phone) and desktop (recruiter at a workstation). Single scroll, five sections, no login, no backend. Visitors frequently arrive with the resume PDF already open in another tab, so the site must add to the resume rather than restate it. Read in the Philippines on variable mobile connections — payload discipline matters. Often skimmed, rarely read start to finish.

## Capabilities and Constraints

- Five sections in one scroll: overview/profile hero, skills, about, projects, contact.
- Light and dark mode, both user-visible and toggleable; dark is not an afterthought.
- Skills to display, exactly as specified by the user: HTML, CSS, JavaScript, C, C++, Next.js, Tailwind CSS, React, TypeScript, SQL, Supabase, Docker, n8n.
- Three projects, with per-project link treatment confirmed by the user:
  - **Capstone Project** (avocado ripeness/shelf-life monitor) — detail/case-study treatment only. No external links; it is hardware and has nothing to click.
  - **AI Content Generator** — live demo link.
  - **LifeFlow** — live demo link.
- Contact section links to Facebook, Instagram, GitHub, and LinkedIn.
- Three calls to action, in priority order confirmed by the user: view projects (primary), download resume (secondary), contact (closing section).
- Static site. No database, no auth, no server-side state.
- Accessibility and payload budget are constraints, not stretch goals — see below.

## Brand Commitments

- Name: Hans Stephen G. Alcazar.
- Binding visual constraint volunteered by the user: gold as the accent in both themes — light mode is white with gold outline, dark mode is gold outline. Refined and minimal rather than luxe/heavy: hairline outlines, generous whitespace, gold reserved for borders, accents, and hover states.
- Positioning line confirmed by the user: aspiring **Fullstack & AI Engineer**. Dev work leads; the CpE degree and IT-support history are supporting credibility, not the headline.
- Voice: plain and specific. He is early-career and the site should not pretend otherwise — the credibility comes from concrete technical detail, never from inflated titles or invented seniority.

## Evidence on Hand

Real and usable:

- Resume PDF: `C:/Users/Hans/Downloads/Hans_Alcazar_Resume.pdf` (most recent, dated Jul 6). Older variants exist in the same folder.
- Contact facts from the resume: hans.s.alcazar@gmail.com, 0995 994 8436, Casili, Consolacion, Cebu.
- Education: BS Computer Engineering, Cebu Technological University - Danao Campus (2022-2026); STEM, University of Cebu - Banilad (2020-2022).
- Experience: Freelance Computer Technical Support, 2024-Present, 10+ individual and small-business clients. OJT at Green's Compugadgets Computer Center Corp. (2026).
- Certificates: Cisco Networking Academy "Get Connected"; TESDA — Computer Systems Servicing (CSS), Setting Up Computer Networks, Setting Up Computer Servers.
- GitHub account: `github.com/Chimkein`. Repos confirmed to exist: `lifeflow`, `ai-content-generator`.
- Project technical truth, read from source in `C:/Users/Hans/Documents/GitHub/`:
  - **Avocado (capstone)** — Expo/React Native + NativeWind. ESP32 WROOM reading BME680 (temp/humidity/gas), SHT31 (temp/humidity), and MH-Z14A (CO2), streaming over BLE to the phone, where TFLite models predict ripeness class and shelf life. Both on-device-ESP32 and phone-side inference architectures were built and compared.
  - **AI Content Generator** — Next.js, TypeScript, Tailwind, shadcn, Supabase (auth + storage). Caption generation across a four-model fallback chain (Gemini Flash, Qwen, Llama 3.3 70B, GPT-OSS 120B), image generation across seven models, client-side Ken Burns teaser video, Google OAuth, folder history and analytics. Deliberately built entirely on free-tier AI services.
  - **LifeFlow** — Next.js, TypeScript, Prisma, PostgreSQL in Docker, NextAuth, Google Calendar + Gmail APIs, a Telegram reminder bot, and local Ollama inference. Designed to run at zero operating cost.

Absences that must not be fabricated:

- **No screenshots or product imagery exist for any of the three projects.** Nothing on disk, nothing in `public/`. The design must not assume image-led project cards, and no placeholder mockups may be presented as real screens.
- **No live demo URLs exist yet.** The user asked for live-demo links on AI Content Generator and LifeFlow, but neither is deployed. Links must be built as clearly-marked placeholders for the user to fill, never invented.
- ~~No social profile URLs are known except GitHub.~~ **Resolved** — Hans supplied all three: Facebook `facebook.com/hans.s.alcazar`, Instagram `instagram.com/_h.alcazar`, LinkedIn `linkedin.com/in/hans-stephen-alcazar-8545a53a6`. With GitHub (`Chimkein`), all four connectors are live.
- No testimonials, no employer references, no user counts, no performance benchmarks, no awards. The only quantified claim available is "10+ clients," and it comes from the resume.

## Product Principles

1. **Add to the resume, never restate it.** The visitor likely has the PDF open. The site earns its existence by carrying technical depth and proof the one-pager cannot.
2. **Concrete detail is the credibility mechanism.** "BME680 over BLE into on-device TFLite" persuades where "passionate developer" does not. Every claim traces to something in Evidence on Hand.
3. **Honest about stage.** Aspiring, learning, early-career — stated plainly. Overclaiming is the fastest way to lose a technical reader who will check the GitHub.
4. **Under a minute to the point.** The pivot, the three projects, and the way to make contact must all land in a fast skim on a phone.
5. **The site is a work sample.** Its own code quality, accessibility, and performance are part of the argument being made.

## Accessibility & Inclusion

WCAG 2.1 AA as the floor, in both themes. Gold-on-white is the specific hazard this brief creates: gold at typical luminance fails contrast against white for body text and small labels, so gold is confined to borders, large display type, and decorative accents, with a darkened gold reserved for any gold-colored text on light backgrounds. Full keyboard operability with visible focus rings, honored `prefers-reduced-motion`, and a theme toggle that respects the system setting on first load.
