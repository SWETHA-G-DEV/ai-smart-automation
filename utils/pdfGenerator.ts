import jsPDF from 'jspdf';
import { Student, UploadedDocument } from '../types';
import { compareMarks, evaluateAdmissionEligibility } from './validation';
import { CourseEligibilityRule } from '../types';

export function generateVerificationPdfReport(
  student: Student,
  documents: UploadedDocument[],
  rules: CourseEligibilityRule[],
  verifiedBy: string = 'College Admission Cell (SmartAdmit AI System)'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const mark12Doc = documents.find((d) => d.docType === 'marksheet_12');
  const photoDoc = documents.find((d) => d.docType === 'photo');
  const comparison = compareMarks(
    student.subjects,
    mark12Doc?.ocrResult?.subjects,
    mark12Doc?.ocrResult?.totalMarks
  );
  const eligibility = evaluateAdmissionEligibility(student, rules);

  let y = 15;

  // 1. Header Banner
  doc.setFillColor(30, 58, 138); // Dark Navy Blue
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SMARTADMIT AI – ADMISSION VERIFICATION DOSSIER', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Official Automated Document Verification & Eligibility Audit Report', 14, 18);
  doc.text(`Generated On: ${new Date().toLocaleString()} | Verified by: ${verifiedBy}`, 14, 23);

  y = 35;

  // 2. Student Information Section
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 28, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, pageWidth - 28, 28, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Candidate: ${student.name.toUpperCase()}`, 18, y + 7);
  doc.text(`Application ID: ${student.applicationId}`, 115, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Course Applied: ${student.courseApplied}`, 18, y + 14);
  doc.text(`12th Register No: ${student.registerNumber}`, 115, y + 14);

  doc.text(`Quota: ${student.quota} | Board: ${student.boardName}`, 18, y + 21);
  doc.text(`Status: ${student.status.toUpperCase()}`, 115, y + 21);

  y += 34;

  // 3. Document Checklist & Hash Integrity Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('1. DOCUMENT CHECKLIST & INTEGRITY AUDIT', 14, y);
  y += 5;

  // Table header
  doc.setFillColor(226, 232, 240);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('DOCUMENT TYPE', 16, y + 5);
  doc.text('FILE NAME', 65, y + 5);
  doc.text('SHA-256 INTEGRITY HASH', 115, y + 5);
  doc.text('STATUS', 170, y + 5);
  y += 7;

  const docTypes = [
    { type: 'marksheet_10', title: '10th Marksheet' },
    { type: 'marksheet_12', title: '12th Marksheet (+2)' },
    { type: 'transfer_certificate', title: 'Transfer Certificate (TC)' },
    { type: 'community_certificate', title: 'Community Certificate' },
    { type: 'photo', title: 'Passport Photograph' },
  ];

  doc.setFont('helvetica', 'normal');
  for (const item of docTypes) {
    const uploaded = documents.find((d) => d.docType === item.type);
    const isUploaded = !!uploaded;
    const isDuplicate = uploaded?.isDuplicate;
    const statusText = !isUploaded
      ? 'MISSING'
      : isDuplicate
      ? 'DUPLICATE WARNING'
      : uploaded.verificationStatus.toUpperCase();

    doc.rect(14, y, pageWidth - 28, 6, 'S');
    doc.text(item.title, 16, y + 4.5);
    doc.text(uploaded ? uploaded.fileName.substring(0, 24) : 'Not Uploaded', 65, y + 4.5);
    doc.text(uploaded ? uploaded.fileHash.substring(0, 22) + '...' : 'N/A', 115, y + 4.5);

    if (statusText === 'VALID' || statusText === 'PENDING') {
      doc.setTextColor(21, 128, 61); // Green
    } else if (statusText === 'MISSING') {
      doc.setTextColor(220, 38, 38); // Red
    } else {
      doc.setTextColor(217, 119, 6); // Amber
    }
    doc.text(statusText, 170, y + 4.5);
    doc.setTextColor(51, 65, 85);
    y += 6;
  }

  y += 6;

  // 4. Marksheet Verification & Comparison Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('2. MARKS COMPARISON (STUDENT CLAIMED vs OCR EXTRACTED)', 14, y);
  y += 5;

  doc.setFillColor(226, 232, 240);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('SUBJECT', 16, y + 5);
  doc.text('ENTERED MARK', 65, y + 5);
  doc.text('OCR EXTRACTED MARK', 110, y + 5);
  doc.text('MATCH RESULT', 160, y + 5);
  y += 7;

  doc.setFont('helvetica', 'normal');
  for (const comp of comparison.subjectComparisons) {
    doc.rect(14, y, pageWidth - 28, 6, 'S');
    doc.text(comp.name, 16, y + 4.5);
    doc.text(`${comp.enteredMarks} / 100`, 65, y + 4.5);
    doc.text(comp.extractedMarks !== undefined ? `${comp.extractedMarks} / 100` : 'Not Detected', 110, y + 4.5);

    if (comp.status === 'MATCH') {
      doc.setTextColor(21, 128, 61);
      doc.text('MATCH (VERIFIED)', 160, y + 4.5);
    } else if (comp.status === 'MISMATCH') {
      doc.setTextColor(220, 38, 38);
      doc.text(`MISMATCH (${comp.difference! > 0 ? '+' : ''}${comp.difference})`, 160, y + 4.5);
    } else {
      doc.setTextColor(217, 119, 6);
      doc.text('MANUAL REVIEW', 160, y + 4.5);
    }
    doc.setTextColor(51, 65, 85);
    y += 6;
  }

  // Summary Row
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL / PERCENTAGE', 16, y + 5);
  doc.text(`${comparison.totalEntered} (${comparison.percentageEntered}%)`, 65, y + 5);
  doc.text(
    comparison.totalExtracted ? `${comparison.totalExtracted} (${comparison.percentageExtracted}%)` : 'Not Detected',
    110,
    y + 5
  );
  if (comparison.totalStatus === 'MATCH') {
    doc.setTextColor(21, 128, 61);
    doc.text('MATCHED', 160, y + 5);
  } else if (comparison.totalStatus === 'MISMATCH') {
    doc.setTextColor(220, 38, 38);
    doc.text('MISMATCH DETECTED', 160, y + 5);
  } else {
    doc.setTextColor(217, 119, 6);
    doc.text('PENDING REVIEW', 160, y + 5);
  }
  doc.setTextColor(51, 65, 85);
  y += 12;

  // 5. Photo Quality Audit & Eligibility Decision
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('3. PHOTO QUALITY & ADMISSION ELIGIBILITY SUMMARY', 14, y);
  y += 5;

  const q = photoDoc?.photoQuality;
  const photoText = q
    ? `Quality Score: ${q.score}/100 | Sharpness: ${q.blurScore}/100 | Brightness: ${q.brightness}% | Res: ${q.resolution.width}x${q.resolution.height}px | ${q.isBlurry ? 'BLUR WARNING' : 'Clear Focus'}`
    : 'Photograph not uploaded or quality check pending.';

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 26, 'F');
  doc.rect(14, y, pageWidth - 28, 26, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Photo Biometric Compliance:', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(photoText, 18, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.text('Course Eligibility Assessment:', 18, y + 17);
  doc.setFont('helvetica', 'normal');
  const eligColor = eligibility.status === 'Eligible' ? [21, 128, 61] : [220, 38, 38];
  doc.setTextColor(eligColor[0], eligColor[1], eligColor[2]);
  doc.text(`Status: ${eligibility.status} (Engineering Cut-off: ${eligibility.score} / 200)`, 18, y + 22);

  y += 32;

  // 6. Regulatory Disclaimers & Signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('SYSTEM AUDIT DISCLAIMER & HUMAN SUPERVISION CLAUSE:', 14, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    '1. Tesseract OCR output represents extracted text patterns and not legally binding certification. Final admission is subject to physical verification of original marksheets.',
    14,
    y
  );
  y += 4;
  doc.text(
    '2. Photo quality checks assess resolution, blur, and lighting parameters according to standard passport guidelines.',
    14,
    y
  );
  y += 4;
  doc.text(
    '3. System duplicate checks detect exact SHA-256 byte matches across submissions to prevent accidental re-uploads.',
    14,
    y
  );

  y += 12;
  // Signatures
  doc.setDrawColor(148, 163, 184);
  doc.line(18, y + 10, 68, y + 10);
  doc.line(130, y + 10, 185, y + 10);

  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Candidate Signature', 26, y + 15);
  doc.text('Authorized Admission Verifier', 135, y + 15);

  // Save the PDF
  const filename = `SmartAdmit_Report_${student.applicationId}_${student.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
