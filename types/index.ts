export type ApplicationStatus = 
  | 'Submitted' 
  | 'Under Verification' 
  | 'Correction Required' 
  | 'Verified' 
  | 'Manual Review Required';

export type IssueCategory = 
  | 'NO_ISSUES' 
  | 'CORRECTION_REQUIRED' 
  | 'MANUAL_REVIEW_REQUIRED';

export type DocumentType = 
  | 'marksheet_10' 
  | 'marksheet_12' 
  | 'transfer_certificate' 
  | 'community_certificate' 
  | 'photo' 
  | 'other';

export interface SubjectMark {
  name: string;
  maxMarks: number;
  enteredMarks: number;
  extractedMarks?: number;
  isMatched?: boolean;
}

export interface OcrResult {
  rawText: string;
  confidence: number; // 0 - 100
  extractedName?: string;
  extractedRegisterNo?: string;
  extractedDob?: string;
  extractedFatherName?: string;
  subjects: Array<{ name: string; marks: number; maxMarks: number }>;
  totalMarks?: number;
  percentage?: number;
  warnings: string[];
  isProcessing?: boolean;
}

export interface PhotoQualityResult {
  score: number; // 0 - 100
  blurScore: number;
  brightness: number; // 0 - 100
  resolution: { width: number; height: number };
  aspectRatio: number;
  isBlurry: boolean;
  isLowBrightness: boolean;
  isOverExposed: boolean;
  isLowResolution: boolean;
  isExcessivelyCropped: boolean;
  suggestions: string[];
}

export interface UploadedDocument {
  id: string;
  studentId: string;
  docType: DocumentType;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileDataUrl: string; // base64 or object URL
  uploadDate: string;
  fileHash: string; // SHA-256 for duplicate check
  ocrResult?: OcrResult;
  photoQuality?: PhotoQualityResult;
  isDuplicate?: boolean;
  duplicateWarning?: string;
  verificationStatus: 'Pending' | 'Valid' | 'Mismatch' | 'Correction Required' | 'Needs Review';
  adminRemarks?: string;
}

export interface CrossDocComparison {
  name10th?: string;
  name12th?: string;
  nameMatch: 'MATCH' | 'MINOR_DIFFERENCE' | 'MISMATCH' | 'NOT_AVAILABLE';
  similarityPercentage: number;
  
  dob10th?: string;
  dob12th?: string;
  dobMatch: 'MATCH' | 'MISMATCH' | 'NOT_AVAILABLE';
  
  fatherName10th?: string;
  fatherName12th?: string;
  fatherNameMatch: 'MATCH' | 'MINOR_DIFFERENCE' | 'MISMATCH' | 'NOT_AVAILABLE';
  
  regNo10th?: string;
  regNo12th?: string;
  
  summary: string;
  isConfirmedByTeacher: boolean;
  teacherConfirmedName?: string;
  teacherNotes?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string; // e.g., 'Teacher: Dr. S.K. Subramanian', 'System: Tesseract OCR', 'Student'
  action: string;
  details: string;
  badgeType: 'success' | 'warning' | 'info' | 'danger';
}

export interface HealthCheckItem {
  id: string;
  category: 'Profile' | 'Documents' | 'Marks' | 'Photo' | 'CrossDoc';
  label: string;
  isPassed: boolean;
  points: number;
  fixHint: string;
}

export interface ApplicationHealth {
  totalScore: number; // 0 - 100
  rating: 'Excellent' | 'Good' | 'Needs Attention' | 'Incomplete';
  breakdown: {
    profileScore: number;
    docsScore: number;
    marksScore: number;
    photoScore: number;
    crossDocScore: number;
  };
  checklist: HealthCheckItem[];
}

export interface RecommendedCourse {
  courseCode: string;
  courseName: string;
  department: string;
  requiredCutoff: number;
  studentCutoff: number;
  reason: string;
  isEligible: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password?: string;
  mobile: string;
  registerNumber: string; // 12th Board Registration No
  regNo10th?: string; // 10th Board Registration No
  dateOfBirth?: string; // e.g. 14/05/2006
  fatherName?: string;
  courseApplied: string;
  quota: 'General' | 'OBC' | 'BC' | 'MBC' | 'SC' | 'ST' | 'Sports / Special';
  applicationId: string;
  appliedDate: string;
  status: ApplicationStatus;
  avatarUrl?: string;
  
  // Academic marks entered by student
  boardName: string;
  passingYear: string;
  subjects: SubjectMark[];
  totalEnteredMarks: number;
  enteredPercentage: number;
  
  // Deadlines & Reminders
  correctionDeadline?: string;
  reminderSent?: boolean;
  
  // Cross-Document Intelligence
  crossDocComparison?: CrossDocComparison;
  
  // Audit Timeline
  auditTrail: AuditLogEntry[];
  
  // Correction notes
  correctionsRequested: Array<{
    id: string;
    docType: DocumentType;
    messageEn: string;
    messageTa: string;
    status: 'pending' | 'resolved';
    requestedAt: string;
    resubmittedAt?: string;
  }>;
  
  // Teacher / Admin notes
  adminReviewNotes?: string;
  lastReviewedAt?: string;
  reviewedBy?: string;
}

export interface CourseEligibilityRule {
  courseCode: string;
  courseName: string;
  department: string;
  minPercentageGeneral: number;
  minPercentageReserved: number;
  requiredSubjects: string[];
  minCutoffGeneral?: number;
  minCutoffReserved?: number;
  formula: 'Cutoff_200' | 'Aggregate_Percentage'; // Cutoff_200 = Maths + (Physics + Chemistry)/2 (standard TN engineering formula)
}

export interface EligibilityEvaluation {
  status: 'Eligible' | 'Not Eligible' | 'Needs Manual Review';
  score: number; // e.g. 184/200 cutoff or percentage
  ruleName: string;
  reasons: string[];
  isPassingSubjectRequirements: boolean;
  recommendedAlternatives?: RecommendedCourse[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admission_officer' | 'verifier' | 'teacher';
  department: string;
}

export interface DocumentRequirement {
  type: DocumentType;
  title: string;
  description: string;
  isRequired: boolean;
  acceptedFormats: string[];
}

export interface BatchVerificationResultItem {
  id: string;
  studentName: string;
  applicationId: string;
  registerNumber: string;
  course: string;
  totalEnteredMarks: number;
  extractedTotalMarks?: number;
  marksMatch: 'MATCH' | 'MISMATCH' | 'PENDING';
  photoScore: number;
  crossDocStatus: 'MATCH' | 'MINOR_DIFFERENCE' | 'MISMATCH' | 'NOT_APPLICABLE';
  duplicateFlag: boolean;
  verificationOutcome: 'Auto-Passed' | 'Correction Required' | 'Manual Review Required';
  flags: string[];
  processedAt: string;
}
