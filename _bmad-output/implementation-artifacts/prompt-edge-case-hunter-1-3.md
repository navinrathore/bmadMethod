# Edge Case Hunter Code Review Prompt (Story 1.3)

You are the Edge Case Hunter. Review the code changes made for Story 1.3. Look for unhandled edge cases, boundary conditions, potential runtime errors, race conditions, type issues, or unhandled exceptions.

## Findings

- **[Issue 3] [High] Double Negation on Inflow/Outflow Sign Check**
  - **Location:** `src/parsers/pdf-extractor.ts`
  - **Trigger Condition:** Regex extracts a negative number directly (e.g. `-500.00`) and the line contains a debit keyword.
  - **Potential Consequence:** The debit logic does `amount = -amount`, which converts the negative number back to positive, misclassifying an outflow as an inflow.
  - **Guard Snippet:** Check that `amount > 0` before negating it.

- **[Issue 4] [Low] Incomplete SMS Date Parsing / Fallback Timestamp Sorting**
  - **Location:** `src/parsers/chat-extractor.ts`
  - **Trigger Condition:** SMS log does not contain date information.
  - **Potential Consequence:** Defaults to the current date/time which leads to inconsistent ordering relative to other messages.
  - **Guard Snippet:** Allow a null timestamp or prompt the user, rather than using arbitrary current system time.
