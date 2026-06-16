import { useState, useEffect, useRef } from 'react';
import { useReconciliationStore } from '../../store/useReconciliationStore';
import { ChatMessage } from './ChatMessage';
import { DropzoneArea } from './DropzoneArea';
import { Bot } from 'lucide-react';

export const ChatWindow = () => {
  const [inputText, setInputText] = useState('');
  const messages = useReconciliationStore((state) => state.messages);
  const isProcessing = useReconciliationStore((state) => state.isProcessing);
  const addUserMessage = useReconciliationStore((state) => state.addUserMessage);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSend = () => {
    if (inputText.trim()) {
      addUserMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DropzoneArea>
      <div className="flex flex-col h-full bg-background border-r border-border">
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground mt-10">
              <p>Chat interface initialized.</p>
              <p className="text-sm">Start typing or drop files here to begin.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))
          )}
          
          {isProcessing && (
            <div className="flex w-full justify-start mb-4">
              <div className="flex max-w-[80%] flex-row gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  <Bot size={18} />
                </div>
                <div className="flex flex-col items-start">
                  <div className="px-4 py-3 rounded-2xl bg-muted/30 text-muted-foreground border border-border text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <span className="ml-1.5 text-xs font-medium">Processing files securely...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Type a message..." 
              aria-label="Chat message input"
              className="flex-1 px-4 py-2 rounded-md border border-input bg-transparent shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              type="button"
              aria-label="Send message"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
              onClick={handleSend}
              disabled={!inputText.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </DropzoneArea>
  );
};
