---
epic: "1"
story: "2"
status: "review"
title: "Chat Interface with Drag-and-Drop Ingestion"
baseline_commit: "NO_VCS"
---

# Story 1.2: Chat Interface with Drag-and-Drop Ingestion

## 1. Story Foundation

**User Story:**
As a user,
I want to drag and drop files directly into the chat interface,
So that I can securely upload my bank statements and chat logs.

**Acceptance Criteria:**
- **Given** the user is viewing the chat interface
  **When** they drag a `.pdf` or `.txt` file over the chat window
  **Then** a dashed border dropzone visually indicates readiness
- **And** upon dropping the file, the chat interface displays a system message acknowledging the uploaded file

## 2. Developer Context & Guardrails

**Technical Requirements:**
- Implement a drag-and-drop zone over the Chat Area.
- Do NOT upload the files to any server. The processing must happen entirely in-memory using `File` objects.
- Display a visual overlay (e.g., dashed border, semi-transparent background) over the chat UI when dragging files over it.
- After dropping, dispatch a state change to the Zustand store or update local React state to indicate the file is ready for local parsing.
- Render a system message bubble in the chat UI confirming the file name was received.

**Architecture Compliance:**
- **State Management:** Use Zustand (`useReconciliationStore`) if the file data or parsed data needs to be accessible globally (e.g. by the side panel). For local UI state like `isDraggingOver`, use `useState`.
- **Styling:** Exclusively Tailwind utility classes inline. No custom CSS.
- **Security Boundaries:** Pure client-side execution. The chat component handles raw user input and file ingestion. It is responsible for dispatching actions and triggering parsers, but does NOT hold financial data state itself.

**Library & Framework Requirements:**
- React 18+ (using hooks like `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop`)
- Tailwind CSS
- shadcn/ui components (if needed for the system message or indicators)

**File Structure Requirements:**
- Target files: 
  - `src/components/chat/ChatWindow.tsx`
  - `src/components/chat/DropzoneArea.tsx` (Recommended to extract the dropzone logic here)
  - `src/components/chat/ChatMessage.tsx` (For the system acknowledgement message)
- **Naming Conventions:**
  - React Components: PascalCase
  - Types: PascalCase, no "I" prefix.

**Testing Requirements:**
- Ensure robust event handling (e.g., `e.preventDefault()` on drag events to stop the browser from opening the file).

## 3. Previous Story Intelligence
- **From Story 1.1:** The two-pane layout is established. Ensure the drag-and-drop zone is scoped correctly to the Chat Area (left/center pane) and does not incorrectly trigger when dragging over the Data Panel (right pane), unless the UX requires global dropping. According to the PRD: "drag-and-drop zone within the entire chat window for uploading files".

## 4. Project Context Reference
- Ensure the interactions follow the Inter font, Slate/Gray colors with Blue accents for the dropzone border.

## 5. Completion Status
**Status:** review
**Note:** Ultimate context engine analysis completed - comprehensive developer guide created.

## Tasks/Subtasks
- [x] Create Zustand store (`useReconciliationStore.ts`) for managing uploaded files and chat messages
- [x] Create `ChatMessage.tsx` for displaying messages
- [x] Create `DropzoneArea.tsx` to handle drag-and-drop events and visual overlay
- [x] Update `ChatWindow.tsx` to integrate the dropzone and message rendering

## Dev Agent Record
**Implementation Plan:**
Followed the provided implementation plan to create the Zustand store, the ChatMessage, and the DropzoneArea. Integrated them cleanly into ChatWindow.

**Completion Notes:**
- The Zustand store handles `files` and `messages`. Added UUID generation for messages.
- The `DropzoneArea` acts as an invisible wrapper that activates a visual overlay on `dragOver` and validates file types on `drop`. It alerts via system message for unsupported formats and acknowledges valid ones.
- `ChatMessage` gracefully displays both user and system roles, with appropriate colors (primary for user, muted/primary-tint for system).

## File List
- `src/store/useReconciliationStore.ts` [NEW]
- `src/components/chat/ChatMessage.tsx` [NEW]
- `src/components/chat/DropzoneArea.tsx` [NEW]
- `src/components/chat/ChatWindow.tsx` [MODIFY]

## Change Log
- Implemented Drag and Drop ingestion with Zustand state mapping and system message acknowledgment. (Date: 2026-06-16)
