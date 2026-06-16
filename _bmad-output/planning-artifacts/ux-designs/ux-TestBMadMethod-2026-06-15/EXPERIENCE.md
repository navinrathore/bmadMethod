---
title: EXPERIENCE - Multi-Source Reconciliation Engine
status: final
created: 2026-06-15
updated: 2026-06-15
---

# EXPERIENCE: Multi-Source Reconciliation Engine

## Foundation
- **Form-Factor:** Local Web UI optimized for desktop/laptop screens (due to the dense nature of financial data tables). 
- **UI System:** [ASSUMPTION: Built on React with `shadcn/ui` components for rapid, accessible, and clean development].

## Information Architecture
The application uses a stable, persistent two-pane layout:
1. **Left/Center Pane (The Chat):** The conversational interface. It maintains the history of the session, acts as the file-drop zone, and displays narrative summaries from the engine.
2. **Right Pane (The Data Panel):** The dynamic workspace. When a query requires rendering structured data (like a reconciled ledger or list of orphan transactions), the data is injected here. It is independently scrollable and always reflects the most recent structured output of the chat.

## Voice and Tone
- **Tone:** Precise, helpful, and concise. 
- **Voice:** It speaks like a highly competent auditor. It does not use conversational filler (e.g., "Sure, I can help with that!"). It uses direct, declarative statements (e.g., "Found 3 orphan transactions in the statement. Please review them in the side panel.").

## Component Patterns
- **Upload / Ingestion:** Instead of a hidden file menu, the entire chat window serves as a drag-and-drop zone. Dropping a file creates an immediate "system message" confirming the local parsing status.
- **Data Tables:** Tables in the Side Panel must support sticky headers and horizontal scrolling. Numerical columns are right-aligned. Status columns use distinct badges (`{colors.success}` for Match, `{colors.error}` for Missing/Orphan).
- **Export Button:** A persistent, highly visible button at the top of the Side Panel allowing the user to "Export to CSV" whatever data is currently rendered.

## State Patterns
- **Processing State:** When the engine is parsing a PDF or waiting on the local LLM sanitization layer, a subtle inline typing indicator or progress bar appears in the chat. The Side Panel shows a skeleton loader if new data is about to overwrite the current view.
- **Empty State:** On first load, the Side Panel displays a blank slate graphic with instructions to "Upload your bank statement and chat logs to begin."

## Interaction Primitives
- **Hover & Focus:** Hovering over an "Orphan Transaction" in the Side Panel highlights the row.
- **Click to Detail:** Clicking a row in the Side Panel triggers a modal or an inline expansion showing the raw, unparsed string from the source file (so the user can manually verify why the parser failed to match it).

## Accessibility Floor
- **Keyboard Navigation:** The user must be able to hit `Tab` to navigate through the chat input, send button, and Side Panel rows.
- **Contrast:** Strict adherence to WCAG AA contrast, particularly for financial numbers (avoiding light gray text for negative values).

## Key Flows

**Flow 1: Ingestion & Reconciliation**
1. User drops `hdfc-statement.pdf` and `whatsapp-society.txt` into the chat window.
2. System immediately displays: "Files parsed locally. 120 transactions found. 45 chat messages found."
3. User types: "Match maintenance payments."
4. Chat displays a typing indicator for ~3 seconds.
5. System replies in chat: "Matched 18 payments. 2 payments missing. 3 transactions orphaned. See Side Panel."
6. The Side Panel slides into view (or refreshes), displaying the reconciled table.

**Flow 2: Resolving Orphan Transactions**
1. Following Flow 1, the user clicks the "Orphans" tab in the Side Panel.
2. The user sees a row with an unknown UPI ID. 
3. The user clicks the row. A modal pops up showing the raw text from the bank statement: `UPI/P2A/12345/UNKNOWN/...`
4. The user recognizes the payment, closes the modal, and types in the chat: "Transaction 12345 is for Flat 104."
5. System replies: "Updated. Transaction 12345 matched to Flat 104."
6. The Side Panel immediately updates, moving that row out of Orphans and into the Matched ledger.
