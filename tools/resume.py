# -*- coding: utf-8 -*-
"""Hans Stephen G. Alcazar - resume.

Single column, standard section headings, built-in Helvetica: an ATS parses this
cleanly. The design work is in the typography and the rhythm, not in anything a
parser has to guess at.
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    KeepTogether,
)

import os

# Writes straight into public/, which is what PROFILE.resume points at.
# Run it from anywhere: python tools/resume.py
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "Hans-Alcazar-Resume.pdf")

INK = HexColor("#141a1f")
MUTED = HexColor("#4a5259")
RULE = HexColor("#9aa2a9")

PAGE_W, PAGE_H = letter
MARGIN = 0.52 * inch
CONTENT_W = PAGE_W - 2 * MARGIN

name_s = ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=18, leading=20,
                        alignment=TA_CENTER, textColor=INK)
title_s = ParagraphStyle("title", fontName="Helvetica", fontSize=10, leading=13,
                         alignment=TA_CENTER, textColor=MUTED, spaceBefore=2)
meta_s = ParagraphStyle("meta", fontName="Helvetica", fontSize=8.3, leading=10.6,
                        alignment=TA_CENTER, textColor=MUTED)
sec_s = ParagraphStyle("sec", fontName="Helvetica-Bold", fontSize=9, leading=11,
                       textColor=INK)
body_s = ParagraphStyle("body", fontName="Helvetica", fontSize=8.7, leading=10.7,
                        textColor=INK, alignment=TA_JUSTIFY)
bullet_s = ParagraphStyle("bullet", parent=body_s, leftIndent=10, bulletIndent=1,
                          spaceBefore=1.0)
role_s = ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=9.1, leading=11.4,
                        textColor=INK)
date_s = ParagraphStyle("date", fontName="Helvetica", fontSize=8.4, leading=11.4,
                        textColor=MUTED, alignment=2)
sub_s = ParagraphStyle("sub", fontName="Helvetica-Oblique", fontSize=8.5, leading=10.6,
                       textColor=MUTED)

story = []


def rule(space_before=5.5, space_after=3.4):
    t = Table([[""]], colWidths=[CONTENT_W], rowHeights=[0.4])
    t.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, -1), 0.6, RULE),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return [Spacer(1, space_before), t, Spacer(1, space_after)]


def section(label):
    # Letterspaced caps read as a section marker without shouting.
    spaced = " ".join(label.upper())
    story.append(Spacer(1, 4.5))
    story.append(Paragraph(spaced, sec_s))
    story.extend(rule(2.6, 4))


def headed_row(left, right):
    t = Table([[Paragraph(left, role_s), Paragraph(right, date_s)]],
              colWidths=[CONTENT_W * 0.735, CONTENT_W * 0.265])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


def bullets(items):
    return [Paragraph(x, bullet_s, bulletText=u"\u2022") for x in items]


def entry(left, right, subtitle, items, gap=6):
    block = [headed_row(left, right)]
    if subtitle:
        block.append(Paragraph(subtitle, sub_s))
    block.append(Spacer(1, 1.4))
    block.extend(bullets(items))
    story.append(Spacer(1, gap))
    story.append(KeepTogether(block))


DOT = "&#183;"
EM = "&#8212;"
EN = "&#8211;"

# ---------------------------------------------------------------- header
story.append(Paragraph("HANS STEPHEN G. ALCAZAR", name_s))
story.append(Paragraph(
    "Fullstack &amp; AI Engineer  %s  Computer Engineering Graduate" % DOT, title_s))
story.append(Spacer(1, 4))
story.append(Paragraph(
    "0995 994 8436  %s  hans.s.alcazar@gmail.com  %s  Casili, Consolacion, Cebu" % (DOT, DOT),
    meta_s))
story.append(Paragraph(
    "hans-alcazar.vercel.app  %s  github.com/Chimkein  %s  "
    "linkedin.com/in/hans-stephen-alcazar" % (DOT, DOT), meta_s))

# ---------------------------------------------------------------- summary
section("Summary")
story.append(Paragraph(
    "Computer Engineering graduate building across the full stack %s from ESP32 firmware "
    "running on-device TensorFlow Lite inference up to multi-model AI orchestration in Next.js. "
    "Three shipped projects spanning embedded machine learning, a multi-model AI web application "
    "and a self-hosted productivity platform, two of them live in production. Two years of "
    "hands-on IT support for 10+ clients underneath that, so the hardware and networking layer "
    "is not theoretical." % EM, body_s))

# ---------------------------------------------------------------- skills
section("Technical Skills")
skills = [
    ("Languages", "TypeScript, JavaScript, C, C++, SQL, HTML, CSS"),
    ("Frameworks", "React, Next.js (App Router), React Native / Expo, Tailwind CSS, Prisma"),
    ("AI &amp; ML", "TensorFlow Lite, on-device inference, multi-model fallback orchestration "
                    "(Gemini, Qwen, Llama, GPT-OSS), Ollama"),
    ("Data &amp; Infrastructure",
     "PostgreSQL, Supabase, Docker, n8n, NextAuth, Google OAuth, Vercel, Git"),
    ("Hardware &amp; Networking",
     "ESP32 / Arduino, Bluetooth Low Energy, sensor integration (BME680, SHT31, MH-Z14A), "
     "soldering, LAN cabling, network and server setup"),
]
rows = [[Paragraph("<b>%s</b>" % k, body_s), Paragraph(v, body_s)] for k, v in skills]
st = Table(rows, colWidths=[CONTENT_W * 0.23, CONTENT_W * 0.77])
st.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ("TOPPADDING", (0, 0), (-1, -1), 1.1),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 1.1),
]))
story.append(st)

# ---------------------------------------------------------------- projects
section("Projects")
entry(
    "Avocado Ripeness Monitor",
    "2026",
    "Capstone Project  %s  Embedded Machine Learning" % DOT,
    [
        "Built an ESP32 WROOM rig reading BME680, SHT31 and MH-Z14A CO<sub>2</sub> sensors, "
        "streaming readings over Bluetooth Low Energy to an Expo / React Native application.",
        "Ran two TensorFlow Lite models on-device %s a ripeness-stage classifier and a "
        "shelf-life regressor %s and benchmarked ESP32-side inference (56 KB tensor arena, fully "
        "offline) against phone-side inference; the phone-side design won on error margin." % (EM, EM),
        "Retrained on a merged 1,293-row dataset and validated the app predictions against the "
        "Python CLI output value for value.",
    ],
    gap=2,
)
entry(
    "AI Content Generator",
    "2026",
    "Web Application  %s  Multi-model AI  %s  ai-contentgen-app.vercel.app" % (DOT, DOT),
    [
        "Turns a video, an image or a written idea into ready-to-post captions and teaser visuals "
        "in a single pass.",
        "Chained four language models as caption fallbacks so a rate limit on one provider never "
        "blocks the user, plus seven image models with style and aspect-ratio control.",
        "Google OAuth and Supabase object storage with folder history, pinning and usage "
        "analytics %s built entirely on free-tier services, at zero API cost." % EM,
    ],
)
entry(
    "LifeFlow",
    "2026",
    "Web Application  %s  Productivity Platform  %s  lifeflow-hsa.vercel.app" % (DOT, DOT),
    [
        "Next.js and Prisma over a PostgreSQL instance running in Docker, with NextAuth handling "
        "sessions.",
        "Integrated the Google Calendar and Gmail APIs and pushed reminders through a Telegram bot.",
        "Built an AI assistant on a local Ollama model that creates, updates and completes items, "
        "and confirms before it deletes anything.",
    ],
)

# ---------------------------------------------------------------- experience
section("Experience")
entry(
    "Freelance Computer Technical Support",
    "2024 %s Present" % EN,
    None,
    [
        "Provided remote and on-site support for 10+ individual and small-business clients, "
        "resolving connectivity and hardware faults.",
        "Performed OS reinstalls, hardware upgrades and part diagnostics across desktop and "
        "laptop systems.",
        "Built a repeat client base on fast turnaround and plain-language explanation of "
        "technical issues.",
    ],
    gap=2,
)
entry(
    "Green's Compugadgets Computer Center Corp.",
    "2026",
    "On-the-Job Training",
    [
        "Diagnosed and resolved hardware and software faults on client printers, desktops and "
        "laptops on a weekly basis.",
        "Handled OS installation and software configuration to reduce repeat service visits.",
    ],
)

# ---------------------------------------------------------------- education
section("Education")
story.append(headed_row(
    "Cebu Technological University %s Danao Campus" % EM, "2022 %s 2026" % EN))
story.append(Paragraph(
    "Bachelor of Science in Computer Engineering %s Sabang, Danao, Cebu" % DOT, sub_s))
story.append(Spacer(1, 4))
story.append(headed_row(
    "University of Cebu %s Banilad Campus" % EM, "2020 %s 2022" % EN))
story.append(Paragraph(
    "Science, Technology, Engineering and Mathematics (STEM) Strand %s Banilad, Cebu City" % DOT,
    sub_s))

# ---------------------------------------------------------------- certifications
section("Certifications")
story.append(Paragraph(
    "<b>TESDA</b> %s Computer Systems Servicing %s Setting Up Computer Networks %s "
    "Setting Up Computer Servers" % (EM, DOT, DOT), body_s))
story.append(Spacer(1, 1.6))
story.append(Paragraph("<b>Cisco Networking Academy</b> %s Get Connected" % EM, body_s))

# ---------------------------------------------------------------- build
doc = BaseDocTemplate(OUT, pagesize=letter,
                      leftMargin=MARGIN, rightMargin=MARGIN,
                      topMargin=0.4 * inch, bottomMargin=0.34 * inch,
                      title="Hans Stephen G. Alcazar - Resume",
                      author="Hans Stephen G. Alcazar",
                      subject="Fullstack and AI Engineer")
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="body",
              leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates([PageTemplate(id="page", frames=[frame])])
doc.build(story)

import pypdf
print("pages:", len(pypdf.PdfReader(OUT).pages))
print("written:", OUT)
