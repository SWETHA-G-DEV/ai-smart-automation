import Tesseract from 'tesseract.js';
import { OcrResult } from '../types';

export interface OcrProgressCallback {
  (progress: { status: string; progress: number }): void;
}

/**
 * Extracts text and parses marksheet data using Tesseract.js OCR.
 * Rule: Never invent marks when text extraction fails.
 */
export async function extractMarksheetData(
  imageSource: string | File,
  onProgress?: OcrProgressCallback
): Promise<OcrResult> {
  try {
    const result = await Tesseract.recognize(
      imageSource,
      'eng',
      {
        logger: (m) => {
          if (onProgress && m.status) {
            onProgress({
              status: m.status,
              progress: Math.round((m.progress || 0) * 100),
            });
          }
        },
      }
    );

    const rawText = result.data.text || '';
    const confidence = Math.round(result.data.confidence || 0);

    const parsed = parseMarksheetText(rawText, confidence);
    return parsed;
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    return {
      rawText: '',
      confidence: 0,
      subjects: [],
      warnings: [
        'OCR engine could not read the document image. Please verify file format or lighting, and manually fill marks below.',
      ],
    };
  }
}

/**
 * Parses raw text extracted from a State Board or CBSE Marksheet.
 * Uses rigorous regex matching without fabricating data.
 */
export function parseMarksheetText(rawText: string, confidence: number): OcrResult {
  const warnings: string[] = [];
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  let extractedName: string | undefined;
  let extractedRegisterNo: string | undefined;
  const subjects: Array<{ name: string; marks: number; maxMarks: number }> = [];
  let totalMarks: number | undefined;
  let percentage: number | undefined;

  // 1. Extract Name
  // Common marksheet patterns: "NAME : KAVITHA R", "CANDIDATE NAME : RAHUL S", "STUDENT NAME: JOHN"
  const namePatterns = [
    /(?:NAME(?:\s+OF\s+THE\s+CANDIDATE|\s+OF\s+CANDIDATE|\s+OF\s+STUDENT)?|CANDIDATE\s+NAME|STUDENT\s+NAME)\s*[:\-.]?\s*([A-Z\s.]{3,35})/i,
    /NAME\s*:\s*([A-Z\s.]{3,35})/i,
  ];

  for (const line of lines) {
    for (const pattern of namePatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].replace(/[:\-]/g, '').trim();
        // filter out keywords if false positive
        if (!candidate.match(/DEPARTMENT|GOVERNMENT|BOARD|EXAMINATION|HIGHER|SECONDARY|CERTIFICATE/i)) {
          extractedName = candidate;
          break;
        }
      }
    }
    if (extractedName) break;
  }

  // 2. Extract Register / Roll Number
  // Common patterns: "REG NO : 1245890", "ROLL NO : 2309123", "REGISTRATION NO: 7112024"
  const regPatterns = [
    /(?:REG(?:N|\.|\s*NO|ISTER\s*NO|ISTRATION\s*NO)?|ROLL\s*(?:NO|\.)?|CERTIFICATE\s*NO)\s*[:\-.]?\s*([A-Z0-9\/\-]{5,18})/i,
  ];

  for (const line of lines) {
    for (const pattern of regPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].trim();
        if (/\d/.test(candidate) && candidate.length >= 5) {
          extractedRegisterNo = candidate;
          break;
        }
      }
    }
    if (extractedRegisterNo) break;
  }

  // 3. Extract Subjects and Marks
  // Known school & higher secondary subjects
  const standardSubjects = [
    { label: 'Language / Tamil', regex: /\b(TAMIL|HINDI|FRENCH|GERMAN|SANSKRIT|REGIONAL\s*LANG|FIRST\s*LANGUAGE)\b/i },
    { label: 'English', regex: /\b(ENGLISH|COMMUNICATIVE\s*ENGLISH|GENERAL\s*ENGLISH)\b/i },
    { label: 'Mathematics', regex: /\b(MATHEMATICS|MATHS|APPLIED\s*MATHS|BUSINESS\s*MATHS)\b/i },
    { label: 'Physics', regex: /\b(PHYSICS)\b/i },
    { label: 'Chemistry', regex: /\b(CHEMISTRY)\b/i },
    { label: 'Computer Science', regex: /\b(COMPUTER\s*SCIENCE|INFORMATICS|COMP\s*SCI|CS)\b/i },
    { label: 'Biology', regex: /\b(BIOLOGY|BIO-BOTANY|BIO-ZOOLOGY)\b/i },
    { label: 'Science', regex: /\b(SCIENCE|GENERAL\s*SCIENCE)\b/i },
    { label: 'Social Science', regex: /\b(SOCIAL\s*SCIENCE|SOCIAL\s*STUDIES)\b/i },
    { label: 'Commerce', regex: /\b(COMMERCE)\b/i },
    { label: 'Accountancy', regex: /\b(ACCOUNTANCY|ACCOUNTS)\b/i },
    { label: 'Economics', regex: /\b(ECONOMICS)\b/i },
  ];

  // Search line by line for subject and adjacent marks
  for (const line of lines) {
    for (const sub of standardSubjects) {
      if (sub.regex.test(line)) {
        // Look for marks numbers (0-100 or 0-200)
        // E.g. "PHYSICS 091 100 PASS" or "MATHEMATICS : 95 / 100"
        const numbers = line.match(/\b\d{2,3}\b/g);
        if (numbers && numbers.length > 0) {
          // find the first plausible mark <= 100 (or first number)
          const validNum = numbers.map(Number).find((n) => n <= 100 && n >= 20);
          if (validNum !== undefined) {
            // Avoid adding duplicates
            if (!subjects.some((s) => s.name === sub.label)) {
              subjects.push({
                name: sub.label,
                marks: validNum,
                maxMarks: 100,
              });
            }
          }
        }
      }
    }
  }

  // 4. Extract Total Marks & Percentage
  const totalPatterns = [
    /(?:TOTAL|GRAND\s*TOTAL|AGGREGATE)\s*(?:MARKS)?\s*[:\-.]?\s*(\d{3,4})(?:\s*\/\s*(\d{3,4}))?/i,
  ];

  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const val = Number(match[1]);
        if (val > 100 && val <= 1200) {
          totalMarks = val;
          const max = match[2] ? Number(match[2]) : 600;
          percentage = Number(((val / max) * 100).toFixed(2));
          break;
        }
      }
    }
    if (totalMarks) break;
  }

  // If no explicit total found, sum up detected subjects if at least 3 found
  if (!totalMarks && subjects.length >= 3) {
    const sum = subjects.reduce((acc, curr) => acc + curr.marks, 0);
    const max = subjects.length * 100;
    totalMarks = sum;
    percentage = Number(((sum / max) * 100).toFixed(2));
  }

  // Warnings generation
  if (confidence < 60) {
    warnings.push(
      `Low OCR confidence (${confidence}%). Text clarity is diminished; please cross-check all extracted numbers carefully.`
    );
  }
  if (!extractedName) {
    warnings.push('Student name could not be definitively recognized from marksheet text.');
  }
  if (!extractedRegisterNo) {
    warnings.push('Register / Roll number was not automatically located on this marksheet.');
  }
  if (subjects.length === 0) {
    warnings.push(
      'No individual subject marks could be confidently extracted. Please review the image or manually enter marks.'
    );
  } else if (subjects.length < 5) {
    warnings.push(`Extracted ${subjects.length} subject(s). Some subjects may require manual verification.`);
  }

  return {
    rawText,
    confidence,
    extractedName,
    extractedRegisterNo,
    subjects,
    totalMarks,
    percentage,
    warnings,
  };
}
