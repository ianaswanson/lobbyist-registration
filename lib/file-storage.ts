/**
 * File Storage Utility
 * Handles file uploads and document management
 *
 * For prototype: Uses local filesystem storage
 * For production: Can be adapted to use cloud storage (S3, Azure Blob, Google Cloud Storage)
 */

import { UploadedFile } from "@/components/FileUpload";

/**
 * Save uploaded files to storage
 * In prototype: simulates upload with local file references
 * In production: would upload to cloud storage and return URLs
 */
export async function saveFiles(
  files: File[],
  entityType: "registration" | "expense-report" | "receipt",
  entityId: string
): Promise<UploadedFile[]> {
  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // For prototype: create mock URLs
  // In production: would use actual cloud storage URLs
  const uploadedFiles: UploadedFile[] = files.map((file) => ({
    id: `file-${Date.now()}-${Math.random()}`,
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date(),
    url: `/api/files/${entityType}/${entityId}/${file.name}`,
  }));

  return uploadedFiles;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(fileId: string): Promise<void> {
  // Simulate deletion delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // For prototype: just return success
  // In production: would delete from cloud storage
  console.log(`File ${fileId} deleted`);
}

/**
 * Get download URL for a file
 */
export function getFileDownloadUrl(file: UploadedFile): string {
  // For prototype: return the URL directly
  // In production: might generate signed URLs for cloud storage
  return file.url || "#";
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedExtensions?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 10, allowedExtensions = [] } = options;

  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File "${file.name}" type not allowed. Accepted: ${allowedExtensions.join(", ")}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return "📄";
    case "doc":
    case "docx":
      return "📝";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "🖼️";
    case "xls":
    case "xlsx":
    case "csv":
      return "📊";
    default:
      return "📎";
  }
}

/**
 * Convert File to Base64 (useful for storing in database during prototype)
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * For production: Upload configuration
 */
export const UPLOAD_CONFIG = {
  // Maximum file size in MB
  maxFileSizeMB: 10,

  // Allowed file types for documents
  allowedDocumentTypes: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],

  // Allowed file types for receipts
  allowedReceiptTypes: [".pdf", ".jpg", ".jpeg", ".png"],

  // Maximum files per upload
  maxFilesPerUpload: 5,

  // Storage paths
  storagePaths: {
    registration: "uploads/registration",
    expenseReport: "uploads/expense-reports",
    receipt: "uploads/receipts",
  },
};
