"use client";

interface Props {
  thresholdExceededDate: string | null;
  registrationDeadline: string | null;
  registrationStatus: string;
}

export function ThresholdAlert({
  thresholdExceededDate,
  registrationDeadline,
  registrationStatus,
}: Props) {
  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const isRegistered = registrationStatus === "APPROVED";
  const isPending = registrationStatus === "PENDING";

  // Calculate if deadline is approaching (within 1 day)
  const isDeadlineClose = registrationDeadline
    ? new Date(registrationDeadline).getTime() - Date.now() <
      24 * 60 * 60 * 1000
    : false;

  return (
    <div
      className={`rounded-lg border-l-4 p-6 shadow ${
        isRegistered
          ? "border-success bg-success/10"
          : isPending
            ? "border-yellow-500 bg-primary/10"
            : isDeadlineClose
              ? "border-destructive bg-destructive/10"
              : "border-orange-500 bg-primary/10"
      }`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {isRegistered ? (
            <svg
              className="h-6 w-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-orange-400"
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
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3
            className={`text-lg font-semibold ${
              isRegistered
                ? "text-success-foreground"
                : isDeadlineClose
                  ? "text-red-800"
                  : "text-orange-800"
            }`}
          >
            {isRegistered
              ? "✓ Registration Complete"
              : isPending
                ? "⏳ Registration Pending"
                : "⚠️ Registration Required"}
          </h3>

          <div className="mt-2 text-sm">
            {isRegistered ? (
              <p className="text-success">
                Your lobbyist registration is active. You're in compliance with
                the 10-hour threshold requirement.
              </p>
            ) : isPending ? (
              <div className="space-y-1 text-yellow-700">
                <p>Your registration is pending admin review.</p>
                <p className="font-medium">
                  Threshold exceeded: {formatDate(thresholdExceededDate)}
                </p>
                <p className="font-medium">
                  Registration deadline: {formatDate(registrationDeadline)}
                </p>
              </div>
            ) : (
              <div
                className={isDeadlineClose ? "text-destructive" : "text-orange-700"}
              >
                <p className="mb-2 font-medium">
                  You have exceeded 10 lobbying hours in this quarter.
                  Registration is required within 3 working days.
                </p>
                <div className="space-y-1">
                  <p>
                    <strong>Threshold exceeded:</strong>{" "}
                    {formatDate(thresholdExceededDate)}
                  </p>
                  <p className={isDeadlineClose ? "text-lg font-bold" : ""}>
                    <strong>Registration deadline:</strong>{" "}
                    {formatDate(registrationDeadline)}
                    {isDeadlineClose && " 🚨"}
                  </p>
                </div>

                <div className="mt-4">
                  <a
                    href="/register/lobbyist"
                    className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white ${
                      isDeadlineClose
                        ? "bg-red-600 hover:bg-red-700 focus:ring-destructive"
                        : "bg-orange-600 hover:bg-orange-700 focus:ring-primary"
                    } focus:ring-2 focus:ring-offset-2 focus:outline-none`}
                  >
                    Register Now →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
