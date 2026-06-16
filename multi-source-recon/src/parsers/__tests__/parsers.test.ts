import { describe, it, expect } from 'vitest';

// Polyfill minimal browser globals for pdfjs-dist in Node environment
if (typeof globalThis.DOMMatrix === 'undefined') {
  Object.defineProperty(globalThis, 'DOMMatrix', {
    value: class DOMMatrix {},
    writable: true,
    configurable: true
  });
}

const { parseBankTransactions } = await import('../pdf-extractor');
import { parseChatLogs } from '../chat-extractor';

describe('Bank Statement Regex Parser', () => {
  it('should parse standard numeric dates and positive/negative amounts', () => {
    const sampleText = `
      16/06/2026 UPI/123456789012/Transfer to Friend/Ref123456 -500.00 4500.00
      17-06-2026 UPI/987654321098/Refund received 1,250.00 5750.00
    `;
    const result = parseBankTransactions(sampleText, 'statement.pdf');
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.length).toBe(2);

    const tx1 = result.data![0];
    expect(tx1.date).toBe('2026-06-16');
    expect(tx1.amount).toBe(-500.00);
    expect(tx1.reference).toBe('123456789012');
    expect(tx1.description).toContain('UPI/Transfer to Friend/Ref123456');

    const tx2 = result.data![1];
    expect(tx2.date).toBe('2026-06-17');
    expect(tx2.amount).toBe(1250.00);
    expect(tx2.reference).toBe('987654321098');
    expect(tx2.description).toContain('UPI/Refund received');
  });

  it('should parse text dates (DD-MMM-YYYY) and recognize Debit/Credit columns', () => {
    const sampleText = `
      16-Jun-2026 WITHDRAWAL IMPS/654321 300.00 0.00 4200.00
      18 Jun 2026 INTEREST DEPOSIT 0.00 15.50 4215.50
    `;
    const result = parseBankTransactions(sampleText, 'statement.pdf');
    expect(result.success).toBe(true);
    expect(result.data!.length).toBe(2);

    const tx1 = result.data![0];
    expect(tx1.date).toBe('2026-06-16');
    expect(tx1.amount).toBe(-300.00); // inferred negative since it is a withdrawal/debit
    expect(tx1.reference).toBe('654321');

    const tx2 = result.data![1];
    expect(tx2.date).toBe('2026-06-18');
    expect(tx2.amount).toBe(15.50); // credit
  });
});

describe('Chat and SMS Log Parser', () => {
  it('should parse standard WhatsApp format A', () => {
    const sampleText = `
      [16/06/26, 08:30:15] Navin: Hey, did you receive the transfer?
      [16/06/26, 08:31:00] Winston: Yes, received 500 INR. Thanks!
    `;
    const result = parseChatLogs(sampleText, 'chat.txt');
    expect(result.success).toBe(true);
    expect(result.data!.length).toBe(2);

    const msg1 = result.data![0];
    expect(msg1.sender).toBe('Navin');
    expect(msg1.body).toBe('Hey, did you receive the transfer?');
    expect(msg1.timestamp).toBeDefined();

    const msg2 = result.data![1];
    expect(msg2.sender).toBe('Winston');
    expect(msg2.body).toBe('Yes, received 500 INR. Thanks!');
  });

  it('should parse WhatsApp format B', () => {
    const sampleText = `
      16/06/26, 08:30 - Navin: Sent the money.
      16/06/26, 08:32 - Winston: Got it!
    `;
    const result = parseChatLogs(sampleText, 'chat.txt');
    expect(result.success).toBe(true);
    expect(result.data!.length).toBe(2);
    expect(result.data![0].sender).toBe('Navin');
    expect(result.data![0].body).toBe('Sent the money.');
  });

  it('should support multi-line chat message continuations', () => {
    const sampleText = `
      [16/06/26, 08:30:15] Navin: Hey there.
      I just sent the amount.
      Let me know if it cleared.
      [16/06/26, 08:31:00] Winston: Let me check.
    `;
    const result = parseChatLogs(sampleText, 'chat.txt');
    expect(result.success).toBe(true);
    expect(result.data!.length).toBe(2);

    const msg1 = result.data![0];
    expect(msg1.sender).toBe('Navin');
    expect(msg1.body).toBe('Hey there.\nI just sent the amount.\nLet me know if it cleared.');
  });
});
