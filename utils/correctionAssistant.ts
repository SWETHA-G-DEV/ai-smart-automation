import { DocumentType } from '../types';

export interface CorrectionTemplate {
  id: string;
  category: 'Photo' | 'Marks' | 'Certificate' | 'Legibility' | 'General';
  docType: DocumentType;
  titleEn: string;
  titleTa: string;
  problemEn: string;
  problemTa: string;
  solutionEn: string;
  solutionTa: string;
  exampleMessageEn: string;
  exampleMessageTa: string;
}

export const CORRECTION_TEMPLATES: CorrectionTemplate[] = [
  {
    id: 'blurry_photo',
    category: 'Photo',
    docType: 'photo',
    titleEn: 'Blurry or Low-Quality Photograph',
    titleTa: 'புகைப்படம் மங்கலாக அல்லது தெளிவாக இல்லை',
    problemEn: 'The uploaded passport photo is out of focus or motion-blurred, making facial verification impossible.',
    problemTa: 'பதிவேற்றப்பட்ட பாஸ்போர்ட் புகைப்படம் மங்கலாக உள்ளது; முகம் தெளிவாக தெரியவில்லை.',
    solutionEn: 'Please retake your photograph using adequate indoor lighting against a plain white or light blue background. Hold the phone steady or use portrait mode.',
    solutionTa: 'வெள்ளை அல்லது வெளிர் நீல பின்னணியில் நல்ல வெளிச்சத்தில் உங்கள் புகைப்படத்தை மீண்டும் எடுத்து பதிவேற்றவும்.',
    exampleMessageEn: 'Dear Student, your passport photograph failed the quality check (blur detected). Please re-upload a clear, non-blurry portrait photograph (minimum 300x400 px) within 48 hours.',
    exampleMessageTa: 'அன்பார்ந்த மாணவரே, உங்கள் பாஸ்போர்ட் புகைப்படம் மங்கலாக இருப்பதால் நிராகரிக்கப்பட்டுள்ளது. தயவுசெய்து தெளிவான புதிய புகைப்படத்தை பதிவேற்றவும்.',
  },
  {
    id: 'marks_mismatch_12',
    category: 'Marks',
    docType: 'marksheet_12',
    titleEn: '12th Marksheet Marks Mismatch',
    titleTa: '12-ஆம் வகுப்பு மதிப்பெண் பொருந்தவில்லை',
    problemEn: 'The marks entered in your admission application do not match the values extracted from your official board marksheet.',
    problemTa: 'விண்ணப்பத்தில் நீங்கள் உள்ளிட்ட மதிப்பெண்களும், உங்கள் மதிப்பெண் பட்டியலில் உள்ள மதிப்பெண்களும் வேறுபடுகின்றன.',
    solutionEn: 'Inspect the subject-wise marks table below. Correct any typographical errors in your entered marks or upload a clearer scan of your statement of marks.',
    solutionTa: 'கீழே உள்ள பாடவாரியான மதிப்பெண் அட்டவணையை சரிபார்த்து, சரியான மதிப்பெண்களை பதிவு செய்யவும் அல்லது தெளிவான ஆவணத்தை பதிவேற்றவும்.',
    exampleMessageEn: 'Dear Student, a discrepancy was detected between your entered Physics marks (92) and the marksheet text (82). Please update your form or upload an attested copy.',
    exampleMessageTa: 'அன்பார்ந்த மாணவரே, உங்கள் இயற்பியல் மதிப்பெண்ணில் முரண்பாடு உள்ளது (பதிவு செய்தது: 92, சான்றிதழில்: 82). தயவுசெய்து திருத்தம் செய்யவும்.',
  },
  {
    id: 'missing_community_cert',
    category: 'Certificate',
    docType: 'community_certificate',
    titleEn: 'Community Certificate Required for Quota',
    titleTa: 'இடஒதுக்கீட்டிற்கான சாதிச் சான்றிதழ் தேவை',
    problemEn: 'You selected a reserved category (BC/MBC/SC/ST) but have not uploaded an official Revenue Department Community Certificate.',
    problemTa: 'நீங்கள் இடஒதுக்கீடு பிரிவைத் தேர்ந்தெடுத்துள்ளீர்கள் (BC/MBC/SC/ST), ஆனால் அதற்கான சாதிச் சான்றிதழை இணைக்கவில்லை.',
    solutionEn: 'Upload a clear scanned copy of your e-District digital Community Certificate issued by the Tahsildar / Revenue Authority with QR code.',
    solutionTa: 'வட்டாட்சியரால் வழங்கப்பட்ட QR குறியீட்டுடன் கூடிய டிஜிட்டல் சாதிச் சான்றிதழை பதிவேற்றவும்.',
    exampleMessageEn: 'Dear Applicant, community certificate is mandatory for fee concession and quota seat allocation. Please upload it promptly.',
    exampleMessageTa: 'மாணவரே, இடஒதுக்கீடு சலுகை பெற சாதிச் சான்றிதழ் கட்டாயமாகும். தயவுசெய்து உடனடியாக பதிவேற்றவும்.',
  },
  {
    id: 'duplicate_file_uploaded',
    category: 'General',
    docType: 'other',
    titleEn: 'Duplicate File Detected Across Requirements',
    titleTa: 'ஒரே ஆவணம் மீண்டும் பதிவேற்றப்பட்டுள்ளது',
    problemEn: 'You have uploaded the identical file for two different checklist items (e.g. 10th marksheet file uploaded for Transfer Certificate).',
    problemTa: 'இரண்டு வெவ்வேறு தேவைகளுக்கு ஒரே கோப்பை பதிவேற்றியுள்ளீர்கள்.',
    solutionEn: 'Ensure each document type has its corresponding distinct official certificate file.',
    solutionTa: 'ஒவ்வொரு ஆவணத்திற்கும் அதற்கே உரிய சரியான தனித்தனி கோப்புகளை பதிவேற்றவும்.',
    exampleMessageEn: 'Dear Student, the same document file was uploaded under both 10th Marksheet and Transfer Certificate. Please upload the genuine Transfer Certificate.',
    exampleMessageTa: '10-ஆம் வகுப்பு மதிப்பெண் பட்டியல் மற்றும் மாற்றுச் சான்றிதழ் இரண்டிற்கும் ஒரே கோப்பு பதிவேற்றப்பட்டுள்ளது. சரியான மாற்றுச் சான்றிதழை பதிவேற்றவும்.',
  },
  {
    id: 'low_resolution_scan',
    category: 'Legibility',
    docType: 'transfer_certificate',
    titleEn: 'Unreadable / Low Resolution Document',
    titleTa: 'படிக்க இயலாத குறைவான தெளிவுத்திறன் கொண்ட ஆவணம்',
    problemEn: 'Document text, seal, or principal signature is pixelated or truncated, preventing verification.',
    problemTa: 'சான்றிதழின் கையொப்பம் மற்றும் முத்திரை மங்கலாக உள்ளது; சரிபார்க்க இயலவில்லை.',
    solutionEn: 'Use a flatbed scanner or a high-quality scanning app (like Adobe Scan) at 300 DPI. Avoid angled camera snapshots in dim rooms.',
    solutionTa: 'ஸ்கேனர் அல்லது ஸ்கேனிங் செயலியைப் பயன்படுத்தி 300 DPI தெளிவுத்திறனில் ஆவணத்தை மீண்டும் ஸ்கேன் செய்து பதிவேற்றவும்.',
    exampleMessageEn: 'Dear Student, the Transfer Certificate scan is too dark and the school seal is cut off. Please provide a full, flat scan.',
    exampleMessageTa: 'மாற்றுச் சான்றிதழில் பள்ளியின் முத்திரை வெட்டப்பட்டுள்ளது. முழுமையான தெளிவான ஆவணத்தை பதிவேற்றவும்.',
  },
];

export function getCorrectionAdvice(reasonId: string): CorrectionTemplate {
  return CORRECTION_TEMPLATES.find((t) => t.id === reasonId) || CORRECTION_TEMPLATES[0];
}
