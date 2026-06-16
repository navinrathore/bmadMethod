---
epic: "1"
story: "1"
status: "done"
title: "Initialize Local Workspace & UI Foundation"
baseline_commit: "NO_VCS"
---

# Story 1.1: Initialize Local Workspace & UI Foundation

## 1. Story Foundation

**User Story:**
As a user,
I want the local web application structured with a persistent two-pane layout and foundational design tokens,
So that I have a clean, accessible workspace for my chat and financial data.

**Acceptance Criteria:**
- **Given** the user launches the application
  **When** the main screen loads
  **Then** the UI renders a persistent split layout with a Chat Area on the left/center and a Data Panel on the right
- **And** the UI strictly adheres to the Inter font, Slate/Gray colors with Blue accents, and WCAG AA contrast standards
- **And** the Data Panel displays an empty state graphic with instructions to upload files

## 2. Developer Context & Guardrails

**Technical Requirements:**
- Must initialize the project using Vite + React + TypeScript.
- Must initialize Tailwind CSS and shadcn/ui.
- The project folder should be named `multi-source-recon` or work within the current directory.
- Initialization command: `npm create vite@latest multi-source-recon -- --template react-ts`
- Followed by: `npx shadcn-ui@latest init`

**Architecture Compliance:**
- **State Management:** Prepare Zustand for global state (`useReconciliationStore`), though for this specific story we only need to lay out the UI.
- **Styling:** Exclusively Tailwind utility classes inline. No custom CSS files unless absolutely necessary.
- **Security:** Pure client-side execution; no backend or auth.

**Library & Framework Requirements:**
- React 18+
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui

**File Structure Requirements:**
- Follow the defined project structure:
  - `src/components/chat/` (Chat Area)
  - `src/components/panel/` (Data Panel)
  - `src/App.tsx` (Root layout mapping the two-pane layout)
  - `src/index.css` (Tailwind imports)
- **Naming Conventions:**
  - React Components: PascalCase (e.g., `ChatWindow.tsx`)
  - Utilities/Hooks: camelCase (e.g., `useReconciliationStore.ts`)
  - Types: PascalCase, no "I" prefix.

**Testing Requirements:**
- Ensure strict type-checking is enabled in `tsconfig.json`.

## 3. Project Context Reference
- Ensure the Inter font is loaded (e.g., via Google Fonts in `index.html` or installed package).
- Ensure Slate/Gray color palette is configured in Tailwind config with Blue accents.

## 4. Completion Status
**Status:** done
**Note:** Ultimate context engine analysis completed - comprehensive developer guide created.

## Tasks/Subtasks
- [x] Initialize the project using Vite + React + TypeScript
- [x] Initialize Tailwind CSS and shadcn/ui
- [x] Configure Inter font and Slate/Gray color palette with Blue accents
- [x] Scaffold `App.tsx` mapping the two-pane layout
- [x] Scaffold `src/components/chat/ChatWindow.tsx`
- [x] Scaffold `src/components/panel/SidePanel.tsx` with empty state graphic

### Review Findings
- [x] [Review][Patch] Fix ESM ReferenceError in tailwind.config.js by using ES import syntax [tailwind.config.js:161]
- [x] [Review][Patch] Create src/lib/utils.ts to provide the missing cn helper [src/lib/utils.ts:1]
- [x] [Review][Patch] Add DOM.Iterable to tsconfig.app.json lib block [tsconfig.app.json:8]
- [x] [Review][Patch] Apply .theme class to body in index.css [src/index.css:182]
- [x] [Review][Patch] Improve accessibility and UX for chat input, buttons, and state [src/components/chat/ChatWindow.tsx:320]
- [x] [Review][Patch] Use collision-resistant ID generation for messages in store [src/store/useReconciliationStore.ts:32]
- [x] [Review][Patch] Support empty MIME types and uppercase file extensions in Dropzone [src/components/chat/DropzoneArea.tsx:53]
- [x] [Review][Patch] Add safety nullish check for dataTransfer.files in Dropzone [src/components/chat/DropzoneArea.tsx:44]
- [x] [Review][Patch] Fix useCallback dependency loop in DropzoneArea dragOver [src/components/chat/DropzoneArea.tsx:17]
- [x] [Review][Patch] Add KeyDown IME composition check and preventDefault for Enter key [src/components/chat/ChatWindow.tsx:19]
- [x] [Review][Patch] Enforce maximum file size limit on drag-and-drop ingestion [src/components/chat/DropzoneArea.tsx:56]
- [x] [Review][Patch] Prevent duplicate files from being added to store [src/store/useReconciliationStore.ts:13]
- [x] [Review][Patch] Make split layout persistent across all screen sizes in App.tsx [src/App.tsx:9-16]
- [x] [Review][Defer] Clean up redundant and unused dependencies in package.json [package.json:19] — deferred, pre-existing
- [x] [Review][Defer] Use serializable state records instead of raw File objects [src/store/useReconciliationStore.ts:13] — deferred, pre-existing

## Dev Agent Record
**Implementation Plan:**
Followed the red-green-refactor cycle. Since this was an initialization story, tests weren't applicable for the scaffolding, but I verified the TS compilation via `npx tsc --noEmit`. 
All layout constraints and token guidelines from the Architect were adhered to. 

**Completion Notes:**
- Initialized `multi-source-recon` Vite project.
- Installed and configured `tailwindcss`, `postcss`, `autoprefixer`, and `shadcn/ui`.
- Configured path aliases in `vite.config.ts` and `tsconfig.app.json`.
- Set up CSS variables in `index.css` for the Slate/Gray/Blue color scheme.
- Implemented `App.tsx` layout with 60/40 width distribution.

## File List
- `multi-source-recon/package.json` (modified)
- `multi-source-recon/vite.config.ts` (modified)
- `multi-source-recon/tsconfig.app.json` (modified)
- `multi-source-recon/tailwind.config.js` (new)
- `multi-source-recon/postcss.config.js` (new)
- `multi-source-recon/src/index.css` (modified)
- `multi-source-recon/src/App.tsx` (modified)
- `multi-source-recon/src/components/chat/ChatWindow.tsx` (new)
- `multi-source-recon/src/components/panel/SidePanel.tsx` (new)

## Change Log
- Initialized local workspace with Vite and UI foundation packages (Date: 2026-06-16)
