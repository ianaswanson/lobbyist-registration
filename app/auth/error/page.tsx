export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-8 text-center shadow-lg">
        <div className="text-red-600">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Authentication Error</h2>
        <p className="text-gray-600">
          There was a problem signing you in. Please check your credentials and
          try again.
        </p>
        <a
          href="/auth/signin"
          className="inline-block w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Back to Sign In
        </a>
      </div>
    </div>
  );
}
