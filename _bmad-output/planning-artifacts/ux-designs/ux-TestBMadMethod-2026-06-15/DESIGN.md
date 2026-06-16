---
title: DESIGN - Multi-Source Reconciliation Engine
status: final
created: 2026-06-15
updated: 2026-06-15
colors:
  primary: "#0f172a"
  secondary: "#334155"
  accent: "#2563eb"
  background: "#ffffff"
  surface: "#f8fafc"
  border: "#e2e8f0"
  error: "#ef4444"
  success: "#22c55e"
typography:
  fontFamily: "Inter, sans-serif"
  baseSize: "16px"
  lineHeight: "1.5"
rounded:
  base: "0.5rem"
  large: "1rem"
spacing:
  base: "1rem"
  small: "0.5rem"
  large: "2rem"
components:
  button: "Rounded base, 1rem padding horizontal, primary color bg"
  panel: "Rounded large, surface bg, subtle border"
  chatBubble: "Rounded large, slightly softer background for AI, distinct for user"
---

# DESIGN: Multi-Source Reconciliation Engine

## Brand & Style
The engine is a utilitarian, trust-inspiring local utility. It should feel robust, clean, and highly functional. It avoids overly playful aesthetics in favor of a "pro-tool" vibe. [ASSUMPTION: We will leverage `shadcn/ui` with Tailwind CSS as the underlying visual system].

## Colors
- **Primary / Secondary:** Slate and dark grays to keep the application feeling grounded and serious.
- **Accent:** A clear, crisp blue (`#2563eb`) to indicate actions, highlights, and active states in the chat or data panel.
- **Feedback:** Standard semantic colors (Red for missing/orphan transactions, Green for successful reconciliation).

## Typography
- **Primary Font:** Inter (or system-ui). Extremely legible, especially for tabular data and numbers.
- **Hierarchy:** Clear distinction between chat text (base size, highly readable) and data tables (slightly condensed or smaller text, monospaced for numbers to align columns).

## Layout & Spacing
- **Macro Layout:** A persistent split-screen. The conversational interface takes up the left/center, while the dynamic data panel takes up the right side (or collapses on smaller screens).
- **Density:** The chat interface is spacious (comfortable spacing), while the data panel uses a "dense" table layout to maximize the amount of financial data visible without scrolling.

## Elevation & Depth
- **Flat UI:** We will use borders rather than heavy drop shadows to distinguish the chat area from the side panel. 
- **Modals:** Only used for critical alerts or deep dives into an orphan transaction's raw source data. Modals have a soft shadow and dim the background.

## Shapes
- **Corners:** `0.5rem` (rounded-lg in Tailwind) for most components to feel modern but structured.

## Components
- **Dropzone:** A dashed border area in the chat window indicating where users can drag and drop Bank PDFs or Chat exports.
- **Chat Bubbles:** The user's prompts are right-aligned with the accent color; the engine's responses are left-aligned with a subtle gray surface color.
- **Data Tables:** Striped rows, sticky headers, monospaced numeric columns, and clear colored badges (e.g., `[Match]`, `[Orphan]`).

## Do's and Don'ts
- **Do:** Use semantic colors strictly for financial context (red for negative/unpaid, green for positive/paid).
- **Don't:** Clutter the chat window with data. All structured tabular data must be sent to the Side Panel.
