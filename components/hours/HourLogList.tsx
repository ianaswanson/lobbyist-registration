"use client"

interface HourLog {
  id: string
  activityDate: string
  hours: number
  description: string
  quarter: string
  year: number
  createdAt: string
}

interface Props {
  logs: HourLog[]
}

export function HourLogList({ logs }: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hour logs yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by logging your first lobbying activity above.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hours
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quarter
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(log.activityDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {log.hours.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {log.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {log.quarter} {log.year}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Row */}
      <div className="bg-gray-50 px-6 py-3 border-t-2 border-gray-300">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Total Entries: {logs.length}
          </span>
          <span className="text-sm font-medium text-gray-900">
            Total Hours: {logs.reduce((sum, log) => sum + log.hours, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
