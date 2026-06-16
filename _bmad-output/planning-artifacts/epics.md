---
stepsCompleted: [1, 2, 3]
inputDocuments: [
  "/home/navin/work/AI/bmadMethod/_bmad-output/planning-artifacts/prds/prd-TestBMadMethod-2026-06-15/prd.md",
  "/home/navin/work/AI/bmadMethod/_bmad-output/planning-artifacts/architecture.md",
  "/home/navin/work/AI/bmadMethod/_bmad-output/planning-artifacts/ux-designs/ux-TestBMadMethod-2026-06-15/DESIGN.md",
  "/home/navin/work/AI/bmadMethod/_bmad-output/planning-artifacts/ux-designs/ux-TestBMadMethod-2026-06-15/EXPERIENCE.md"
]
---

# TestBMadMethod - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for TestBMadMethod, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: [Upload Bank Statements] User can upload standard Bank Statement PDFs or CSVs, and system locally extracts date, amount, reference number, and description.
FR2: [Upload Chat/SMS Logs] User can upload WhatsApp chat exports (.txt) and SMS backup texts, and system locally extracts timestamps, sender names, and text bodies.
FR3: [Natural Language Querying] User can type natural language requests into the chat interface to instruct the Reconciliation Engine on what to match or extract.
FR4: [Deterministic Matching] System matches transactions to chat messages using exact or fuzzy matching on amounts, dates, and flat numbers/names without external API calls.
FR5: [Privacy-Preserving LLM Validation] System can query an external LLM for semantic matching using ONLY anonymized metadata (e.g., transaction IDs, sanitized message strings with PII scrubbed).
FR6: [Render Tabular Results] System displays matched records, categorized flows, and Orphan Transactions in a refreshable data table in the Side Panel.
FR7: [Export Results] User can download the current state of the Side Panel data as a CSV file.

### NonFunctional Requirements

NFR1: [Local First Execution] The system must be capable of running entirely locally on the user's machine.
NFR2: [Strict Data Privacy] No raw personal financial data, names, or balances should ever be transmitted to external/cloud LLMs.
NFR3: [Zero Retention] The system should not store user data beyond the active session unless explicitly saved locally by the user.
NFR4: [Reconciliation Accuracy] >95% accuracy in matching clear maintenance payments between bank statements and WhatsApp confirmations.
NFR5: [Time Saved] Monthly society reconciliation completed in <10 minutes.
NFR6: [External API Payload Size] Must remain near zero for PII data to ensure local privacy is not breached.

### Additional Requirements

- **Starter Template**: Vite + React + TypeScript (Tailwind CSS, shadcn/ui) setup must be executed as Epic 1 Story 1.
- Pure In-Memory State (Zustand) for Zero Retention, avoiding IndexedDB.
- Client-Side Regex + Deterministic Parsing (`pdfjs-dist`) for extracting text directly from PDFs.
- PII Sanitization Layer must be implemented to scrub data before any LLM calls.
- Static execution or local dev server deployment (no backend/auth).

### UX Design Requirements

UX-DR1: [Layout] Implement persistent two-pane layout: Left/Center Chat (conversational interface, file drop) and Right Data Panel (dynamic workspace).
UX-DR2: [Ingestion] Implement drag-and-drop zone within the entire chat window for uploading files.
UX-DR3: [Data Tables] Implement tables in Side Panel with sticky headers, horizontal scrolling, right-aligned numerical columns, and status badges (Success/Match vs Error/Missing).
UX-DR4: [Export Action] Add a persistent, highly visible "Export to CSV" button at the top of the Side Panel.
UX-DR5: [Processing States] Implement inline typing indicator in chat and skeleton loader in Side Panel during processing.
UX-DR6: [Empty State] Display a blank slate graphic with upload instructions in the Side Panel on first load.
UX-DR7: [Interaction] Implement hover state for Orphan Transactions and click-to-detail modal showing the raw unparsed string from the source file.
UX-DR8: [Accessibility] Ensure keyboard navigation support and strict WCAG AA contrast for financial numbers.
UX-DR9: [Visuals] Use Slate/Gray colors with Blue accent, Inter font, and semantic feedback colors.

### FR Coverage Map

FR1: Epic 1 - Upload Bank Statements
FR2: Epic 1 - Upload Chat/SMS Logs
FR3: Epic 2 - Natural Language Querying
FR4: Epic 2 - Deterministic Matching
FR5: Epic 3 - Privacy-Preserving LLM Validation
FR6: Epic 2 - Render Tabular Results
FR7: Epic 3 - Export Results

## Epic List

### Epic 1: Secure Ingestion & Workspace Foundation
Users can initialize their local, privacy-first workspace and securely upload raw bank statements and chat logs without data leaving their machine.
**FRs covered:** FR1, FR2

### Epic 2: Conversational Reconciliation & Data Visualization
Users can query the engine using natural language to perform deterministic matching, instantly seeing the reconciled ledger in a dynamic side panel.
**FRs covered:** FR3, FR4, FR6

### Epic 3: Advanced Validation & Ledger Export
Users can resolve complex or orphaned transactions using privacy-safe AI validation and export their finalized financial ledger for external use.
**FRs covered:** FR5, FR7

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic 1: Secure Ingestion & Workspace Foundation

