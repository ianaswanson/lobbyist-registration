"use client"

interface ReviewActionsProps {
  entityName: string
  onApprove: () => void
  onReject: () => void
  onRequestClarification?: () => void
}

export function ReviewActions({
  entityName,
  onApprove,
  onReject,
  onRequestClarification,
}: ReviewActionsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Review Notes (Optional)
        </label>
        <textarea
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Add notes about this review..."
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          onClick={onReject}
        >
          Reject
        </button>
        {onRequestClarification && (
          <button
            type="button"
            className="rounded-md border border-yellow-300 bg-white px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50"
            onClick={onRequestClarification}
          >
            Request Clarification
          </button>
        )}
        <button
          type="button"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          onClick={onApprove}
        >
          Approve
        </button>
      </div>
    </div>
  )
}
