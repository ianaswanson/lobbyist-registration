"use client";

import { useState } from "react";

interface ReviewActionsProps {
  entityName: string;
  onApprove: () => void;
  onReject: (notes: string) => void;
  onRequestClarification?: (notes: string) => void;
}

export function ReviewActions({
  entityName,
  onApprove,
  onReject,
  onRequestClarification,
}: ReviewActionsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showClarifyDialog, setShowClarifyDialog] = useState(false);
  const [notes, setNotes] = useState("");

  const handleApprove = () => {
    onApprove();
  };

  const handleRejectClick = () => {
    setShowRejectDialog(true);
    setNotes("");
  };

  const handleRejectSubmit = () => {
    onReject(notes);
    setShowRejectDialog(false);
    setNotes("");
  };

  const handleClarifyClick = () => {
    setShowClarifyDialog(true);
    setNotes("");
  };

  const handleClarifySubmit = () => {
    if (onRequestClarification) {
      onRequestClarification(notes);
    }
    setShowClarifyDialog(false);
    setNotes("");
  };

  const handleCancel = () => {
    setShowRejectDialog(false);
    setShowClarifyDialog(false);
    setNotes("");
  };

  // Reject dialog
  if (showRejectDialog) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rejection Reason *
          </label>
          <textarea
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="Explain why this is being rejected..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleRejectSubmit}
            disabled={!notes.trim()}
          >
            Submit Rejection
          </button>
        </div>
      </div>
    );
  }

  // Clarification dialog
  if (showClarifyDialog) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Clarification Request *
          </label>
          <textarea
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="What clarification is needed..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleClarifySubmit}
            disabled={!notes.trim()}
          >
            Submit Request
          </button>
        </div>
      </div>
    );
  }

  // Default action buttons
  return (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        onClick={handleRejectClick}
      >
        Reject
      </button>
      {onRequestClarification && (
        <button
          type="button"
          className="rounded-md border border-yellow-300 bg-white px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50"
          onClick={handleClarifyClick}
        >
          Request Clarification
        </button>
      )}
      <button
        type="button"
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        onClick={handleApprove}
      >
        Approve
      </button>
    </div>
  );
}