Users can initialize their local, privacy-first workspace and securely upload raw bank statements and chat logs without data leaving their machine.

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story 1.1: Initialize Local Workspace & UI Foundation

As a user,
I want the local web application structured with a persistent two-pane layout and foundational design tokens,
So that I have a clean, accessible workspace for my chat and financial data.

**Acceptance Criteria:**

**Given** the user launches the application
**When** the main screen loads
**Then** the UI renders a persistent split layout with a Chat Area on the left/center and a Data Panel on the right
**And** the UI strictly adheres to the Inter font, Slate/Gray colors with Blue accents, and WCAG AA contrast standards
**And** the Data Panel displays an empty state graphic with instructions to upload files

### Story 1.2: Chat Interface with Drag-and-Drop Ingestion

As a user,
I want to drag and drop files directly into the chat interface,
So that I can securely upload my bank statements and chat logs.

**Acceptance Criteria:**

**Given** the user is viewing the chat interface
**When** they drag a `.pdf` or `.txt` file over the chat window
**Then** a dashed border dropzone visually indicates readiness
**And** upon dropping the file, the chat interface displays a system message acknowledging the uploaded file

### Story 1.3: Local Deterministic Parsing for Statements & Logs

As a user,
I want the system to parse my uploaded files locally in-memory,
So that my sensitive data is extracted without leaving my machine.

**Acceptance Criteria:**

**Given** a user has dropped a bank statement or chat log file
**When** the system processes the file
**Then** it displays an inline typing/processing indicator in the chat
**And** it successfully extracts tabular data (date, amount, reference, description) or chat messages (timestamp, sender, body) into the ephemeral Zustand state
**And** a system message confirms how many transactions or messages were found

<!-- End story repeat -->

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic 2: Conversational Reconciliation & Data Visualization

Users can query the engine using natural language to perform deterministic matching, instantly seeing the reconciled ledger in a dynamic side panel.

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story 2.1: Natural Language Querying via Chat

As a user,
I want to type natural language requests into the chat interface,
So that I can instruct the Reconciliation Engine on what to match or extract.

**Acceptance Criteria:**

**Given** the user is viewing the chat interface
**When** they type a query like "Match maintenance payments" and send it
**Then** the query appears in the chat history as a distinct, right-aligned bubble
**And** the system registers the intent and triggers the local matching engine

### Story 2.2: Local Deterministic Matching Engine

As a user,
I want the system to match transactions to chat messages deterministically,
So that my data is reconciled accurately without external API calls.

**Acceptance Criteria:**

**Given** a query to match payments has been submitted
**When** the engine executes
**Then** it performs exact or fuzzy matching on amounts, dates, and flat numbers/names across the extracted Zustand state
**And** it categorizes transactions as Matched, Missing, or Orphaned without making any network requests

### Story 2.3: Dynamic Side Panel with Tabular Results

As a user,
I want to see the matched records in a refreshable data table in the Side Panel,
So that I can easily review the categorized flows.

**Acceptance Criteria:**

**Given** the engine has begun or completed deterministic matching
**When** the side panel updates
**Then** it displays a skeleton loader while data is being prepared
**And** once ready, it renders a dense data table with sticky headers, horizontal scrolling, and right-aligned monospaced numerical columns
**And** it uses semantic status badges (e.g., Green for Match, Red for Missing/Orphan) for each row

<!-- End story repeat -->

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic 3: Advanced Validation & Ledger Export

Users can resolve complex or orphaned transactions using privacy-safe AI validation and export their finalized financial ledger for external use.

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story 3.1: Orphan Transaction Detail & Resolution View

As a user,
I want to click on orphaned transactions to view their raw source text,
So that I can manually verify why the parser failed to match them.

**Acceptance Criteria:**

**Given** the user sees an Orphan transaction in the Side Panel
**When** they hover over it
**Then** the row highlights to indicate interactivity
**When** they click the row
**Then** a modal opens showing the raw, unparsed string from the source file
**And** the background dims with a soft shadow
**And** the user can use the chat or modal to manually assign the transaction

### Story 3.2: Privacy-Preserving LLM Validation Middleware

As a user,
I want the system to safely use AI to resolve complex matches,
So that my data remains completely private without exposing my identity or exact balances.

**Acceptance Criteria:**

**Given** an ambiguous match requires AI validation
**When** the system prepares the LLM request
**Then** the local PII Sanitization layer deterministically scrubs all raw account numbers, balances, and names
**And** it sends a payload containing ONLY anonymized metadata (e.g., transaction IDs, sanitized message strings)
**And** the system blocks the request entirely if the payload fails the sanitization check

### Story 3.3: Finalized Ledger CSV Export

As a user,
I want to export the reconciled ledger,
So that I can use the finalized data in my accounting software or personal records.

**Acceptance Criteria:**

**Given** the Side Panel is populated with reconciled data
**When** the user clicks the highly visible "Export to CSV" button at the top of the panel
**Then** the system immediately generates a CSV file reflecting the exact current state of the tabular data
**And** the file is downloaded to the user's local machine

<!-- End story repeat -->
