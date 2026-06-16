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
    if (!isDraggingOver) {
      setIsDraggingOver(true);
    }
  }, [isDraggingOver]);

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

    const files = Array.from(e.dataTransfer.files);
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

      addFile(file);
      addSystemMessage(`File received: ${file.name}. Ready for local parsing.`);
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
