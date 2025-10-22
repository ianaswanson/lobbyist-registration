"use client";

import { useState } from "react";
import {
  checkExemption,
  type ExemptionCheckData,
  type ExemptionResult,
} from "@/lib/exemption-checker";

export function ExemptionChecker() {
  const [formData, setFormData] = useState<ExemptionCheckData>({
    hoursPerQuarter: 0,
    isNewsMedia: false,
    isGovernmentOfficial: false,
    isPublicTestimonyOnly: false,
    isRespondingToCountyRequest: false,
    isAdvisoryCommitteeMember: false,
  });

  const [result, setResult] = useState<ExemptionResult | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const exemptionResult = checkExemption(formData);
    setResult(exemptionResult);
  };

  const handleReset = () => {
    setFormData({
      hoursPerQuarter: 0,
      isNewsMedia: false,
      isGovernmentOfficial: false,
      isPublicTestimonyOnly: false,
      isRespondingToCountyRequest: false,
      isAdvisoryCommitteeMember: false,
    });
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Informational Header */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-900">
          Do I Need to Register as a Lobbyist?
        </h3>
        <p className="text-sm text-blue-700">
          Use this tool to determine if you are required to register as a
          lobbyist under Multnomah County ordinance. Answer the questions below
          honestly to see if any exemptions apply to your situation.
        </p>
      </div>

      <form onSubmit={handleCheck} className="space-y-6">
        {/* Hours per Quarter */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4">
            <label
              htmlFor="hoursPerQuarter"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              How many hours per quarter do you spend on lobbying activities?
              <span className="text-red-600">*</span>
            </label>
            <p className="mb-3 text-xs text-gray-500">
              Include time spent communicating with public officials to
              influence legislative or administrative action. Do NOT include
              travel time.
            </p>
            <input
              type="number"
              id="hoursPerQuarter"
              required
              min="0"
              step="0.5"
              value={formData.hoursPerQuarter}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hoursPerQuarter: parseFloat(e.target.value) || 0,
                })
              }
              className="block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., 15"
            />
          </div>

          <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-600">
            <strong>Tip:</strong> A quarter is a 3-month period. If you spend 10
            hours or less per quarter, you are generally exempt from
            registration.
          </div>
        </div>

        {/* Exemption Questions */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h4 className="mb-4 font-semibold text-gray-900">
            Check any that apply to you:
          </h4>

          <div className="space-y-4">
            {/* News Media */}
            <label className="flex cursor-pointer items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.isNewsMedia}
                onChange={(e) =>
                  setFormData({ ...formData, isNewsMedia: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">I am news media</div>
                <div className="text-sm text-gray-600">
                  You are engaged in publishing or broadcasting news to the
                  general public
                </div>
              </div>
            </label>

            {/* Government Official */}
            <label className="flex cursor-pointer items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.isGovernmentOfficial}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isGovernmentOfficial: e.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">
                  I am a government official
                </div>
                <div className="text-sm text-gray-600">
                  You are acting in your official capacity as an elected
                  official or government employee
                </div>
              </div>
            </label>

            {/* Public Testimony Only */}
            <label className="flex cursor-pointer items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.isPublicTestimonyOnly}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isPublicTestimonyOnly: e.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">
                  I only give public testimony
                </div>
                <div className="text-sm text-gray-600">
                  You only provide public testimony and do not engage in other
                  lobbying activities
                </div>
              </div>
            </label>

            {/* County Request */}
            <label className="flex cursor-pointer items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.isRespondingToCountyRequest}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isRespondingToCountyRequest: e.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">
                  I am responding to a County request
                </div>
                <div className="text-sm text-gray-600">
                  You are responding to a direct request from Multnomah County
                  for information or participation
                </div>
              </div>
            </label>

            {/* Advisory Committee */}
            <label className="flex cursor-pointer items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.isAdvisoryCommitteeMember}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isAdvisoryCommitteeMember: e.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">
                  I serve on an advisory committee
                </div>
                <div className="text-sm text-gray-600">
                  You are a participant in an advisory committee, commission, or
                  workgroup
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          {result && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          )}
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Check My Status
          </button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div
          className={`rounded-lg border-2 p-6 ${
            result.isExempt
              ? "border-green-200 bg-green-50"
              : "border-orange-200 bg-orange-50"
          }`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 ${
                result.isExempt ? "text-green-600" : "text-orange-600"
              }`}
            >
              {result.isExempt ? (
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`font-semibold ${
                  result.isExempt ? "text-green-900" : "text-orange-900"
                } mb-2`}
              >
                {result.isExempt
                  ? "You are EXEMPT from registration"
                  : "You MUST register as a lobbyist"}
              </h4>
              <p
                className={`text-sm ${
                  result.isExempt ? "text-green-700" : "text-orange-700"
                } mb-4`}
              >
                {result.reason}
              </p>

              {result.mustRegister && result.registrationDeadline && (
                <div className="mt-4 rounded-md bg-orange-100 p-4">
                  <p className="mb-2 text-sm font-semibold text-orange-900">
                    Registration Deadline:
                  </p>
                  <p className="text-sm text-orange-800">
                    You must register within 3 working days after exceeding 10
                    hours of lobbying activity in a quarter. Based on today's
                    date, your deadline would be:{" "}
                    <strong>{result.registrationDeadline}</strong>
                  </p>
                </div>
              )}

              {result.mustRegister && (
                <div className="mt-4">
                  <a
                    href="/auth/signin?callbackUrl=/register/lobbyist"
                    className="inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                  >
                    Sign In to Register
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
                  </a>
                  <p className="mt-2 text-xs text-orange-700">
                    You'll need to sign in or create an account to complete your
                    registration
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
        <h4 className="mb-2 font-semibold text-gray-900">
          Important Information:
        </h4>
        <ul className="list-inside list-disc space-y-1">
          <li>
            This tool provides guidance only and is not a legal determination
          </li>
          <li>
            If you are unsure about your status, consult with Multnomah County
            staff or legal counsel
          </li>
          <li>
            Registration must be completed within 3 working days after exceeding
            10 hours of lobbying per quarter
          </li>
          <li>
            Penalties may apply for failure to register when required (up to
            $500 per violation)
          </li>
        </ul>
      </div>
    </div>
  );
}
