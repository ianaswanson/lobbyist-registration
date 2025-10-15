"use client"

interface Step2Props {
  data: {
    employerName: string
    employerEmail: string
    employerPhone: string
    employerAddress: string
    employerBusinessDescription: string
    subjectsOfInterest: string
  }
  updateData: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export function Step2EmployerInfo({
  data,
  updateData,
  onNext,
  onBack,
}: Step2Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Step 2: Employer Information
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Provide details about the organization or individual you represent.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="employerName"
            className="block text-sm font-medium text-gray-700"
          >
            Employer/Organization Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="employerName"
            required
            value={data.employerName}
            onChange={(e) => updateData({ employerName: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="TechCorp Industries"
          />
        </div>

        <div>
          <label
            htmlFor="employerEmail"
            className="block text-sm font-medium text-gray-700"
          >
            Employer Email <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            id="employerEmail"
            required
            value={data.employerEmail}
            onChange={(e) => updateData({ employerEmail: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="contact@techcorp.com"
          />
        </div>

        <div>
          <label
            htmlFor="employerPhone"
            className="block text-sm font-medium text-gray-700"
          >
            Employer Phone <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            id="employerPhone"
            required
            value={data.employerPhone}
            onChange={(e) => updateData({ employerPhone: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="(503) 555-0200"
          />
        </div>

        <div>
          <label
            htmlFor="employerAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Employer Address <span className="text-red-600">*</span>
          </label>
          <textarea
            id="employerAddress"
            required
            rows={3}
            value={data.employerAddress}
            onChange={(e) => updateData({ employerAddress: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="456 Business Parkway&#10;Portland, OR 97203"
          />
        </div>

        <div>
          <label
            htmlFor="employerBusinessDescription"
            className="block text-sm font-medium text-gray-700"
          >
            Business Description <span className="text-red-600">*</span>
          </label>
          <textarea
            id="employerBusinessDescription"
            required
            rows={3}
            value={data.employerBusinessDescription}
            onChange={(e) =>
              updateData({ employerBusinessDescription: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Describe the employer's trade, business, or profession"
          />
        </div>

        <div>
          <label
            htmlFor="subjectsOfInterest"
            className="block text-sm font-medium text-gray-700"
          >
            Subjects of Legislative Interest <span className="text-red-600">*</span>
          </label>
          <textarea
            id="subjectsOfInterest"
            required
            rows={4}
            value={data.subjectsOfInterest}
            onChange={(e) => updateData({ subjectsOfInterest: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="List the general subjects of legislative or administrative action that are of interest to the employer"
          />
          <p className="mt-1 text-xs text-gray-500">
            Examples: Technology policy, healthcare funding, transportation
            infrastructure, environmental regulations, etc.
          </p>
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
          Next: Upload Documents
        </button>
      </div>
    </form>
  )
}
