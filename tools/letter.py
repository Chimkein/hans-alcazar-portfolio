# -*- coding: utf-8 -*-
"""Hans Stephen G. Alcazar - application letter.

Deliberately built on the same tokens as resume.py: same Helvetica, same ink,
same margins, same letterspaced-caps rule under the name. The two documents are
sent together, so they have to read as one set rather than as two files that
happened to arrive in the same email.

The letter this replaces was written in June and pitched him as IT support
only. Everything since - the three projects, the portfolio, the pivot - was
missing from it, and it opened by offering an internship he is not looking for.

Run it from anywhere:
    python tools/letter.py
    python tools/letter.py --company "Acme Corp" --role "Junior Frontend Developer"
"""
import argparse
import datetime
import os

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

# Not written into public/. The resume is linked from the site and is meant to
# be downloadable; a cover letter is something he sends, not something he
# publishes, and the repo is public now.
DEFAULT_OUT = os.path.join(
    os.path.expanduser("~"), "Downloads", "Hans-Alcazar-Application-Letter.pdf")

INK = HexColor("#141a1f")
MUTED = HexColor("#4a5259")
RULE = HexColor("#9aa2a9")

PAGE_W, PAGE_H = letter
# Wider than the resume's 0.52in on purpose. The resume is bullets and short
# runs, so it survives a long measure; this is continuous justified prose, and
# at 0.52in the line ran ~105 characters and the justification opened visible
# rivers between words. 0.85in brings it back under 95 and is what a letter
# is expected to look like anyway.
MARGIN = 0.85 * inch
CONTENT_W = PAGE_W - 2 * MARGIN

DOT = "&#183;"
EM = "&#8212;"
EN = "&#8211;"

name_s = ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=18, leading=20,
                        alignment=TA_CENTER, textColor=INK)
title_s = ParagraphStyle("title", fontName="Helvetica", fontSize=10, leading=13,
                         alignment=TA_CENTER, textColor=MUTED, spaceBefore=2)
meta_s = ParagraphStyle("meta", fontName="Helvetica", fontSize=8.3, leading=10.6,
                        alignment=TA_CENTER, textColor=MUTED)
date_s = ParagraphStyle("date", fontName="Helvetica", fontSize=9, leading=12,
                        textColor=MUTED)
# Slightly larger and looser than the resume body. A resume is scanned; a
# letter is read start to finish, and prose needs the leading.
body_s = ParagraphStyle("body", fontName="Helvetica", fontSize=9.6, leading=14.6,
                        textColor=INK, alignment=TA_JUSTIFY, spaceAfter=13)
greet_s = ParagraphStyle("greet", parent=body_s, spaceAfter=14)
sign_s = ParagraphStyle("sign", fontName="Helvetica-Bold", fontSize=9.8, leading=13,
                        textColor=INK)
cap_s = ParagraphStyle("cap", fontName="Helvetica", fontSize=9.2, leading=12.2,
                       textColor=INK)
signsub_s = ParagraphStyle("signsub", fontName="Helvetica", fontSize=8.6, leading=11.4,
                           textColor=MUTED)


def rule(space_before=5.5, space_after=3.4):
    t = Table([[""]], colWidths=[CONTENT_W], rowHeights=[0.4])
    t.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, -1), 0.6, RULE),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return [Spacer(1, space_before), t, Spacer(1, space_after)]


