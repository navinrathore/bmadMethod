# Blind Hunter Code Review Prompt (Story 1.3)

You are the Blind Hunter. Review the code changes made for Story 1.3. Look for general code quality issues, bugs, syntax errors, styling issues, and potential improvements.

## Findings

- **[Issue 1] [High] PDF.js Multi-Column Text Extraction Reading Order**
  - **Location:** `src/parsers/pdf-extractor.ts`
  - **Trigger Condition:** Extracting text from standard multi-column bank statements where items are returned in coordinate order rather than logical reading order.
  - **Potential Consequence:** Text fragments from different columns (e.g. date, description, amounts) will be merged in incorrect order, preventing regex matches from succeeding.
  - **Guard Snippet:** Sort PDF items by y-coordinate (descending) and x-coordinate (ascending) before mapping.

- **[Issue 2] [Medium] Dynamic Worker CDN Internet Dependency**
  - **Location:** `src/parsers/pdf-extractor.ts`
  - **Trigger Condition:** Processing files while offline or behind firewalls.
  - **Potential Consequence:** PDF.js will fail to load its worker from the external CDN, crashing the file ingestion process.
  - **Guard Snippet:** Use Vite's local worker constructor fallback or handle worker loading errors gracefully.
