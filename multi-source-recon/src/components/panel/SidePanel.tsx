import { UploadCloud, FileText, TrendingDown, TrendingUp, MessageSquare, ShieldCheck } from 'lucide-react';
import { useReconciliationStore } from '../../store/useReconciliationStore';

export const SidePanel: React.FC = () => {
  const { parsedTransactions, parsedMessages, isProcessing } = useReconciliationStore();

  if (isProcessing) {
    return (
      <div className="flex flex-col h-full bg-secondary/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary animate-pulse" />
            <h2 className="text-lg font-semibold text-foreground">In-Memory Parsing...</h2>
          </div>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium animate-pulse">
            Local Only
          </span>
        </div>
        
        {/* Skeleton Rows */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className="p-4 bg-background/50 rounded-lg border border-border flex flex-col gap-2 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If there's parsed data, show a preview
  const hasTransactions = parsedTransactions.length > 0;
  const hasMessages = parsedMessages.length > 0;

  if (hasTransactions || hasMessages) {
    return (
      <div className="flex flex-col h-full bg-secondary/10 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-foreground">Secure Local Workspace</h2>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full font-medium">
            Ephemerally Loaded
          </span>
        </div>

        {hasTransactions && (
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Parsed Transactions ({parsedTransactions.length})</span>
            </div>
            <div className="flex flex-col gap-2">
              {parsedTransactions.map((tx) => {
                const isOutflow = tx.amount < 0;
                return (
                  <div key={tx.id} className="p-3 bg-background rounded-lg border border-border flex justify-between gap-3 shadow-sm hover:border-primary/50 transition-colors">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground truncate" title={tx.description}>
                        {tx.description}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Ref: {tx.reference}
                      </span>
                      <span className="text-[10px] text-muted-foreground/80 mt-1 font-mono">
                        {tx.date} • {tx.fileName}
                      </span>
                    </div>
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <div className={`flex items-center gap-1 text-sm font-semibold ${isOutflow ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isOutflow ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                        <span>{isOutflow ? '' : '+'}{tx.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {hasMessages && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Parsed Messages ({parsedMessages.length})</span>
            </div>
            <div className="flex flex-col gap-2">
              {parsedMessages.map((msg) => (
                <div key={msg.id} className="p-3 bg-background rounded-lg border border-border flex flex-col gap-1 shadow-sm hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-primary">
                      {msg.sender}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                    {msg.body}
                  </p>
                  <span className="text-[9px] text-muted-foreground/75 mt-1 font-mono">
                    File: {msg.fileName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

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
          className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md border border-border transition-colors cursor-not-allowed opacity-50"
          disabled
          aria-disabled="true"
          title="Upload via explorer is not implemented yet. Please use drag-and-drop ingestion in the chat window."
        >
          Upload Files
        </button>
      </div>
    </div>
  );
};
