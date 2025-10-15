"use client"

import { useState } from "react"

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  url?: string
}

interface FileUploadProps {
  label: string
  description?: string
  accept?: string
  maxSizeMB?: number
  maxFiles?: number
  value: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  required?: boolean
}

export default function FileUpload({
  label,
  description,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  maxSizeMB = 10,
  maxFiles = 5,
  value,
  onChange,
  required = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    const files = Array.from(fileList)
    setError(null)

    // Validate file count
    if (value.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate file sizes and types
    const maxBytes = maxSizeMB * 1024 * 1024
    const acceptedTypes = accept.split(",").map((t) => t.trim())

    for (const file of files) {
      if (file.size > maxBytes) {
        setError(`File "${file.name}" exceeds ${maxSizeMB}MB limit`)
        return
      }

      const extension = "." + file.name.split(".").pop()?.toLowerCase()
      if (!acceptedTypes.includes(extension)) {
        setError(
          `File "${file.name}" type not allowed. Accepted: ${accept}`
        )
        return
      }
    }

    // Create UploadedFile objects
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
    }))

    onChange([...value, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleRemove = (fileId: string) => {
    onChange(value.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div>
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>

      {description && (
        <p className="text-sm text-gray-600 mb-3" id="file-upload-description">{description}</p>
      )}

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          transition-colors cursor-pointer
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
      >
        <input
          id="file-upload"
          type="file"
          multiple={maxFiles > 1}
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-describedby={description ? "file-upload-description file-upload-instructions" : "file-upload-instructions"}
          aria-invalid={error ? "true" : "false"}
        />
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium text-blue-600">Click to upload</span> or
          drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1" id="file-upload-instructions">
          {accept} up to {maxSizeMB}MB each
          {maxFiles > 1 && ` (max ${maxFiles} files)`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center" role="alert" aria-live="polite">
          <svg
            className="h-4 w-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Uploaded Files List */}
      {value.length > 0 && (
        <div className="mt-4 space-y-2" role="list" aria-label="Uploaded files">
          {value.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              role="listitem"
            >
              <div className="flex items-center min-w-0 flex-1">
                <svg
                  className="h-5 w-5 text-gray-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(file.id)}
                className="ml-4 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                aria-label={`Remove ${file.name}`}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
