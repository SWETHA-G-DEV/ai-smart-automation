import { CourseEligibilityRule, EligibilityEvaluation, SubjectMark } from '../types';

export interface MarksComparisonResult {
  hasMismatch: boolean;
  mismatchCount: number;
  matchedCount: number;
  subjectComparisons: Array<{
    name: string;
    enteredMarks: number;
    extractedMarks?: number;
    status: 'MATCH' | 'MISMATCH' | 'MANUAL_CHECK_NEEDED';
    difference?: number;
    notes?: string;
  }>;
  totalEntered: number;
  totalExtracted?: number;
  percentageEntered: number;
  percentageExtracted?: number;
  totalStatus: 'MATCH' | 'MISMATCH' | 'NOT_AVAILABLE';
}

/**
 * Compares student-entered marks against OCR extracted marks.
 */
export function compareMarks(
  enteredSubjects: SubjectMark[],
  extractedSubjects?: Array<{ name: string; marks: number; maxMarks: number }>,
  totalExtracted?: number
): MarksComparisonResult {
  let hasMismatch = false;
  let mismatchCount = 0;
  let matchedCount = 0;

  const totalEntered = enteredSubjects.reduce((acc, s) => acc + (s.enteredMarks || 0), 0);
  const maxTotal = enteredSubjects.length * 100;
  const percentageEntered = maxTotal > 0 ? Number(((totalEntered / maxTotal) * 100).toFixed(2)) : 0;

  const comparisons = enteredSubjects.map((entered) => {
    if (!extractedSubjects || extractedSubjects.length === 0) {
      return {
        name: entered.name,
        enteredMarks: entered.enteredMarks,
        extractedMarks: undefined,
        status: 'MANUAL_CHECK_NEEDED' as const,
        notes: 'No OCR extracted mark for this subject',
      };
    }

    // Try finding subject by name or normalized match
    const norm = entered.name.toLowerCase().replace(/[^a-z]/g, '');
    const matchedExtract = extractedSubjects.find((ext) => {
      const extNorm = ext.name.toLowerCase().replace(/[^a-z]/g, '');
      return norm.includes(extNorm) || extNorm.includes(norm);
    });

    if (!matchedExtract) {
      return {
        name: entered.name,
        enteredMarks: entered.enteredMarks,
        extractedMarks: undefined,
        status: 'MANUAL_CHECK_NEEDED' as const,
        notes: 'Subject not detected in OCR text',
      };
    }

    const diff = Math.abs(entered.enteredMarks - matchedExtract.marks);
    if (diff === 0) {
      matchedCount++;
      return {
        name: entered.name,
        enteredMarks: entered.enteredMarks,
        extractedMarks: matchedExtract.marks,
        status: 'MATCH' as const,
        difference: 0,
      };
    } else {
      hasMismatch = true;
      mismatchCount++;
      return {
        name: entered.name,
        enteredMarks: entered.enteredMarks,
        extractedMarks: matchedExtract.marks,
        status: 'MISMATCH' as const,
        difference: entered.enteredMarks - matchedExtract.marks,
        notes: `Difference of ${Math.abs(entered.enteredMarks - matchedExtract.marks)} marks`,
      };
    }
  });

  let totalStatus: 'MATCH' | 'MISMATCH' | 'NOT_AVAILABLE' = 'NOT_AVAILABLE';
  let percentageExtracted: number | undefined;

  if (totalExtracted !== undefined && totalExtracted > 0) {
    if (totalEntered === totalExtracted) {
      totalStatus = 'MATCH';
    } else {
      totalStatus = 'MISMATCH';
      hasMismatch = true;
    }
    percentageExtracted = Number(((totalExtracted / maxTotal) * 100).toFixed(2));
  }

  return {
    hasMismatch,
    mismatchCount,
    matchedCount,
    subjectComparisons: comparisons,
    totalEntered,
    totalExtracted,
    percentageEntered,
    percentageExtracted,
    totalStatus,
  };
}

/**
 * Calculates college admission eligibility based on course rules.
 * TN Engineering Formula: Cutoff = Maths (100) + Physics (50) + Chemistry (50) = 200 Max.
 * Never make admission decisions based exclusively on OCR.
 */
