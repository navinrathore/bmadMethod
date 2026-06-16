import type { ParsedChatMessage } from '../types';

export interface ParserResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Parses raw chat or SMS logs text into ParsedChatMessage objects.
 * Supports standard WhatsApp export formats and generic SMS logs.
 * Handles multi-line chat message continuations.
 */
export function parseChatLogs(text: string, fileName: string): ParserResult<ParsedChatMessage[]> {
  try {
    const lines = text.split('\n');
    const messages: ParsedChatMessage[] = [];
    
    // Regex Patterns for WhatsApp
    // Format A: [16/06/26, 08:30:15] Sender Name: Message body
    const whatsappRegexA = /^\[(\d{1,2})[/-](\d{1,2})[/-](\d{2,4}),\s+(\d{1,2}):(\d{2}):?(\d{2})?\]\s+([^:]+):\s+(.*)$/;
    
    // Format B: 16/06/26, 08:30 - Sender Name: Message body
    const whatsappRegexB = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4}),\s+(\d{1,2}):(\d{2})(?::\d{2})?\s+-\s+([^:]+):\s+(.*)$/;

    // Generic SMS log formats:
    // Format C: Date: 2026-06-16 Sender: MD-HDFCBK Body: UPI-transfer...
    const smsRegexA = /(?:date|time):\s*([^\s]+)\s+sender:\s*([^\s]+)\s+(?:body|msg|message):\s*(.*)/i;
    // Format D: Sender: MD-HDFCBK Msg: Your account ...
    const smsRegexB = /^sender:\s*([^\s]+)\s+(?:body|msg|message):\s*(.*)/i;

    let currentMsg: ParsedChatMessage | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const matchA = line.match(whatsappRegexA);
      const matchB = line.match(whatsappRegexB);
      const matchSMSA = line.match(smsRegexA);
      const matchSMSB = line.match(smsRegexB);

      if (matchA) {
        // Format A matched
        const [, day, month, year, hours, minutes, seconds, sender, body] = matchA;
        const normalizedYear = year.length === 2 ? `20${year}` : year;
        const normalizedSeconds = seconds || '00';
        const timestamp = new Date(
          parseInt(normalizedYear),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(normalizedSeconds)
        ).toISOString();

        currentMsg = {
          id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp,
          sender: sender.trim(),
          body: body.trim(),
          fileName,
        };
        messages.push(currentMsg);
      } else if (matchB) {
        // Format B matched
        const [, day, month, year, hours, minutes, sender, body] = matchB;
        const normalizedYear = year.length === 2 ? `20${year}` : year;
        const timestamp = new Date(
          parseInt(normalizedYear),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          0
        ).toISOString();

        currentMsg = {
          id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp,
          sender: sender.trim(),
          body: body.trim(),
          fileName,
        };
        messages.push(currentMsg);
      } else if (matchSMSA) {
        // SMS format C matched
        const [, dateStr, sender, body] = matchSMSA;
        let timestamp = new Date().toISOString(); // Default fallback
        try {
          const parsedD = new Date(dateStr);
          if (!isNaN(parsedD.getTime())) {
            timestamp = parsedD.toISOString();
          }
        } catch {
          // Ignore invalid date
        }

        currentMsg = {
          id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp,
          sender: sender.trim(),
          body: body.trim(),
          fileName,
        };
        messages.push(currentMsg);
      } else if (matchSMSB) {
        // SMS format D matched
        const [, sender, body] = matchSMSB;
        const timestamp = new Date().toISOString(); // Current time fallback

        currentMsg = {
          id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp,
          sender: sender.trim(),
          body: body.trim(),
          fileName,
        };
        messages.push(currentMsg);
      } else {
        // It does not match any primary message start pattern.
        // If we are parsing a WhatsApp export, it could be a multi-line continuation of the previous message.
        if (currentMsg) {
          currentMsg.body += '\n' + line;
        } else {
          // If there is no active previous message, try a simple regex match for lines like:
          // Sender: Message (without dates)
          const simpleColonMatch = line.match(/^([^:]+):\s*(.*)$/);
          if (simpleColonMatch && simpleColonMatch[1].length < 30) {
            currentMsg = {
              id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
              timestamp: new Date().toISOString(),
              sender: simpleColonMatch[1].trim(),
              body: simpleColonMatch[2].trim(),
              fileName,
            };
            messages.push(currentMsg);
          } else {
            // Ignore completely detached text lines if they can't be parsed
          }
        }
      }
    }

    if (messages.length === 0) {
      return { success: false, error: 'Could not extract any valid chat messages or SMS logs. Ensure the format matches WhatsApp export or standard SMS logs.' };
    }

    return { success: true, data: messages };
  } catch (error: unknown) {
    console.error('Error parsing chat logs:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
