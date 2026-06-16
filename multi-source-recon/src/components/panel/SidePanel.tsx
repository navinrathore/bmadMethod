import { UploadCloud } from 'lucide-react';

export const SidePanel: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-secondary/30 p-6 items-center justify-center text-center">
      <div className="bg-background p-6 rounded-lg shadow-sm border border-border flex flex-col items-center max-w-sm">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop files into the chat area or upload documents to start analyzing your financial data.
        </p>
        <button 
          className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 border border-border transition-colors"
          disabled
        >
          Upload Files
        </button>
      </div>
    </div>
  );
};
