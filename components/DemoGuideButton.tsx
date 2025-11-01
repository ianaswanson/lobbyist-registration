"use client";

import { useState } from "react";

export function DemoGuideButton() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="relative">
        {/* Dismiss button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-600 text-xs font-bold text-white shadow-lg hover:bg-gray-700"
          aria-label="Dismiss demo guide button"
        >
          ×
        </button>

        {/* Main button */}
        <a
          href="/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          aria-label="Open documentation hub in new tab"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Learn More</span>
        </a>
      </div>
    </div>
  );
}
