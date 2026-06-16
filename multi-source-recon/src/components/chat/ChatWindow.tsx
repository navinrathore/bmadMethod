import { useState, useEffect, useRef } from 'react';
import { useReconciliationStore } from '../../store/useReconciliationStore';
import { ChatMessage } from './ChatMessage';
import { DropzoneArea } from './DropzoneArea';

export const ChatWindow = () => {
  const [inputText, setInputText] = useState('');
  const messages = useReconciliationStore((state) => state.messages);
  const addUserMessage = useReconciliationStore((state) => state.addUserMessage);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
