import Tesseract from "tesseract.js";

export interface OCRResult {
  text: string;
  confidence: number;
  extractedData: {
    total?: number;
    merchant?: string;
    date?: string;
    lineItems?: Array<{ description: string; amount: number }>;
  };
}

export interface OCRProvider {
  processImage(imagePath: string): Promise<OCRResult>;
}

/**
 * Tesseract.js OCR implementation (free, runs locally).
 * Works well for clear receipts but may struggle with low quality images.
 */
export class TesseractOCR implements OCRProvider {
  async processImage(imagePath: string): Promise<OCRResult> {
    console.log(`[OCR] Processing image: ${imagePath}`);

    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const text = result.data.text;
    const confidence = result.data.confidence / 100;

    console.log(`[OCR] Complete. Confidence: ${(confidence * 100).toFixed(1)}%`);

    return {
      text,
      confidence,
      extractedData: this.parseReceiptText(text),
    };
  }

  private parseReceiptText(text: string): OCRResult["extractedData"] {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // Extract total (look for TOTAL, AMOUNT DUE, etc.)
    let total: number | undefined;
    const totalPatterns = [
      /total[:\s]*\$?([\d,]+\.?\d*)/i,
      /amount\s*due[:\s]*\$?([\d,]+\.?\d*)/i,
      /grand\s*total[:\s]*\$?([\d,]+\.?\d*)/i,
      /balance[:\s]*\$?([\d,]+\.?\d*)/i,
      /subtotal[:\s]*\$?([\d,]+\.?\d*)/i,
      /payment[:\s]*\$?([\d,]+\.?\d*)/i,
    ];

    // Search from bottom up (totals usually at bottom)
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      for (const pattern of totalPatterns) {
        const match = line.match(pattern);
        if (match) {
          const parsed = parseFloat(match[1].replace(",", ""));
          if (!isNaN(parsed) && parsed > 0) {
            total = parsed;
            break;
          }
        }
      }
      if (total) break;
    }

    // If no labeled total found, look for the largest dollar amount
    if (!total) {
      const amounts: number[] = [];
      const dollarPattern = /\$?([\d,]+\.\d{2})/g;
      let match;
      while ((match = dollarPattern.exec(text)) !== null) {
        const parsed = parseFloat(match[1].replace(",", ""));
        if (!isNaN(parsed) && parsed > 0) {
          amounts.push(parsed);
        }
      }
      if (amounts.length > 0) {
        total = Math.max(...amounts);
      }
    }

    // Extract merchant (usually first non-empty line or prominent text)
    let merchant: string | undefined;
    for (const line of lines.slice(0, 5)) {
      // Check first 5 lines
      // Skip lines that look like addresses, dates, or numbers
      if (
        line.length > 2 &&
        !/^\d+$/.test(line) &&
        !/^\d{1,2}[\/\-]\d{1,2}/.test(line) &&
        !/^[#\*]/.test(line)
      ) {
        merchant = line.replace(/[^\w\s&'-]/g, "").trim();
        if (merchant.length > 1) break;
      }
    }

    // Extract date
    let date: string | undefined;
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/, // MM/DD/YYYY or M/D/YY
      /(\d{1,2}-\d{1,2}-\d{2,4})/, // MM-DD-YYYY
      /(\d{4}-\d{2}-\d{2})/, // YYYY-MM-DD (ISO)
      /(\w{3}\s+\d{1,2},?\s+\d{4})/i, // Jan 15, 2024
      /(\d{1,2}\s+\w{3}\s+\d{4})/i, // 15 Jan 2024
    ];

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          date = match[1];
          break;
        }
      }
      if (date) break;
    }

    // Try to parse and normalize date to YYYY-MM-DD
    if (date) {
      try {
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
          date = parsed.toISOString().split("T")[0];
        }
      } catch {
        // Keep original format if parsing fails
      }
    }

    return { total, merchant, date };
  }
}

/**
 * Placeholder for future AI-powered OCR (Claude Vision, GPT-4V, etc.).
 * Provides better accuracy for complex receipts but requires API key.
 */
export class AIVisionOCR implements OCRProvider {
  constructor(private apiKey: string, private provider: "claude" | "openai" = "claude") {
    // Future implementation
  }

  async processImage(imagePath: string): Promise<OCRResult> {
    // For now, fall back to Tesseract
    // TODO: Implement Claude Vision or GPT-4V API calls
    console.log(`[OCR] AI Vision not yet implemented, falling back to Tesseract`);
    const fallback = new TesseractOCR();
    return fallback.processImage(imagePath);
  }
}

/**
 * Factory function to get the configured OCR provider.
 * Defaults to Tesseract (free), can be upgraded via environment variables.
 */
export function getOCRProvider(): OCRProvider {
  const provider = process.env.OCR_PROVIDER;
  const apiKey = process.env.OCR_API_KEY;

  if (provider === "ai" && apiKey) {
    const aiProvider = (process.env.OCR_AI_PROVIDER as "claude" | "openai") || "claude";
    return new AIVisionOCR(apiKey, aiProvider);
  }

  return new TesseractOCR();
}
