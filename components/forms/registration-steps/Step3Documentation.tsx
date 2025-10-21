"use client"

import { useState } from "react"
import FileUpload, { UploadedFile } from "@/components/FileUpload"

interface Step3Props {
  data: {
    authorizationDocuments?: UploadedFile[]
  }
  updateData: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export function Step3Documentation({
  data,
  updateData,
  onNext,
  onBack,
}: Step3Props) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    data.authorizationDocuments || []
  )
  const [error, setError] = useState<string | null>(null)

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    updateData({ authorizationDocuments: files })
    // Clear error when files are added
    if (files.length > 0) {
      setError(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one authorization document")
      return
    }
    setError(null)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Step 3: Authorization Documentation
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Upload the official authorization document signed by an officer of
          your employer.
        </p>
      </div>

      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Required Documentation
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                The authorization document must be signed by an officer of the
                employer and include:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Employer's name and contact information</li>
                <li>Lobbyist's name</li>
                <li>Statement of authorization to lobby on behalf of employer</li>
                <li>Signature and title of employer officer</li>
                <li>Date of authorization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <FileUpload
        label="Upload Authorization Document"
        description="Upload the official authorization document signed by an officer of your employer. You can upload multiple pages if needed."
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        maxSizeMB={10}
        maxFiles={3}
        value={uploadedFiles}
        onChange={handleFilesChange}
        required
      />

      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Note on Authorization
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                If you don't have the authorization document yet, you can save
                this registration as a draft and upload it later. However, your
                registration will not be approved until the document is
                received.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Next: Review & Submit
        </button>
      </div>
    </form>
  )
}
