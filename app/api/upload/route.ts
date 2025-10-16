import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { validateUploadedFile, validateFileSignature } from "@/lib/file-validation"
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit"

/**
 * POST /api/upload
 * Secure file upload endpoint with server-side validation
 *
 * SECURITY FEATURES:
 * - Authentication required
 * - Rate limiting (10 uploads per minute)
 * - File type validation (MIME + extension)
 * - File size limits
 * - Filename sanitization
 * - Magic byte validation
 * - Protection against path traversal
 */
export async function POST(req: NextRequest) {
  try {
    // 1. SECURITY: Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // 2. SECURITY: Rate limiting - 10 uploads per minute
    const identifier = `upload_${session.user.id}`
    const limitResult = rateLimit(identifier, {
      interval: 60 * 1000,
      uniqueTokenPerInterval: 10,
    })

    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Too many upload requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (limitResult.reset.getTime() - Date.now()) / 1000
            ).toString(),
          },
        }
      )
    }

    // 3. Parse form data
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const category = (formData.get("category") as string) || "document"
    const entityType = formData.get("entityType") as string
    const entityId = formData.get("entityId") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "Missing entity information" },
        { status: 400 }
      )
    }

    // 4. SECURITY: Validate category
    if (!["document", "image", "spreadsheet"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid file category" },
        { status: 400 }
      )
    }

    // 5. SECURITY: Validate file (type, size, filename)
    const validation = await validateUploadedFile(
      file,
      category as "document" | "image" | "spreadsheet"
    )

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // 6. SECURITY: Validate file signature (magic bytes)
    const signatureValidation = await validateFileSignature(file)
    if (!signatureValidation.valid) {
      return NextResponse.json(
        { error: signatureValidation.error },
        { status: 400 }
      )
    }

    // 7. Process upload
    // For prototype: return mock data
    // For production: upload to cloud storage (S3, GCS, Azure Blob)
    const uploadedFile = {
      id: `file-${Date.now()}-${Math.random()}`,
      name: validation.sanitizedFilename || file.name,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString(),
      url: `/api/files/${entityType}/${entityId}/${validation.sanitizedFilename}`,
    }

    // 8. TODO: For production, implement actual file storage
    // - Upload to cloud storage with virus scanning
    // - Generate signed URLs for secure download
    // - Store file metadata in database
    // - Implement file retention policies

    // 9. Audit log
    console.log(`File uploaded: ${file.name} by user ${session.user.email}`, {
      fileId: uploadedFile.id,
      size: file.size,
      type: file.type,
      entityType,
      entityId,
    })

    return NextResponse.json({
      success: true,
      file: uploadedFile,
    })

  } catch (error) {
    console.error("Upload error:", error)

    // Don't expose internal errors to client
    return NextResponse.json(
      { error: "File upload failed. Please try again." },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload
 * Get upload configuration and limits
 */
export async function GET() {
  return NextResponse.json({
    maxFileSizes: {
      document: "10MB",
      image: "5MB",
      spreadsheet: "2MB",
    },
    allowedTypes: {
      document: [".pdf", ".doc", ".docx"],
      image: [".jpg", ".jpeg", ".png", ".gif"],
      spreadsheet: [".csv", ".xls", ".xlsx"],
    },
    rateLimit: {
      uploads: 10,
      interval: "1 minute",
    },
  })
}
