/**
 * Computes a SHA-256 hexadecimal hash from a File or Blob using browser Web Crypto API.
 */
export async function computeFileHash(file: File | Blob): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Failed to compute hash:', error);
    // Fallback pseudo-hash based on file size and last modified
    if (file instanceof File) {
      return `fallback-${file.name}-${file.size}-${file.lastModified}`;
    }
    return `fallback-${Date.now()}`;
  }
}

/**
 * Checks if a hash exists among other uploaded documents for the student.
 */
export function checkDuplicateDocument(
  newHash: string,
  existingDocs: Array<{ id: string; fileHash: string; title: string }>
): { isDuplicate: boolean; duplicateWithTitle?: string } {
  const match = existingDocs.find(doc => doc.fileHash === newHash);
  if (match) {
    return {
      isDuplicate: true,
      duplicateWithTitle: match.title,
    };
  }
  return { isDuplicate: false };
}
