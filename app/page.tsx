import { SkipLink } from "@/components/SkipLink"
import { PublicNavigation } from "@/components/PublicNavigation"
import { auth } from "@/lib/auth"

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLink />
      <PublicNavigation user={session?.user} />

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Multnomah County
            <br />
            Lobbyist Registration System
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Promoting transparency and accountability in county government
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Exemption Checker */}
          <a
            href="/exemption-checker"
            className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-green-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Check if you need to register as a lobbyist"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Do I Need to Register?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Use our exemption checker tool to determine if you are required to
              register as a lobbyist
            </p>
            <div className="mt-4 flex items-center text-sm font-medium text-green-600 group-hover:text-green-700" aria-hidden="true">
              Check now
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>

          {/* Search Lobbyists */}
          <a
            href="/search"
            className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Search the lobbyist registry"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Search Lobbyist Registry
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Search the public database of registered lobbyists and view their
              expense reports
            </p>
            <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700" aria-hidden="true">
              Search now
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>

          {/* View Board Calendars */}
          <a
            href="/board-calendars"
            className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-purple-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="View board member calendars and lobbying receipts"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Board Member Calendars
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              View quarterly calendars and lobbying receipts for county board
              members
            </p>
            <div className="mt-4 flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700" aria-hidden="true">
              View calendars
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>
        </div>

        {/* Information Section */}
        <div className="mt-16 rounded-lg border bg-white p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            About This System
          </h3>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600">
              This system implements Multnomah County's lobbying ordinance,
              which requires certain individuals and organizations to register
              and report their lobbying activities. The goal is to increase
              transparency and help the public understand who is attempting to
              influence county decisions.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  For Lobbyists
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Register within 3 working days after exceeding 10 hours/quarter</li>
                  <li>• Submit quarterly expense reports</li>
                  <li>• Update registration when information changes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  For the Public
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Search registered lobbyists</li>
                  <li>• View expense reports</li>
                  <li>• Access board member calendars</li>
                  <li>• Download data for analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Questions?
          </h3>
          <p className="text-sm text-blue-700">
            Contact Multnomah County staff at{" "}
            <a
              href="mailto:lobbying@multco.us"
              className="font-medium underline hover:text-blue-800"
            >
              lobbying@multco.us
            </a>
            {" "}or call (503) 988-3308
          </p>
        </div>
      </main>

      <footer className="border-t bg-white py-8 mt-16" role="contentinfo">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 Multnomah County. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
