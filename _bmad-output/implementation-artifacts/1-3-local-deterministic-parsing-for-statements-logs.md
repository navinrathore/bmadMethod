---
epic: "1"
story: "3"
status: "ready-for-dev"
title: "Local Deterministic Parsing for Statements & Logs"
baseline_commit: "NO_VCS"
---

# Story 1.3: Local Deterministic Parsing for Statements & Logs

## 1. Story Foundation

**User Story:**
As a user,
I want the system to parse my uploaded files locally in-memory,
So that my sensitive data is extracted without leaving my machine.

**Acceptance Criteria:**
- **Given** a user has dropped a bank statement (.pdf) or chat log (.txt) file
  **When** the system processes the file
  **Then** it displays an inline typing/processing indicator in the chat (e.g., "Processing [file name]...")
- **And** it successfully extracts tabular data for Bank Statements (date, amount, reference, description) or Chat Logs (timestamp, sender, body) into the ephemeral Zustand store
- **And** a system message confirms how many transactions or messages were successfully found (e.g., "Success: Extracted 24 transactions from statement.pdf")
- **And** if parsing fails or an unsupported file is processed, a clear system error message is displayed (e.g., "Error: Failed to parse statement.pdf. Reason: ...")

## 2. Developer Context & Guardrails

**Technical Requirements:**
- Must parse PDFs entirely on the client side using `pdfjs-dist`.
- Set up the PDF.js worker securely. In a Vite + React + TS context, use a static CDN URL or Vite's worker URL resolver:
  ```typescript
  import * as pdfjsLib from 'pdfjs-dist';
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  ```
- Parsers must be isolated from the React UI components in `src/parsers/` and return a standard payload:
  `{ success: boolean; data?: any; error?: string }`
- **Bank Statement Regex Rules:**
  - Standard formats (e.g., HDFC, ICICI, SBI) typically contain transaction rows with dates, descriptions, reference numbers (UPI, IMPS, check numbers), and debit/credit amounts.
  - Implement a generic fallback parser that scans for tables containing decimal amounts and date patterns (e.g., `DD/MM/YYYY` or `DD-MMM-YYYY`), cleaning up currency commas.
- **Chat Log / SMS Parsing Rules:**
  - Parse standard WhatsApp export format: `[DD/MM/YY, HH:MM:SS] Sender: Message` or `DD/MM/YY, HH:MM - Sender: Message`.
  - Parse generic SMS logs containing text body, sender, and optional timestamps.
- **State Integration:**
  - Extend the Zustand store (`useReconciliationStore.ts`) to manage parsed statements and chat entries:
    - `parsedTransactions: ParsedTransaction[]`
    - `parsedMessages: ParsedChatMessage[]`
    - `isProcessing: boolean` (to drive skeleton loaders/indicators)
  - Ensure all extracted amounts are stored internally as numbers, dates as ISO strings, and IDs are uniquely generated.

**Architecture Compliance:**
- **Zero Disk Persistence:** Under no circumstances should parsed financial details be stored in LocalStorage, IndexedDB, or sent to a backend. The store must remain entirely in-memory.
- **Error Boundaries:** Wrap the parsing invocation in try/catch blocks to ensure that malformed files do not crash the React app or block subsequent uploads.
- **UX Styling:** While parsing is in progress, render an animated typing/loading bubble in the ChatWindow and show a skeleton loader placeholder (from shadcn/ui or simple Tailwind layout) on the SidePanel.

**Library & Framework Requirements:**
- React 18+
- Zustand
- `pdfjs-dist` (already installed or add to package.json)
- Tailwind CSS

**File Structure Requirements:**
- `src/types/index.ts` (Define `ParsedTransaction` and `ParsedChatMessage` interfaces)
- `src/parsers/pdf-extractor.ts` (PDF parsing core using pdfjs-dist)
- `src/parsers/chat-extractor.ts` (WhatsApp and text log parser)
- `src/store/useReconciliationStore.ts` (Add parsed arrays, `isProcessing` state, and setActions)
- `src/components/chat/ChatWindow.tsx` (Trigger parsing on file drop, render typing indicator during parse)
- `src/components/panel/SidePanel.tsx` (Render skeleton loaders when `isProcessing` is true)

## 3. Previous Story Intelligence
- **Story 1.1:** App layout uses a 60/40 width distribution with persistent splits. 
- **Story 1.2:** DropzoneArea handles dragging and drops. Integrate the parser execution inside the `handleDrop` success block (replace the static "Ready for local parsing" with a dynamic execution call).

## 4. Project Context Reference
- Ensure loaders and icons follow the Slate/Gray theme with Blue accents.
- Verify typescript types are strictly checked and `"DOM.Iterable"` remains in tsconfig to support array conversions from file drops.

## 5. Completion Status
**Status:** ready-for-dev
**Note:** Ultimate context engine analysis completed - comprehensive developer guide created.

## Tasks / Subtasks
- [ ] Define shared TypeScript interfaces for `ParsedTransaction` and `ParsedChatMessage` in `src/types/index.ts`
- [ ] Extend Zustand store (`useReconciliationStore`) with fields for `parsedTransactions`, `parsedMessages`, and `isProcessing`
- [ ] Implement `src/parsers/pdf-extractor.ts` wrapper utilizing `pdfjs-dist` to extract plain text from statement pages
- [ ] Implement Regex bank format parser to convert raw PDF text lines into structured `ParsedTransaction` entries
- [ ] Implement WhatsApp/SMS parser in `src/parsers/chat-extractor.ts` to convert text rows into `ParsedChatMessage` entries
- [ ] Update `DropzoneArea.tsx`'s drop handler to trigger the appropriate parser asynchronously based on file extension
- [ ] Update `ChatWindow.tsx` to render an inline typing indicator when `isProcessing` is true
- [ ] Update `SidePanel.tsx` to display skeleton loaders when `isProcessing` is true

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
