import { Metadata } from "next";
import { AnalyticsClient } from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "Lobbying Analytics | Accountability Portal",
  description:
    "Visual analytics and trends for lobbying activity in Multnomah County",
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Lobbying Analytics
        </h1>
        <p className="text-gray-600">
          Visual insights into lobbying trends, spending patterns, and
          compliance rates for Multnomah County
        </p>
      </div>

      <AnalyticsClient />
    </div>
  );
}
