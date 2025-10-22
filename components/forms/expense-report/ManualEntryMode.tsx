"use client";

import { useState } from "react";
import type { ExpenseLineItem } from "./LobbyistExpenseReportForm";

interface ManualEntryModeProps {
  onAdd: (expenses: ExpenseLineItem[]) => void;
}

export function ManualEntryMode({ onAdd }: ManualEntryModeProps) {
  const [formData, setFormData] = useState({
    officialName: "",
    date: "",
    payee: "",
    purpose: "",
    amount: "",
    isEstimate: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newExpense: ExpenseLineItem = {
      id: crypto.randomUUID(),
      officialName: formData.officialName,
      date: formData.date,
      payee: formData.payee,
      purpose: formData.purpose,
      amount: parseFloat(formData.amount),
      isEstimate: formData.isEstimate,
    };

    onAdd([newExpense]);

    // Reset form
    setFormData({
      officialName: "",
      date: "",
      payee: "",
      purpose: "",
      amount: "",
      isEstimate: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
        <p>
          <strong>Best for:</strong> 1-5 expense items. Use CSV Upload for 10+
          items.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="officialName"
            className="block text-sm font-medium text-gray-700"
          >
            Public Official Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="officialName"
            required
            value={formData.officialName}
            onChange={(e) =>
              setFormData({ ...formData, officialName: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="Commissioner Williams"
          />
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            id="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="payee"
          className="block text-sm font-medium text-gray-700"
        >
          Payee <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="payee"
          required
          value={formData.payee}
          onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          placeholder="Portland City Grill"
        />
        <p className="mt-1 text-xs text-gray-500">
          Name of restaurant, vendor, or recipient of payment
        </p>
      </div>

      <div>
        <label
          htmlFor="purpose"
          className="block text-sm font-medium text-gray-700"
        >
          Purpose <span className="text-red-600">*</span>
        </label>
        <textarea
          id="purpose"
          required
          rows={2}
          value={formData.purpose}
          onChange={(e) =>
            setFormData({ ...formData, purpose: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          placeholder="Lunch meeting to discuss technology infrastructure policy"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount <span className="text-red-600">*</span>
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="block w-full rounded-md border border-gray-300 py-2 pr-3 pl-7 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              placeholder="125.00"
            />
          </div>
        </div>

        <div className="flex items-end">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isEstimate}
              onChange={(e) =>
                setFormData({ ...formData, isEstimate: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              This is an estimate
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Expense Item
        </button>
      </div>
    </form>
  );
}
