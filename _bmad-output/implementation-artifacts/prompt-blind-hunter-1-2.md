# Blind Hunter Code Review Prompt (Story 1.2)

You are the Blind Hunter. Review the following unified git diff. You do not have access to any specifications, documentation, or the surrounding codebase. Look for general code quality issues, bugs, syntax errors, styling issues, and potential improvements.

## Diff Output
```diff
diff --git a/multi-source-recon/src/store/useReconciliationStore.ts b/multi-source-recon/src/store/useReconciliationStore.ts
new file mode 100644
index 0000000..477d39a
--- /dev/null
+++ b/multi-source-recon/src/store/useReconciliationStore.ts
@@ -0,0 +1,51 @@
+import { create } from 'zustand';
+
+export type MessageRole = 'user' | 'system';
+
+export interface ChatMessageData {
+  id: string;
+  role: MessageRole;
+  content: string;
+  timestamp: number;
+}
+
+interface ReconciliationStore {
+  files: File[];
+  messages: ChatMessageData[];
+  addFile: (file: File) => void;
+  addSystemMessage: (content: string) => void;
+  addUserMessage: (content: string) => void;
+}
+
+export const useReconciliationStore = create<ReconciliationStore>((set) => ({
+  files: [],
+  messages: [],
+  addFile: (file) =>
+    set((state) => ({
+      files: [...state.files, file],
+    })),
+  addSystemMessage: (content) =>
+    set((state) => ({
+      messages: [
+        ...state.messages,
+        {
+          id: Math.random().toString(36).substring(2, 9),
+          role: 'system',
+          content,
+          timestamp: Date.now(),
+        },
+      ],
+    })),
+  addUserMessage: (content) =>
+    set((state) => ({
+      messages: [
+        ...state.messages,
+        {
+          id: Math.random().toString(36).substring(2, 9),
+          role: 'user',
+          content,
+          timestamp: Date.now(),
+        },
+      ],
+    })),
+}));
diff --git a/multi-source-recon/src/components/chat/ChatMessage.tsx b/multi-source-recon/src/components/chat/ChatMessage.tsx
new file mode 100644
index 0000000..d77de87
--- /dev/null
+++ b/multi-source-recon/src/components/chat/ChatMessage.tsx
@@ -0,0 +1,32 @@
+import type { ChatMessageData } from '../../store/useReconciliationStore';
+import { Bot, User } from 'lucide-react';
+
+interface ChatMessageProps {
+  message: ChatMessageData;
+}
+
+export const ChatMessage = ({ message }: ChatMessageProps) => {
+  const isSystem = message.role === 'system';
+
+  return (
+    <div className={`flex w-full ${isSystem ? 'justify-start' : 'justify-end'} mb-4`}>
+      <div className={`flex max-w-[80%] ${isSystem ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
+        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${isSystem ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
+          {isSystem ? <Bot size={18} /> : <User size={18} />}
+        </div>
+        <div className={`flex flex-col ${isSystem ? 'items-start' : 'items-end'}`}>
+          <div className={`px-4 py-3 rounded-2xl ${
+            isSystem 
+              ? 'bg-muted/50 text-muted-foreground border border-border text-sm' 
+              : 'bg-primary text-primary-foreground'
+          }`}>
+            <p className="whitespace-pre-wrap break-words">{message.content}</p>
+          </div>
+          <span className="text-[10px] text-muted-foreground mt-1 px-1">
+            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
+          </span>
+        </div>
+      </div>
+    </div>
+  );
+};
diff --git a/multi-source-recon/src/components/chat/DropzoneArea.tsx b/multi-source-recon/src/components/chat/DropzoneArea.tsx
new file mode 100644
index 0000000..80ee9c4
--- /dev/null
+++ b/multi-source-recon/src/components/chat/DropzoneArea.tsx
@@ -0,0 +1,100 @@
+import { useState, useCallback } from 'react';
+import { UploadCloud } from 'lucide-react';
+import { useReconciliationStore } from '../../store/useReconciliationStore';
+
+interface DropzoneAreaProps {
+  children: React.ReactNode;
+}
+
+export const DropzoneArea = ({ children }: DropzoneAreaProps) => {
+  const [isDraggingOver, setIsDraggingOver] = useState(false);
+  const addFile = useReconciliationStore((state) => state.addFile);
+  const addSystemMessage = useReconciliationStore((state) => state.addSystemMessage);
+
+  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
+    e.preventDefault();
+    e.stopPropagation();
+    if (!isDraggingOver) {
+      setIsDraggingOver(true);
+    }
+  }, [isDraggingOver]);
+
+  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
+    e.preventDefault();
+    e.stopPropagation();
+    setIsDraggingOver(true);
+  }, []);
+
+  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
+    e.preventDefault();
+    e.stopPropagation();
+    
+    // Prevent flickering when dragging over children
+    const rect = e.currentTarget.getBoundingClientRect();
+    if (
+      e.clientX <= rect.left ||
+      e.clientX >= rect.right ||
+      e.clientY <= rect.top ||
+      e.clientY >= rect.bottom
+    ) {
+      setIsDraggingOver(false);
+    }
+  }, []);
+
+  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
+    e.preventDefault();
+    e.stopPropagation();
+    setIsDraggingOver(false);
+
+    const files = Array.from(e.dataTransfer.files);
+    if (files.length === 0) return;
+
+    const MAX_FILE_SIZE_MB = 50;
+    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
+
+    files.forEach((file) => {
+      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
+      const isPdf = file.type === 'application/pdf' || ext === 'pdf';
+      const isTxt = file.type === 'text/plain' || ext === 'txt';
+
+      if (!isPdf && !isTxt) {
+        addSystemMessage(`Warning: Unsupported file format (${file.name}). Only .pdf and .txt are allowed.`);
+        return;
+      }
+
+      if (file.size > MAX_FILE_SIZE_BYTES) {
+        addSystemMessage(`Error: ${file.name} exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`);
+        return;
+      }
+
+      addFile(file);
+      addSystemMessage(`File received: ${file.name}. Ready for local parsing.`);
+    });
+  }, [addFile, addSystemMessage]);
+
+  return (
+    <div 
+      className="relative w-full h-full flex flex-col"
+      onDragOver={handleDragOver}
+      onDragEnter={handleDragEnter}
+      onDragLeave={handleDragLeave}
+      onDrop={handleDrop}
+    >
+      {children}
+      
+      {isDraggingOver && (
+        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm m-4 rounded-xl border-2 border-dashed border-primary transition-all duration-200">
+          <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95">
+            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
+              <UploadCloud className="w-8 h-8 text-primary" />
+            </div>
+            <h3 className="text-xl font-semibold text-foreground mb-2">Drop files here</h3>
+            <p className="text-sm text-muted-foreground">
+              Securely ingest .pdf or .txt documents
+            </p>
+          </div>
+        </div>
+      )}
+    </div>
+  );
+};
diff --git a/multi-source-recon/src/components/chat/ChatWindow.tsx b/multi-source-recon/src/components/chat/ChatWindow.tsx
new file mode 100644
index 0000000..c7c2061
--- /dev/null
+++ b/multi-source-recon/src/components/chat/ChatWindow.tsx
@@ -0,0 +1,64 @@
+import { useState } from 'react';
+import { useReconciliationStore } from '../../store/useReconciliationStore';
+import { ChatMessage } from './ChatMessage';
+import { DropzoneArea } from './DropzoneArea';
+
+export const ChatWindow = () => {
+  const [inputText, setInputText] = useState('');
+  const messages = useReconciliationStore((state) => state.messages);
+  const addUserMessage = useReconciliationStore((state) => state.addUserMessage);
+
+  const handleSend = () => {
+    if (inputText.trim()) {
+      addUserMessage(inputText.trim());
+      setInputText('');
+    }
+  };
+
+  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
+    if (e.key === 'Enter') {
+      handleSend();
+    }
+  };
+
+  return (
+    <DropzoneArea>
+      <div className="flex flex-col h-full bg-background border-r border-border">
+        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
+          {messages.length === 0 ? (
+            <div className="text-center text-muted-foreground mt-10">
+              <p>Chat interface initialized.</p>
+              <p className="text-sm">Start typing or drop files here to begin.</p>
+            </div>
+          ) : (
+            messages.map((msg) => (
+              <ChatMessage key={msg.id} message={msg} />
+            ))
+          )}
+        </div>
+        <div className="p-4 border-t border-border">
+          <div className="flex items-center gap-2">
+            <input 
+              type="text" 
+              placeholder="Type a message..." 
+              aria-label="Chat message input"
+              className="flex-1 px-4 py-2 rounded-md border border-input bg-transparent shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
+              value={inputText}
+              onChange={(e) => setInputText(e.target.value)}
+              onKeyDown={handleKeyDown}
+            />
+            <button 
+              type="button"
+              aria-label="Send message"
+              className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
+              onClick={handleSend}
+              disabled={!inputText.trim()}
+            >
+              Send
+            </button>
+          </div>
+        </div>
+      </div>
+    </DropzoneArea>
+  );
+};
```

## Instructions
Please output your findings as a Markdown list of descriptions.
