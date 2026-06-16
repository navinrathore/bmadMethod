import type { ChatMessageData } from '../../store/useReconciliationStore';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageData;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isSystem = message.role === 'system';

  return (
    <div className={`flex w-full ${isSystem ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex max-w-[80%] ${isSystem ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${isSystem ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
          {isSystem ? <Bot size={18} /> : <User size={18} />}
        </div>
        <div className={`flex flex-col ${isSystem ? 'items-start' : 'items-end'}`}>
          <div className={`px-4 py-3 rounded-2xl ${
            isSystem 
              ? 'bg-muted/50 text-muted-foreground border border-border text-sm' 
              : 'bg-primary text-primary-foreground'
          }`}>
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
