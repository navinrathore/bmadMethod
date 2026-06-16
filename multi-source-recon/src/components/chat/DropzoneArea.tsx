import { useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { useReconciliationStore } from '../../store/useReconciliationStore';

interface DropzoneAreaProps {
  children: React.ReactNode;
}

export const DropzoneArea = ({ children }: DropzoneAreaProps) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const addFile = useReconciliationStore((state) => state.addFile);
  const addSystemMessage = useReconciliationStore((state) => state.addSystemMessage);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent flickering when dragging over children
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer?.files ?? []);
    if (files.length === 0) return;

    const MAX_FILE_SIZE_MB = 50;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    files.forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const isPdf = file.type === 'application/pdf' || ext === 'pdf';
      const isTxt = file.type === 'text/plain' || ext === 'txt';

      if (!isPdf && !isTxt) {
        addSystemMessage(`Warning: Unsupported file format (${file.name}). Only .pdf and .txt are allowed.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        addSystemMessage(`Error: ${file.name} exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`);
        return;
      }

      // Check if file is already added in state to prevent duplicates
      const isAlreadyAdded = useReconciliationStore.getState().files.some(
        (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
      );

      if (isAlreadyAdded) {
        addSystemMessage(`Info: ${file.name} is already uploaded.`);
        return;
      }

      addFile(file);
      
      const store = useReconciliationStore.getState();
      store.setIsProcessing(true);
      store.addSystemMessage(`Processing ${file.name}...`);

      const reader = new FileReader();
      if (isPdf) {
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const { extractTextFromPDF, parseBankTransactions } = await import('../../parsers/pdf-extractor');
            
            const extractResult = await extractTextFromPDF(arrayBuffer);
            if (!extractResult.success || !extractResult.data) {
              store.addSystemMessage(`Error: Failed to parse ${file.name}. Reason: ${extractResult.error}`);
              return;
            }
            
            const parseResult = parseBankTransactions(extractResult.data, file.name);
            if (!parseResult.success || !parseResult.data) {
              store.addSystemMessage(`Error: Failed to parse ${file.name}. Reason: ${parseResult.error}`);
              return;
            }
            
            const currentTxList = store.parsedTransactions;
            store.setParsedTransactions([...currentTxList, ...parseResult.data]);
            store.addSystemMessage(`Success: Extracted ${parseResult.data.length} transactions from ${file.name}`);
          } catch (err: unknown) {
            store.addSystemMessage(`Error: Failed to parse ${file.name}. Reason: ${err instanceof Error ? err.message : String(err)}`);
          } finally {
            store.setIsProcessing(false);
          }
        };
        reader.onerror = () => {
          store.addSystemMessage(`Error: Failed to read ${file.name}`);
          store.setIsProcessing(false);
        };
        reader.readAsArrayBuffer(file);
      } else if (isTxt) {
        reader.onload = async (event) => {
          try {
            const textContent = event.target?.result as string;
            const { parseChatLogs } = await import('../../parsers/chat-extractor');
            
            const parseResult = parseChatLogs(textContent, file.name);
            if (!parseResult.success || !parseResult.data) {
              store.addSystemMessage(`Error: Failed to parse ${file.name}. Reason: ${parseResult.error}`);
              return;
            }
            
            const currentMsgList = store.parsedMessages;
            store.setParsedMessages([...currentMsgList, ...parseResult.data]);
            store.addSystemMessage(`Success: Extracted ${parseResult.data.length} messages from ${file.name}`);
          } catch (err: unknown) {
            store.addSystemMessage(`Error: Failed to parse ${file.name}. Reason: ${err instanceof Error ? err.message : String(err)}`);
          } finally {
            store.setIsProcessing(false);
          }
        };
        reader.onerror = () => {
          store.addSystemMessage(`Error: Failed to read ${file.name}`);
          store.setIsProcessing(false);
        };
        reader.readAsText(file);
      }
    });
  }, [addFile, addSystemMessage]);

  return (
    <div 
      className="relative w-full h-full flex flex-col"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm m-4 rounded-xl border-2 border-dashed border-primary transition-all duration-200">
          <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Drop files here</h3>
            <p className="text-sm text-muted-foreground">
              Securely ingest .pdf or .txt documents
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