def build(out, company, role, when):
    story = []

    # ------------------------------------------------------------ letterhead
    story.append(Paragraph("HANS STEPHEN G. ALCAZAR", name_s))
    story.append(Paragraph(
        "Fullstack &amp; AI Engineer  %s  Computer Engineering Graduate" % DOT, title_s))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "0995 994 8436  %s  hans.s.alcazar@gmail.com  %s  Casili, Consolacion, Cebu"
        % (DOT, DOT), meta_s))
    story.append(Paragraph(
        "hans-alcazar.vercel.app  %s  github.com/Chimkein  %s  "
        "linkedin.com/in/hans-stephen-alcazar" % (DOT, DOT), meta_s))
    story.extend(rule(7, 18))

    story.append(Paragraph(when.strftime("%d %B %Y"), date_s))
    story.append(Spacer(1, 20))
    if company:
        story.append(Paragraph("<b>%s</b>" % company, body_s))

    story.append(Paragraph("Dear Hiring Manager,", greet_s))

    # ------------------------------------------------------------ the ask
    opening = (
        "I am writing to apply for %s with your team. I am a Computer Engineering "
        "graduate of Cebu Technological University %s Danao Campus, available to start "
        "immediately, for full-time or part-time work, remote, hybrid or on-site in Cebu."
        % (role, EM))
    story.append(Paragraph(opening, body_s))

    # ------------------------------------------------------------ capabilities
    # The whole point of the rewrite: he wanted what he can do and where to see
    # it, not a narrated tour of every project. The table is the resume's own
    # skills layout, so a reader who has both open recognises it immediately.
    story.append(Paragraph("What I can do:", body_s))

    caps = [
        ("Fullstack web",
         "TypeScript, JavaScript, React, Next.js (App Router), Tailwind CSS, Prisma, "
         "PostgreSQL, Supabase"),
        ("AI &amp; ML",
         "TensorFlow Lite, on-device inference, multi-model fallback orchestration, Ollama"),
        ("Embedded",
         "C, C++, ESP32 / Arduino, Bluetooth Low Energy, sensor integration, React Native / Expo"),
        ("Infrastructure",
         "Docker, Vercel, Git, NextAuth, Google OAuth, n8n"),
        ("Hardware &amp; support",
         "Hardware diagnosis, OS installation, LAN cabling, network and server setup; "
         "TESDA-certified in Computer Systems Servicing"),
    ]
    rows = [[Paragraph("<b>%s</b>" % k, cap_s), Paragraph(v, cap_s)] for k, v in caps]
    t = Table(rows, colWidths=[CONTENT_W * 0.26, CONTENT_W * 0.74])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 2.2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2),
    ]))
    story.append(Spacer(1, 2))
    story.append(t)
    story.append(Spacer(1, 13))

    # ------------------------------------------------------------ portfolio
    story.append(Paragraph(
        "My portfolio is at <b>hans-alcazar.vercel.app</b>, where my projects are "
        "documented in full %s an embedded machine-learning capstone, a multi-model AI "
        "web application and a self-hosted productivity platform, two of them live in "
        "production, alongside a community marketplace in active development. My "
        "r&#233;sum&#233; is attached." % EM, body_s))

    story.append(Paragraph(
        "I would welcome the opportunity to discuss how I could contribute to your team. "
        "Thank you for your time and consideration.", body_s))

    # ------------------------------------------------------------ signature
    story.append(Spacer(1, 14))
    story.append(Paragraph("Sincerely,", body_s))
    story.append(Spacer(1, 32))
    story.append(Paragraph("Hans Stephen G. Alcazar", sign_s))
    story.append(Paragraph(
        "0995 994 8436  %s  hans.s.alcazar@gmail.com" % DOT, signsub_s))

    doc = BaseDocTemplate(out, pagesize=letter,
                          leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=0.4 * inch, bottomMargin=0.34 * inch,
                          title="Hans Stephen G. Alcazar - Application Letter",
                          author="Hans Stephen G. Alcazar",
                          subject="Application for a junior developer role")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="body",
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="page", frames=[frame])])
    doc.build(story)
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Build the application letter PDF.")
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--company", default=None,
                    help="Addressee line. Omit for a general-purpose letter.")
    ap.add_argument("--role", default="a junior fullstack or frontend developer role",
                    help="Reads straight into 'apply for ___ with your team'.")
    ap.add_argument("--date", default=None, help="YYYY-MM-DD. Defaults to today.")
    a = ap.parse_args()

    when = (datetime.datetime.strptime(a.date, "%Y-%m-%d").date()
            if a.date else datetime.date.today())
    path = build(a.out, a.company, a.role, when)

    import pypdf
    print("pages:", len(pypdf.PdfReader(path).pages))
    print("written:", path)
