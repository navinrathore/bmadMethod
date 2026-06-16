# User-Reported Issues Log (Story 1.3)

This log tracks issues reported by the user during deployment or local runtime, along with root causes, file modifications, and resolution statuses.

---

## 1. PDF.js Worker CDN Fetch Failure

### **Issue Description**
When running on the server, the application throws the following exception during PDF ingestion:
`Error: Failed to parse 09751000015179_1690520000232.pdf. Reason: Setting up fake worker failed: "Failed to fetch dynamically imported module: http://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.0.227/pdf.worker.min.js?import".`

### **Root Cause**
- **Version mismatch:** The package version of `pdfjs-dist` is `6.0.227`. This specific version does not host a standard `.js` worker file on Cloudflare CDNJS, returning a 404 or module loading error.
- **Dynamic ES Import syntax:** Modern PDF.js worker formats use `.mjs` scripts. When loading from CDN, the browser appends `?import` queries which CDNs are not configured to process.
- **Offline block:** External CDN dependency blocks local, privacy-centric offline execution requirements.

### **File Modification**
- **File:** [pdf-extractor.ts](file:///home/navin/work/AI/bmadMethod/multi-source-recon/src/parsers/pdf-extractor.ts)

**Diff:**
```diff
-// Initialize PDFJS Worker from static CDN
-// In a Vite environment, using CDN worker prevents bundler mismatch issues.
-pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
+import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
+
+// Initialize PDFJS Worker locally using Vite's asset URL resolution.
+// This ensures worker loading works offline and matches the local package version.
+pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
```

### **Status**
- **Status:** **Resolved / Patched**
- **Validation:** 
  - Verified local bundler integration with Vite via `npm run build` which compiled the worker script as a versioned asset in the production bundle (`dist/assets/pdf.worker.min-*.mjs`).
  - Unit tests running in Vitest successfully execute and resolve the worker asset query without errors.
