"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewActions } from "./ReviewActions";

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  hoursCurrentQuarter: number;
  status: string;
  user: {
    name: string;
    email: string;
  };
  employers: Array<{
    employer: {
      name: string;
    };
    subjectsOfInterest: string;
  }>;
  createdAt: string;
}

interface ReviewRegistrationsListProps {
  registrations: Registration[];
}

export function ReviewRegistrationsList({
  registrations: initialRegistrations,
}: ReviewRegistrationsListProps) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleReview = async (
    registrationId: string,
    action: "approve" | "reject",
    notes?: string
  ) => {
    setLoadingId(registrationId);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/registrations/${registrationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action, notes }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process review");
      }

      // Show success message
      setMessage({
        type: "success",
        text: data.message,
      });

      // Remove the reviewed registration from the list
      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));

      // Refresh the page data after a short delay
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Error reviewing registration:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to process review",
      });
    } finally {
      setLoadingId(null);
    }
  };

  if (registrations.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          No Pending Registrations
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          All registrations have been reviewed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className="text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {registrations.map((registration) => {
        const isLoading = loadingId === registration.id;
        const primaryEmployer = registration.employers[0];
        const submittedDate = new Date(
          registration.createdAt
        ).toLocaleDateString();

        return (
          <div
            key={registration.id}
            className={`rounded-lg border bg-white p-6 shadow-sm ${
              isLoading ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {registration.name}
                  </h3>
                  <span className="ml-3 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                    Pending Review
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {registration.email}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                Submitted {submittedDate}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Employer
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {primaryEmployer ? primaryEmployer.employer.name : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Hours This Quarter
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {registration.hoursCurrentQuarter} hours
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Subjects of Interest
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {primaryEmployer ? primaryEmployer.subjectsOfInterest : "N/A"}
                </p>
              </div>
            </div>

            {/* Review Actions */}
            <div className="mt-6 border-t pt-4">
              {isLoading && (
                <div className="mb-4 flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">
                    Processing...
                  </span>
                </div>
              )}
              <ReviewActions
                entityName={registration.name}
                onApprove={() => handleReview(registration.id, "approve")}
                onReject={(notes) =>
                  handleReview(registration.id, "reject", notes)
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