export function evaluateAdmissionEligibility(
  student: {
    courseApplied: string;
    quota: string;
    subjects: SubjectMark[];
    totalEnteredMarks: number;
    enteredPercentage: number;
  },
  rules: CourseEligibilityRule[]
): EligibilityEvaluation {
  const rule = rules.find((r) => r.courseCode === student.courseApplied || r.courseName === student.courseApplied) || rules[0];

  const reasons: string[] = [];
  const isReservedQuota = ['OBC', 'BC', 'MBC', 'SC', 'ST'].includes(student.quota);
  const minRequiredPercentage = isReservedQuota ? rule.minPercentageReserved : rule.minPercentageGeneral;

  // Check required subjects
  let mathMark = 0;
  let physicsMark = 0;
  let chemistryMark = 0;
  let hasAllRequiredSubjects = true;

  for (const req of rule.requiredSubjects) {
    const found = student.subjects.find((s) => s.name.toLowerCase().includes(req.toLowerCase()));
    if (!found) {
      hasAllRequiredSubjects = false;
      reasons.push(`Missing mandatory subject required for admission: ${req}`);
    } else {
      if (req.toLowerCase().includes('math')) mathMark = found.enteredMarks;
      if (req.toLowerCase().includes('physic')) physicsMark = found.enteredMarks;
      if (req.toLowerCase().includes('chemist')) chemistryMark = found.enteredMarks;
    }
  }

  // Calculate Cutoff (out of 200 for engineering)
  // Cutoff = Math + (Physics / 2) + (Chemistry / 2)
  let calculatedScore = student.enteredPercentage;
  if (rule.formula === 'Cutoff_200') {
    calculatedScore = Number((mathMark + physicsMark / 2 + chemistryMark / 2).toFixed(2));
  }

  // Percentage check
  const meetsPercentage = student.enteredPercentage >= minRequiredPercentage;
  if (!meetsPercentage) {
    reasons.push(
      `Aggregate percentage (${student.enteredPercentage}%) is below the required ${minRequiredPercentage}% for ${student.quota} quota.`
    );
  } else {
    reasons.push(`Meets aggregate minimum requirement (>= ${minRequiredPercentage}%).`);
  }

  if (rule.formula === 'Cutoff_200') {
    reasons.push(`Engineering Cutoff Score: ${calculatedScore} / 200 (Math: ${mathMark}, Phy: ${physicsMark}, Chem: ${chemistryMark}).`);
  }

  let status: 'Eligible' | 'Not Eligible' | 'Needs Manual Review' = 'Eligible';

  if (!hasAllRequiredSubjects || !meetsPercentage) {
    status = 'Not Eligible';
  } else if (calculatedScore < 140 && rule.formula === 'Cutoff_200') {
    // Borderline cutoff
    status = 'Needs Manual Review';
    reasons.push('Score is close to threshold; requires academic dean manual review.');
  }

  // Find Alternative Eligible Courses when rules are satisfied
  const recommendedAlternatives: Array<{
    courseCode: string;
    courseName: string;
    department: string;
    requiredCutoff: number;
    studentCutoff: number;
    reason: string;
    isEligible: boolean;
  }> = [];

  for (const altRule of rules) {
    if (altRule.courseCode === rule.courseCode) continue;

    const altMin = isReservedQuota ? altRule.minPercentageReserved : altRule.minPercentageGeneral;
    const altCutoff = isReservedQuota ? (altRule.minCutoffReserved || 140) : (altRule.minCutoffGeneral || 150);

    const hasAltSubs = altRule.requiredSubjects.every((sub) =>
      student.subjects.some((s) => s.name.toLowerCase().includes(sub.toLowerCase()))
    );

    const isCutoffSatisfied = calculatedScore >= altCutoff;
    const isPercentageSatisfied = student.enteredPercentage >= altMin;

    if (hasAltSubs && isPercentageSatisfied && isCutoffSatisfied) {
      recommendedAlternatives.push({
        courseCode: altRule.courseCode,
        courseName: altRule.courseName,
        department: altRule.department,
        requiredCutoff: altCutoff,
        studentCutoff: calculatedScore,
        reason: `Meets all prerequisites (Cutoff: ${calculatedScore} >= ${altCutoff}, Aggregate: ${student.enteredPercentage}% >= ${altMin}%).`,
        isEligible: true,
      });
    }
  }

  return {
    status,
    score: calculatedScore,
    ruleName: rule.courseName,
    reasons,
    isPassingSubjectRequirements: hasAllRequiredSubjects,
    recommendedAlternatives,
  };
}
