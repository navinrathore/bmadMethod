---
title: PRD - Multi-Source Reconciliation and Extraction Engine
status: final
created: 2026-06-15
updated: 2026-06-15
---

# PRD: Multi-Source Reconciliation and Extraction Engine

## 0. Document Purpose
This document defines the functional and non-functional requirements for the Multi-Source Reconciliation and Extraction Engine. It serves as the primary contract for engineering and design, anchoring vocabulary in the Glossary and nesting features with testable functional requirements. It builds directly upon the finalized product brief.

## 1. Vision
Data validation and reconciliation across unstructured sources like bank statements, WhatsApp chats, and SMS logs is traditionally a tedious, manual process. This engine replaces manual cross-checking with a conversational, web-based UI that intelligently parses and matches disparate data streams while strictly maintaining local privacy. It transforms hours of frustrating manual auditing—for both society committees and personal finance tracking—into a seamless, minutes-long interaction.

## 2. Target User

### 2.1 Jobs To Be Done
- **Functional:** Quickly verify which flat paid maintenance by cross-referencing bank deposits with WhatsApp confirmations.
- **Functional:** Categorize personal spending, identifying specific UPI sinks, bill payments, and inter-family transfers without manual spreadsheet entry.
- **Contextual:** Process highly sensitive financial and personal data without exposing it to the cloud.

### 2.2 Non-Users (v1)
- Large enterprise accounting departments (requiring complex multi-tenant or ERP integrations).
- Users looking for a fully automated, hands-off cloud SaaS (since this relies on manual uploads for privacy).

### 2.3 Key User Journeys

- **UJ-1. Navin audits the society maintenance payments.**
  - **Persona + context:** Navin, a society committee member, needs to update the monthly maintenance ledger.
  - **Entry state:** Authenticated on the local web UI, arriving at a fresh chat session.
  - **Path:** He uploads the society's monthly bank statement (PDF) and the society WhatsApp group chat export (txt). In the chat, he asks: "Show me who paid maintenance this month and flag the missing ones." The system locally parses both files, matches deposits to chat claims, and renders a table in the side panel.
  - **Climax:** Navin sees a clean table of 20 flats. 18 are marked "Paid" with matched evidence. 2 are marked "Unpaid". He downloads this table as a CSV.
  - **Resolution:** Ledger updated in 5 minutes instead of 2 hours.

- **UJ-2. Navin untangles his personal UPI payments.**
  - **Persona + context:** Navin wants to categorize his personal spending to see where his money went this month.
  - **Entry state:** Authenticated on the local web UI.
  - **Path:** He uploads his personal bank statement. He asks the chat, "Categorize my spending, highlight UPI payments to external vendors, and identify transfers to my wife's account." The side panel populates with categorized flows and flags 3 "orphan" transactions that lack clear references.
  - **Climax:** Navin reviews the orphan transactions, clicks on them to view the raw bank line, and manually tags them via the chat.
  - **Resolution:** A fully categorized financial picture is exported.

## 3. Glossary
- **Data Source** — An uploaded file containing raw transaction or communication data (e.g., Bank Statement PDF, WhatsApp Chat Export).
- **Orphan Transaction** — A financial transaction from a bank statement that cannot be definitively matched to an expected category, known entity, or supporting communication.
- **Reconciliation Engine** — The core local service responsible for extracting entities from Data Sources and evaluating them against rules.
- **Side Panel** — The dynamic, updateable UI region adjacent to the chat window that displays structured data (tables, summaries).

## 4. Features

### 4.1 Secure Data Ingestion
**Description:** The system allows users to securely upload unstructured and semi-structured files directly into the local environment for processing. Realizes UJ-1, UJ-2.

**Functional Requirements:**
#### FR-1: Upload Bank Statements
User can upload standard Bank Statement PDFs or CSVs [ASSUMPTION: limited to 3 common bank formats initially].
**Consequences:**
- System parses tabular data locally and extracts date, amount, reference number, and description.

