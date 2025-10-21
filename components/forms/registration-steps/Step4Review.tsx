"use client"

import { Loader2 } from "lucide-react"

interface Step4Props {
  data: {
    name: string
    email: string
    phone: string
    address: string
    hoursCurrentQuarter: number
    employerName: string
    employerEmail: string
    employerPhone: string
    employerAddress: string
    employerBusinessDescription: string
    subjectsOfInterest: string
    authorizationDocument?: File
  }
  onBack: () => void
  onSubmit: () => void
  isSubmitting?: boolean
}

export function Step4Review({ data, onBack, onSubmit, isSubmitting = false }: Step4Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Step 4: Review & Submit
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Please review your information before submitting. You can go back to
          make changes if needed.
        </p>
      </div>

      {/* Personal Information Summary */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 className="font-semibold text-gray-900">Personal Information</h4>
        <dl className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Name:</dt>
            <dd className="font-medium text-gray-900">{data.name}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Email:</dt>
            <dd className="font-medium text-gray-900">{data.email}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Phone:</dt>
            <dd className="font-medium text-gray-900">{data.phone}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Address:</dt>
            <dd className="font-medium text-gray-900 text-right">
              {data.address}
            </dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Hours This Quarter:</dt>
            <dd className="font-medium text-gray-900">
              {data.hoursCurrentQuarter} hours
            </dd>
          </div>
        </dl>
      </div>

      {/* Employer Information Summary */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 className="font-semibold text-gray-900">Employer Information</h4>
        <dl className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Employer Name:</dt>
            <dd className="font-medium text-gray-900">{data.employerName}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Email:</dt>
            <dd className="font-medium text-gray-900">{data.employerEmail}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Phone:</dt>
            <dd className="font-medium text-gray-900">{data.employerPhone}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Address:</dt>
            <dd className="font-medium text-gray-900 text-right">
              {data.employerAddress}
            </dd>
          </div>
          <div className="text-sm">
            <dt className="text-gray-600">Business Description:</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {data.employerBusinessDescription}
            </dd>
          </div>
          <div className="text-sm">
            <dt className="text-gray-600">Subjects of Interest:</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {data.subjectsOfInterest}
            </dd>
          </div>
        </dl>
      </div>

      {/* Documentation Summary */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 className="font-semibold text-gray-900">Documentation</h4>
        <dl className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Authorization Document:</dt>
            <dd className="font-medium text-gray-900">
              {data.authorizationDocument ? (
                <span className="text-green-600">
                  ✓ {data.authorizationDocument.name}
                </span>
              ) : (
                <span className="text-yellow-600">Not uploaded</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Attestation */}
      <div className="rounded-md border-2 border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="attestation"
              name="attestation"
              type="checkbox"
              required
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="attestation" className="text-sm text-gray-700">
              <span className="font-semibold">Attestation:</span> I certify
              under penalty of false swearing that the information provided in
              this registration is true and accurate to the best of my
              knowledge. I understand that providing false information may
              result in fines up to $500 and other penalties as outlined in
              Multnomah County Code §3.800-3.811.
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Submitting..." : "Submit Registration"}
        </button>
      </div>
    </form>
  )
}
