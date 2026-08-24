import type { Metadata } from "next";
import { Archivo, Archivo_Narrow, Spline_Sans_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PROFILE, SITE_URL, BOM, CONNECTORS } from "@/lib/content";
import "./globals.css";

/**
 * Same family, three widths — Archivo is a grotesque built for legibility at
 * text sizes, with a tall x-height and open apertures that hold up over the
 * plot grid where Saira was thinning out. Narrow keeps the condensed silkscreen
 * voice for legends and display.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo-narrow",
  display: "swap",
});

const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-mono",
  display: "swap",
});

const TITLE = `${PROFILE.name} — ${PROFILE.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s — ${PROFILE.name}`,
  },
  description: PROFILE.statement,
  applicationName: `${PROFILE.name} — Portfolio`,
  authors: [{ name: PROFILE.name, url: SITE_URL }],
  creator: PROFILE.name,
  keywords: [
    PROFILE.name,
    "Hans Alcazar",
    "fullstack developer Cebu",
    "AI engineer Philippines",
    "Computer Engineering graduate",
    "junior developer portfolio",
    "Cebu Technological University",
    ...BOM.map((b) => b.part),
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    locale: "en_PH",
    url: SITE_URL,
    siteName: TITLE,
    title: TITLE,
    description: PROFILE.statement,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${PROFILE.name} — ${PROFILE.role}, ${PROFILE.degree} ${PROFILE.batch}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: PROFILE.statement,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

/** Person schema, built from the same data the page renders. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PROFILE.name,
  url: SITE_URL,
  image: `${SITE_URL}/og.png`,
  jobTitle: PROFILE.role,
  description: PROFILE.statement,
  email: `mailto:${PROFILE.email}`,
  telephone: PROFILE.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Consolacion",
    addressRegion: "Cebu",
    addressCountry: "PH",
  },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: PROFILE.school },
    { "@type": "EducationalOrganization", name: "University of Cebu — Banilad Campus" },
  ],
  knowsAbout: BOM.map((b) => b.part),
  sameAs: CONNECTORS.filter((c) => !c.pending).map((c) => c.href),
};

const CONTRACT = `<!--
THESIS: This sheet is a PCB fabrication drawing. It refuses the dark hero plus
project-card grid this category ships.
OWN-WORLD: Light is the drawing plotted on white paper — graphite legend,
hairline gold traces. Dark is the manufactured board — solder mask ground, ENIG
gold, silkscreen white. Archivo Narrow legend caps, Spline Sans Mono for data,
pads, vias, a title block. No cards.
STORY: A recruiter sees a Computer Engineering graduate whose three projects run
firmware to cloud, believes it because every claim carries a checkable technical
detail, then views work, takes the resume, or connects.
FIRST VIEWPORT: Full-bleed gold grid. Name in silkscreen caps top left, FULLSTACK
& AI ENGINEER at display scale, portrait as component U1 in a gold pad frame
right with pin-1 dot. VIEW WORK primary, RESUME secondary.
FORM: The Board Fab Drawing, candidate 1 of my grounded list, seed a31e1295.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance
-->`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${archivo.variable} ${archivoNarrow.variable} ${splineMono.variable} antialiased`}
      >
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