#### FR-2: Upload Chat/SMS Logs
User can upload WhatsApp chat exports (.txt) and SMS backup texts.
**Consequences:**
- System parses messages locally, extracting timestamps, sender names, and text bodies.

### 4.2 Conversational Query Interface
**Description:** A chat window where users issue natural language commands to instruct the Reconciliation Engine on what to match or extract. Realizes UJ-1, UJ-2.

**Functional Requirements:**
#### FR-3: Natural Language Querying
User can type natural language requests (e.g., "Match maintenance payments") into the chat interface.
**Consequences:**
- System interprets the intent and triggers the appropriate matching logic across active Data Sources.

### 4.3 Hybrid Reconciliation Engine
**Description:** The core logic that matches records between sources using local deterministic parsing, falling back to a privacy-preserving LLM call if needed. Realizes UJ-1, UJ-2.

**Functional Requirements:**
#### FR-4: Deterministic Matching
System matches transactions to chat messages using exact or fuzzy matching on amounts, dates, and flat numbers/names.
**Consequences:**
- Clear matches are scored and stored without external API calls.

#### FR-5: Privacy-Preserving LLM Validation
System can query an external LLM for semantic matching using ONLY anonymized metadata (e.g., transaction IDs, sanitized message strings with PII scrubbed).
**Consequences:**
- System rejects LLM payload if it contains raw account numbers or balances [ASSUMPTION: a local sanitization layer filters outbound requests].

### 4.4 Dynamic Side Panel & Export
**Description:** A dedicated UI region to view, scroll, and export the structured results of the queries. Realizes UJ-1, UJ-2.

**Functional Requirements:**
#### FR-6: Render Tabular Results
System displays matched records, categorized flows, and Orphan Transactions in a refreshable data table in the Side Panel.

#### FR-7: Export Results
User can download the current state of the Side Panel data as a CSV file.

## 5. Constraints and Guardrails (Security & Privacy)
Given the highly sensitive nature of financial statements and personal chats:
- **Local First Execution:** The system must be capable of running entirely locally on the user's machine.
- **Strict Data Privacy:** No raw personal financial data, names, or balances should ever be transmitted to external/cloud LLMs.
- **Zero Retention:** The system should not store user data beyond the active session unless explicitly saved locally by the user [ASSUMPTION].

## 6. Non-Goals (Explicit)
- Direct API integration with banks (relying on manual statement uploads instead).
- Multi-tenant SaaS billing and advanced user management (built for single-user local deployment first).
- Real-time WhatsApp bot integration.
- A fully-fledged accounting suite (this is a reconciliation utility, not Quickbooks).

## 7. MVP Scope
### 7.1 In Scope
- Web UI (Chat + Side Panel).
- Local ingestion of Bank PDFs/CSVs and WhatsApp/SMS texts.
- Deterministic + Anonymized LLM matching engine.
- Society Maintenance and Personal Finance rule sets.
- CSV Export.

### 7.2 Out of Scope for MVP
- Cloud hosting / SaaS offering.
- Direct Bank APIs.
- Mobile application.

## 8. Success Metrics
**Primary**
- **SM-1:** Reconciliation Accuracy — >95% accuracy in matching clear maintenance payments between bank statements and WhatsApp confirmations. Validates FR-4, FR-5.
- **SM-2:** Time Saved — Monthly society reconciliation completed in <10 minutes. Validates FR-1, FR-3, FR-6.

**Counter-metrics**
- **SM-C1:** External API Payload Size — Must remain near zero for PII data to ensure local privacy is not breached in pursuit of higher accuracy.

## 9. Open Questions
1. Which specific 1-3 bank PDF formats should we target for the initial MVP parser?
2. What local LLM or specific deterministic libraries should we use for the local entity extraction to ensure performance on a standard laptop?

## 10. Assumptions Index
- **[ASSUMPTION]** Bank Statement uploads are limited to 3 common bank formats initially (Section 4.1).
- **[ASSUMPTION]** A local sanitization layer filters outbound LLM requests to prevent PII leakage (Section 4.3).
- **[ASSUMPTION]** The system does not persist uploaded files beyond the active session unless explicitly commanded (Section 5).
