---
epic: "1"
story: "3"
status: "done"
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
**Status:** done
**Note:** In-memory PDF extraction, regex statement parsing, and WhatsApp/SMS logs parsing implemented, verified with unit tests, and fully integrated with the UI. All odd-numbered code review findings have been resolved.

### Review Findings
- [x] [Review][Patch] Issue 1: PDF.js multi-column text extraction sorting [src/parsers/pdf-extractor.ts:25]
- [ ] [Review][Defer] Issue 2: Dynamic worker CDN internet dependency [src/parsers/pdf-extractor.ts:6]
- [x] [Review][Patch] Issue 3: Double negation on inflow/outflow sign check [src/parsers/pdf-extractor.ts:180]
- [ ] [Review][Defer] Issue 4: Incomplete SMS Date parsing / Fallback timestamp sorting [src/parsers/chat-extractor.ts:89]
- [x] [Review][Patch] Issue 5: Parser error boundary recovery failure (stuck loading) [src/components/chat/DropzoneArea.tsx:84]
- [ ] [Review][Defer] Issue 6: Duplicate transaction import detection [src/store/useReconciliationStore.ts:13]

## Tasks / Subtasks
- [x] Define shared TypeScript interfaces for `ParsedTransaction` and `ParsedChatMessage` in `src/types/index.ts`
- [x] Extend Zustand store (`useReconciliationStore`) with fields for `parsedTransactions`, `parsedMessages`, and `isProcessing`
- [x] Implement `src/parsers/pdf-extractor.ts` wrapper utilizing `pdfjs-dist` to extract plain text from statement pages
- [x] Implement Regex bank format parser to convert raw PDF text lines into structured `ParsedTransaction` entries
- [x] Implement WhatsApp/SMS parser in `src/parsers/chat-extractor.ts` to convert text rows into `ParsedChatMessage` entries
- [x] Update `DropzoneArea.tsx`'s drop handler to trigger the appropriate parser asynchronously based on file extension
- [x] Update `ChatWindow.tsx` to render an inline typing indicator when `isProcessing` is true
- [x] Update `SidePanel.tsx` to display skeleton loaders when `isProcessing` is true

## Dev Agent Record
**Implementation Plan:**
Implemented local parsing of PDF statements using `pdfjs-dist` and text chats/SMS logs, saving parsed records to Zustand store and notifying the user with success/error indicators. Created full unit tests for regex extractors.

**Completion Notes:**
- Defined `ParsedTransaction` and `ParsedChatMessage` types in `src/types/index.ts`.
- Extended Zustand store `useReconciliationStore` to include `parsedTransactions`, `parsedMessages`, and `isProcessing` states and actions.
- Implemented secure browser-based PDF text extractor and regex statement parser in `src/parsers/pdf-extractor.ts`.
- Implemented WhatsApp and SMS parser in `src/parsers/chat-extractor.ts` supporting multi-line chat continuations.
- Updated `DropzoneArea.tsx` to asynchronously run the parser pipelines based on file types.
- Integrated Bot typing indicator bubble inside `ChatWindow.tsx` and animation pulse skeletons inside `SidePanel.tsx` bound to the store's `isProcessing` state.
- Rendered parsed transactions and messages on the `SidePanel.tsx` as soon as they are processed.
- Created and executed Vitest unit tests in `src/parsers/__tests__/parsers.test.ts` covering date formats, negative/positive amount detection, and multi-line chat logs.

## File List
- `package.json` [MODIFY]
- `src/types/index.ts` [MODIFY]
- `src/store/useReconciliationStore.ts` [MODIFY]
- `src/parsers/pdf-extractor.ts` [NEW]
- `src/parsers/chat-extractor.ts` [NEW]
- `src/parsers/__tests__/parsers.test.ts` [NEW]
- `src/components/chat/DropzoneArea.tsx` [MODIFY]
- `src/components/chat/ChatWindow.tsx` [MODIFY]
- `src/components/panel/SidePanel.tsx` [MODIFY]

## Change Log
- Implemented client-side deterministic PDF statement and text chat/SMS log parsing with Zustand synchronization and responsive UI indicators. (Date: 2026-06-16)
