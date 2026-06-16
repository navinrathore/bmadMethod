import * as pdfjsLib from 'pdfjs-dist';
import type { ParsedTransaction } from '../types';

// Initialize PDFJS Worker from static CDN
// In a Vite environment, using CDN worker prevents bundler mismatch issues.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParserResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Extracts plain text from an uploaded PDF file's ArrayBuffer.
 */
export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<ParserResult<string>> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageItems = textContent.items as Array<{ str: string; transform: number[] }>;
      
      // Sort items in logical reading order: top-to-bottom, left-to-right
      const sortedItems = [...pageItems].sort((a, b) => {
        const ax = a.transform[4];
        const ay = a.transform[5];
        const bx = b.transform[4];
        const by = b.transform[5];
        
        // If items are on the same line (approximate vertical position), sort left-to-right
        if (Math.abs(ay - by) < 5) {
          return ax - bx;
        }
        // Otherwise, sort top-to-bottom
        return by - ay;
      });

      const pageText = sortedItems.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText.trim()) {
      return { success: false, error: 'The PDF file appears to be empty or contains only scanned images without OCR.' };
    }

    return { success: true, data: fullText };
  } catch (error: unknown) {
    console.error('Error extracting text from PDF:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Normalizes date formats (DD/MM/YYYY, DD-MM-YY, DD MMM YYYY) into ISO YYYY-MM-DD
 */
function normalizeDate(dateStr: string): string | null {
  const clean = dateStr.trim().replace(/[\s-]+/g, '/');
  
  // Try DD/MM/YYYY or DD/MM/YY
  const numericParts = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (numericParts) {
    const day = numericParts[1].padStart(2, '0');
    const month = numericParts[2].padStart(2, '0');
    let year = numericParts[3];
    if (year.length === 2) {
      year = `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  // Try DD/MMM/YYYY or DD/MMM/YY (e.g. 16/Jun/2026)
  const monthNames: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  
  const mextParts = clean.split('/');
  if (mextParts.length === 3) {
    const day = mextParts[0].padStart(2, '0');
    const mName = mextParts[1].toLowerCase().substring(0, 3);
    let year = mextParts[2];
    
    if (monthNames[mName]) {
      const month = monthNames[mName];
      if (year.length === 2) {
        year = `20${year}`;
      }
      return `${year}-${month}-${day}`;
    }
  }

  // Final fallback: try standard JS parser
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Ignore
  }

  return null;
}

/**
 * Parses bank statement text lines into structured ParsedTransaction objects.
 */
export function parseBankTransactions(text: string, fileName: string): ParserResult<ParsedTransaction[]> {
  try {
    const lines = text.split('\n');
    const transactions: ParsedTransaction[] = [];
    
    // Regular expression definitions
    const dateRegexes = [
      /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/, // DD/MM/YYYY, DD-MM-YY
      /\b\d{1,2}[\s-](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s-]\d{2,4}\b/i // DD Jun 2026, DD-Jun-2026
    ];
    
    // 12-digit UPI reference or 6-digit cheque/IMPS
    const upiRegex = /\b\d{12}\b/;
    const checkRegex = /\b\d{6}\b/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // 1. Extract Date
      let matchedDateStr = '';
      for (const regex of dateRegexes) {
        const match = line.match(regex);
        if (match) {
          matchedDateStr = match[0];
          break;
        }
      }

      if (!matchedDateStr) continue; // No date found, skip this line

      const normalizedDate = normalizeDate(matchedDateStr);
      if (!normalizedDate) continue;

      // 2. Extract Amounts (Decimal values)
      // Remove commas from the line to parse easily, but keeping commas in original description
      const lineWithoutCommas = line.replace(/(\d),(\d)/g, '$1$2');
      const amounts: number[] = [];
      let amountMatch;
      
      const simpleAmountRegex = /-?\b\d+\.\d{2}\b/g;
      while ((amountMatch = simpleAmountRegex.exec(lineWithoutCommas)) !== null) {
        const val = parseFloat(amountMatch[0]);
        // Avoid matching 12-digit UPI IDs as decimals (e.g. 123456789012.00 isn't common but just in case)
        if (amountMatch[0].length < 12) {
          amounts.push(val);
        }
      }

      if (amounts.length === 0) continue; // No transaction amounts found, skip

      // In bank statements, the row typically lists transaction amount then closing balance
      // Or Debit, Credit, Balance.
      // If we have two or more amounts, let's look at the first two:
      // If the first is non-zero, let's treat it as the transaction amount.
      // If there's Debit/Credit columns, one is blank (or 0.00).
      // Let's design a robust heuristic:
      let amount = amounts[0];
      if (amounts.length >= 2) {
        // If the first one is 0.00 or matches balance, check the second one
        if (amounts[0] === 0 && amounts[1] !== 0) {
          amount = amounts[1];
        } else if (amounts.length >= 3) {
          // If Debit, Credit, Balance layout (e.g., 500.00 0.00 4500.00)
          if (amounts[0] !== 0 && amounts[1] === 0) {
            amount = -Math.abs(amounts[0]); // Debit (typically negative in our store for outflows)
          } else if (amounts[0] === 0 && amounts[1] !== 0) {
            amount = Math.abs(amounts[1]); // Credit (positive)
          } else if (amounts[0] !== 0 && amounts[1] !== 0) {
            // Check if there is text in the line indicating debit/withdrawal vs credit/deposit
            const lowerLine = line.toLowerCase();
            const isDebit = lowerLine.includes('debit') || lowerLine.includes('wd') || lowerLine.includes('dr') || lowerLine.includes('withdrawal');
            const isCredit = lowerLine.includes('credit') || lowerLine.includes('cr') || lowerLine.includes('deposit');
            if (isDebit && !isCredit) {
              amount = -Math.abs(amounts[0]);
            } else if (isCredit && !isDebit) {
              amount = Math.abs(amounts[0]);
            }
          }
        }
      }

      // If amount matches standard balance (like a huge value), let's ensure it's correct.
      // Often, debits are shown as positive numbers in statement columns.
      // Let's see if the line contains keywords for debit/credit:
      const lowerLine = line.toLowerCase();
      const isOutflow = lowerLine.includes('debit') || lowerLine.includes('dr') || lowerLine.includes('payment') || lowerLine.includes('transfer to') || lowerLine.includes('withdrawn');
      const isInflow = lowerLine.includes('credit') || lowerLine.includes('cr') || lowerLine.includes('deposit') || lowerLine.includes('received') || lowerLine.includes('refund');
      if (amount > 0 && isOutflow && !isInflow) {
        amount = -amount;
      }

      // 3. Extract Reference Number
      let reference = 'N/A';
      const upiMatch = line.match(upiRegex);
      const checkMatch = line.match(checkRegex);
      if (upiMatch) {
        reference = upiMatch[0];
      } else if (checkMatch) {
        reference = checkMatch[0];
      }

      // 4. Extract Description
      // Description is the text in the line excluding the date and amounts.
      let description = line
        .replace(matchedDateStr, '')
        .replace(upiMatch ? upiMatch[0] : '', '')
        .replace(checkMatch ? checkMatch[0] : '', '');
      
      // Remove all amount substrings from description
      const cleanAmountRegex = /-?\b\d[\d,]*\.\d{2}\b/g;
      description = description.replace(cleanAmountRegex, '');
      
      // Clean up multiple slashes or spaces, trailing/leading symbols
      description = description
        .replace(/\/+/g, '/')
        .replace(/\s+/g, ' ')
        .replace(/^[\s,./\-:]+/, '')
        .replace(/[\s,./\-:]+$/, '')
        .trim();

      if (!description) {
        description = 'Transaction';
      }

      transactions.push({
        id: `tx-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
        date: normalizedDate,
        amount,
        reference,
        description,
        fileName,
      });
    }

    if (transactions.length === 0) {
      return { success: false, error: 'Could not extract any valid transactions from the statement. Ensure it is a standard bank transaction log.' };
    }

    return { success: true, data: transactions };
  } catch (error: unknown) {
    console.error('Error parsing bank transactions:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
