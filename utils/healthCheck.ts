import { ApplicationHealth, HealthCheckItem, Student, UploadedDocument, DocumentRequirement } from '../types';
import { INITIAL_DOCUMENT_REQUIREMENTS } from '../data/demoData';

export function calculateApplicationHealth(
  student: Student,
  documents: UploadedDocument[],
  requirements: DocumentRequirement[] = INITIAL_DOCUMENT_REQUIREMENTS
): ApplicationHealth {
  const checklist: HealthCheckItem[] = [];

  // 1. Profile Completeness (20 points)
  const hasBasicProfile = Boolean(
    student.name?.trim() &&
    student.email?.trim() &&
    student.mobile?.trim() &&
    student.registerNumber?.trim()
  );
  checklist.push({
    id: 'profile_basic',
    category: 'Profile',
    label: 'Primary candidate details (Name, Email, Mobile, Reg No)',
    isPassed: hasBasicProfile,
    points: 10,
    fixHint: 'Ensure your full name, email, mobile number and 12th board register number are filled.',
  });

  const hasCourseAndQuota = Boolean(student.courseApplied && student.quota);
  checklist.push({
    id: 'profile_course',
    category: 'Profile',
    label: 'Course preference & Quota reservation category selected',
    isPassed: hasCourseAndQuota,
    points: 10,
    fixHint: 'Select your preferred engineering degree program and quota status.',
  });

  // 2. Document Availability (25 points)
  const studentDocs = documents.filter((d) => d.studentId === student.id);
  const mark12 = studentDocs.find((d) => d.docType === 'marksheet_12');
  const mark10 = studentDocs.find((d) => d.docType === 'marksheet_10');
  const tcDoc = studentDocs.find((d) => d.docType === 'transfer_certificate');
  const photoDoc = studentDocs.find((d) => d.docType === 'photo');
  const communityDoc = studentDocs.find((d) => d.docType === 'community_certificate');

  checklist.push({
    id: 'doc_12th',
    category: 'Documents',
    label: '12th Standard Board Marksheet (+2) uploaded',
    isPassed: Boolean(mark12),
    points: 10,
    fixHint: 'Upload your clear original or provisional 12th marksheet scan.',
  });

  checklist.push({
    id: 'doc_10th',
    category: 'Documents',
    label: '10th Standard Marksheet / Date of Birth proof uploaded',
    isPassed: Boolean(mark10),
    points: 8,
    fixHint: 'Upload your 10th SSLC marksheet for name and date of birth cross-verification.',
  });

  checklist.push({
    id: 'doc_tc',
    category: 'Documents',
    label: 'Transfer Certificate (T.C.) with school conduct attached',
    isPassed: Boolean(tcDoc),
    points: 7,
    fixHint: 'Upload your original transfer certificate from your previous institution.',
  });

  // 3. Marks Entry & Validation (20 points)
  const hasMarks = student.subjects && student.subjects.length >= 5 && student.totalEnteredMarks > 0;
  checklist.push({
    id: 'marks_entered',
    category: 'Marks',
    label: 'Subject-wise marks entered (6 subjects completed)',
    isPassed: hasMarks,
    points: 10,
    fixHint: 'Fill in all individual subject marks obtained in your higher secondary examination.',
  });

  // Check OCR match without discrepancy
  const hasOcr = Boolean(mark12?.ocrResult && mark12.ocrResult.subjects.length > 0);
  const hasMarksMismatch = Boolean(
    mark12?.verificationStatus === 'Mismatch' ||
    mark12?.verificationStatus === 'Correction Required' ||
    student.correctionsRequested?.some((c) => c.docType === 'marksheet_12' && c.status === 'pending')
  );

  checklist.push({
    id: 'marks_cross_verified',
    category: 'Marks',
    label: 'OCR automated marks cross-validation matched without discrepancy',
    isPassed: hasOcr && !hasMarksMismatch,
    points: 10,
    fixHint: hasMarksMismatch
      ? 'A marks mismatch was flagged. Cross-check your entered marks table against the extracted marksheet text.'
      : 'Upload a crisp marksheet image so Tesseract OCR can cross-verify your marks.',
  });

  // 4. Photo Quality Biometrics (15 points)
  const photoQuality = photoDoc?.photoQuality;
  const isPhotoPassing = Boolean(photoQuality && !photoQuality.isBlurry && photoQuality.score >= 70);

  checklist.push({
    id: 'photo_quality',
    category: 'Photo',
    label: 'Passport photo meets sharpness, lighting & dimension standards (>= 70)',
    isPassed: isPhotoPassing,
    points: 15,
    fixHint: photoQuality?.isBlurry
      ? 'Your photo is blurry. Retake your passport photograph with adequate front lighting against a plain background.'
      : 'Upload a front-facing passport photograph (3.5 x 4.5 cm).',
  });

  // 5. Cross-Document & Duplicate Integrity (20 points)
  const hasDuplicate = studentDocs.some((d) => d.isDuplicate);
  checklist.push({
    id: 'no_duplicate_files',
    category: 'CrossDoc',
    label: 'Document uniqueness audit (No duplicate files across categories)',
    isPassed: !hasDuplicate,
    points: 10,
    fixHint: 'Avoid uploading the same document scan for different certificate categories.',
  });

  const crossDoc = student.crossDocComparison;
  const isCrossDocOk = !crossDoc || crossDoc.nameMatch !== 'MISMATCH';
  checklist.push({
    id: 'cross_doc_names',
    category: 'CrossDoc',
    label: 'Candidate name and identity consistency between 10th and 12th records',
    isPassed: isCrossDocOk,
    points: 10,
    fixHint: 'Ensure your name on your application exactly mirrors your government certificates.',
  });

  // Calculate totals
  const totalScore = checklist.reduce((acc, item) => (item.isPassed ? acc + item.points : acc), 0);

  let rating: ApplicationHealth['rating'] = 'Needs Attention';
  if (totalScore >= 90) {
    rating = 'Excellent';
  } else if (totalScore >= 75) {
    rating = 'Good';
  } else if (totalScore < 50) {
    rating = 'Incomplete';
  }

  // Calculate breakdown
  const profileScore = checklist
    .filter((c) => c.category === 'Profile')
    .reduce((acc, c) => (c.isPassed ? acc + c.points : acc), 0);
  const docsScore = checklist
    .filter((c) => c.category === 'Documents')
    .reduce((acc, c) => (c.isPassed ? acc + c.points : acc), 0);
  const marksScore = checklist
    .filter((c) => c.category === 'Marks')
    .reduce((acc, c) => (c.isPassed ? acc + c.points : acc), 0);
  const photoScore = checklist
    .filter((c) => c.category === 'Photo')
    .reduce((acc, c) => (c.isPassed ? acc + c.points : acc), 0);
  const crossDocScore = checklist
    .filter((c) => c.category === 'CrossDoc')
    .reduce((acc, c) => (c.isPassed ? acc + c.points : acc), 0);

  return {
    totalScore,
    rating,
    breakdown: {
      profileScore,
      docsScore,
      marksScore,
      photoScore,
      crossDocScore,
    },
    checklist,
  };
}
