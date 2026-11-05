import { BatchVerificationResultItem, Student, UploadedDocument, CourseEligibilityRule } from '../types';
import { compareMarks, evaluateAdmissionEligibility } from './validation';
import { performCrossDocIntelligence } from './crossDocIntelligence';

/**
 * Generates Batch Verification Results from students and documents
 */
export function generateBatchResults(
  students: Student[],
  documents: UploadedDocument[],
  courseRules: CourseEligibilityRule[]
): BatchVerificationResultItem[] {
  return students.map((std) => {
    const stdDocs = documents.filter((d) => d.studentId === std.id);
    const mark12 = stdDocs.find((d) => d.docType === 'marksheet_12');
    const mark10 = stdDocs.find((d) => d.docType === 'marksheet_10');
    const photo = stdDocs.find((d) => d.docType === 'photo');

    const flags: string[] = [];

    // 1. Marks comparison
    let marksMatch: BatchVerificationResultItem['marksMatch'] = 'PENDING';
    const extractedTotal = mark12?.ocrResult?.totalMarks;

    if (mark12?.ocrResult) {
      const comp = compareMarks(std.subjects, mark12.ocrResult.subjects, extractedTotal);
      if (comp.hasMismatch) {
        marksMatch = 'MISMATCH';
        flags.push(`Marks mismatch in ${comp.mismatchCount} subject(s)`);
      } else {
        marksMatch = 'MATCH';
      }
    } else {
      flags.push('12th Marksheet OCR pending or unreadable');
    }

    // 2. Photo Quality
    const photoScore = photo?.photoQuality?.score || 0;
    if (photo?.photoQuality?.isBlurry) {
      flags.push(`Photo blurry (Score: ${photoScore}/100)`);
    } else if (!photo) {
      flags.push('Passport photo missing');
    }

    // 3. Cross-Document
    const crossDoc = performCrossDocIntelligence(mark10, mark12, {
      name: std.name,
      registerNumber: std.registerNumber,
      dateOfBirth: std.dateOfBirth,
      fatherName: std.fatherName,
    });

    let crossDocStatus: BatchVerificationResultItem['crossDocStatus'] = 'MATCH';
    if (crossDoc.nameMatch === 'MINOR_DIFFERENCE') {
      crossDocStatus = 'MINOR_DIFFERENCE';
      flags.push('10th vs 12th candidate name spelling difference');
    } else if (crossDoc.nameMatch === 'MISMATCH') {
      crossDocStatus = 'MISMATCH';
      flags.push('Significant name mismatch across certificates');
    } else if (crossDoc.dobMatch === 'MISMATCH') {
      crossDocStatus = 'MISMATCH';
      flags.push('Date of birth discrepancy');
    }

    // 4. Duplicate Check
    const duplicateFlag = stdDocs.some((d) => d.isDuplicate);
    if (duplicateFlag) {
      flags.push('Duplicate file hash detected across requirements');
    }

    // 5. Outcome Categorization
    let verificationOutcome: BatchVerificationResultItem['verificationOutcome'] = 'Auto-Passed';
    if (std.status === 'Correction Required' || marksMatch === 'MISMATCH' || photo?.photoQuality?.isBlurry) {
      verificationOutcome = 'Correction Required';
    } else if (
      std.status === 'Manual Review Required' ||
      crossDocStatus !== 'MATCH' ||
      duplicateFlag ||
      !mark12
    ) {
      verificationOutcome = 'Manual Review Required';
    }

    return {
      id: `batch-${std.id}`,
      studentName: std.name,
      applicationId: std.applicationId,
      registerNumber: std.registerNumber,
      course: std.courseApplied,
      totalEnteredMarks: std.totalEnteredMarks,
      extractedTotalMarks: extractedTotal,
      marksMatch,
      photoScore,
      crossDocStatus,
      duplicateFlag,
      verificationOutcome,
      flags,
      processedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
  });
}

/**
 * Exports batch results as CSV format (compatible with Microsoft Excel, Google Sheets)
 */
export function exportBatchResultsToCsv(results: BatchVerificationResultItem[]): void {
  const headers = [
    'Application ID',
    'Candidate Name',
    '12th Register No',
    'Course Applied',
    'Entered Marks Total',
    'Extracted Marks (OCR)',
    'Marks Match Status',
    'Photo Biometric Score (100)',
    'Cross-Document Name/DOB Status',
    'Duplicate File Flag',
    'Verification Outcome',
    'System Flags & Notices',
    'Batch Processed Date',
  ];

  const escapeCsv = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = results.map((r) => [
    escapeCsv(r.applicationId),
    escapeCsv(r.studentName),
    escapeCsv(r.registerNumber),
    escapeCsv(r.course),
    escapeCsv(r.totalEnteredMarks),
    escapeCsv(r.extractedTotalMarks || 'N/A'),
    escapeCsv(r.marksMatch),
    escapeCsv(`${r.photoScore}/100`),
    escapeCsv(r.crossDocStatus),
    escapeCsv(r.duplicateFlag ? 'YES (DUPLICATE)' : 'NO'),
    escapeCsv(r.verificationOutcome),
    escapeCsv(r.flags.length > 0 ? r.flags.join('; ') : 'No Issues Detected'),
    escapeCsv(r.processedAt),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SmartAdmit_Batch_Verification_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
