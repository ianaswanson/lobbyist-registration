/**
 * Server-side File Validation and Security
 * CRITICAL: Never trust client-side validation alone
 */

// Allowed MIME types with their extensions
const ALLOWED_FILE_TYPES = {
  // Documents
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],

  // Images
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],

  // Spreadsheets (for CSV uploads)
  "text/csv": [".csv"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
} as const;

// Maximum file sizes by type (in bytes)
const MAX_FILE_SIZE = {
  document: 10 * 1024 * 1024, // 10MB
  image: 5 * 1024 * 1024, // 5MB
  spreadsheet: 2 * 1024 * 1024, // 2MB
} as const;

/**
 * Dangerous file extensions that should NEVER be allowed
 * Even if uploaded with wrong extension
 */
const DANGEROUS_EXTENSIONS = [
  ".exe",
  ".dll",
  ".bat",
  ".cmd",
  ".sh",
  ".ps1",
  ".vbs",
  ".js",
  ".jar",
  ".app",
  ".deb",
  ".rpm",
  ".msi",
  ".scr",
  ".com",
  ".pif",
];

/**
 * Dangerous content patterns in filenames
 */
const DANGEROUS_FILENAME_PATTERNS = [
  /\.\./g, // Path traversal
  /[<>:"|?*]/g, // Invalid Windows characters
  /[\x00-\x1f\x80-\x9f]/g, // Control characters
  /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, // Windows reserved names
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

/**
 * Validate file on server-side
 * SECURITY: This must be called on every file upload
 */
export async function validateUploadedFile(
  file: File,
  category: "document" | "image" | "spreadsheet" = "document"
): Promise<FileValidationResult> {
  // 1. Check if file exists
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // 2. Validate filename
  const filenameValidation = validateFilename(file.name);
  if (!filenameValidation.valid) {
    return filenameValidation;
  }

  // 3. Validate file size
  const maxSize = MAX_FILE_SIZE[category];
  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }
  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size of ${maxMB}MB`,
    };
  }

  // 4. Validate MIME type
  const mimeValidation = validateMimeType(file.type, file.name);
  if (!mimeValidation.valid) {
    return mimeValidation;
  }

  // 5. Check file extension matches MIME type
  const extension = getFileExtension(file.name);
  const allowedExtensions =
    ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];

  if (!allowedExtensions || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File type mismatch: ${extension} does not match MIME type ${file.type}`,
    };
  }

  // 6. Additional security checks for specific file types
  if (file.type.startsWith("image/")) {
    // For images, we should validate it's actually an image
    // This would require reading file headers (magic bytes)
    // For now, we rely on MIME type + extension matching
  }

  return {
    valid: true,
    sanitizedFilename: filenameValidation.sanitizedFilename,
  };
}

/**
 * Validate and sanitize filename
 */
function validateFilename(filename: string): FileValidationResult {
  // Check filename length
  if (!filename || filename.length === 0) {
    return { valid: false, error: "Filename is empty" };
  }

  if (filename.length > 255) {
    return { valid: false, error: "Filename is too long (max 255 characters)" };
  }

  // Check for dangerous extensions
  const extension = getFileExtension(filename);
  if (DANGEROUS_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type ${extension} is not allowed for security reasons`,
    };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_FILENAME_PATTERNS) {
    if (pattern.test(filename)) {
      return {
        valid: false,
        error: "Filename contains invalid characters",
      };
    }
  }

  // Sanitize filename
  const sanitized = sanitizeFilename(filename);

  return {
    valid: true,
    sanitizedFilename: sanitized,
  };
}

/**
 * Validate MIME type
 */
function validateMimeType(
  mimeType: string,
  filename: string
): FileValidationResult {
  if (!mimeType) {
    return { valid: false, error: "File type is unknown" };
  }

  // Check if MIME type is in allowed list
  if (!(mimeType in ALLOWED_FILE_TYPES)) {
    return {
      valid: false,
      error: `File type ${mimeType} is not allowed. Allowed types: PDF, DOC, DOCX, JPG, PNG, CSV`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize filename by removing dangerous characters
 */
function sanitizeFilename(filename: string): string {
  // Get filename without extension
  const lastDotIndex = filename.lastIndexOf(".");
  const name =
    lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";

  // Remove dangerous characters
  let sanitized = name
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores

  // Ensure filename is not empty after sanitization
  if (sanitized.length === 0) {
    sanitized = "file";
  }

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now();
  return `${sanitized}_${timestamp}${extension}`;
}

/**
 * Get file extension including the dot
 */
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return "";
  }
  return filename.substring(lastDotIndex).toLowerCase();
}

/**
 * Format file size for human readability
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Validate magic bytes (file signature)
 * This is an advanced check to ensure file content matches declared type
 * Helps prevent files with changed extensions
 */
export async function validateFileSignature(
  file: File
): Promise<FileValidationResult> {
  // Read first few bytes of file
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check magic bytes for common file types
  const signatures: Record<string, number[][]> = {
    "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
    "image/jpeg": [[0xff, 0xd8, 0xff]], // JPEG
    "image/png": [[0x89, 0x50, 0x4e, 0x47]], // PNG
    "application/zip": [[0x50, 0x4b, 0x03, 0x04]], // ZIP (used by DOCX, XLSX)
  };

  const expectedSignatures = signatures[file.type];
  if (!expectedSignatures) {
    // If we don't have signature for this type, skip check
    return { valid: true };
  }

  // Check if file matches any expected signature
  const matches = expectedSignatures.some((signature) =>
    signature.every((byte, index) => bytes[index] === byte)
  );

  if (!matches) {
    return {
      valid: false,
      error:
        "File content does not match declared file type. File may be corrupted or mislabeled.",
    };
  }

  return { valid: true };
}

/**
 * Generate secure random filename
 * Use this when you don't want to preserve original filename
 */
export function generateSecureFilename(originalFilename: string): string {
  const extension = getFileExtension(originalFilename);
  const randomString = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const timestamp = Date.now();
  return `${timestamp}_${randomString}${extension}`;
}
