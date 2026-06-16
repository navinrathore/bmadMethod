export interface ParsedTransaction {
  id: string;
  date: string;       // YYYY-MM-DD
  amount: number;     // parsed transaction amount (positive/negative)
  reference: string;  // transaction ref/UPI ID
  description: string;
  fileName: string;
}

export interface ParsedChatMessage {
  id: string;
  timestamp: string;  // ISO date string
  sender: string;     // Sender's name/number
  body: string;       // Text content
  fileName: string;
}
