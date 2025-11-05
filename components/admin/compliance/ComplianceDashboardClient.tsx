"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertList } from "./AlertList";
import { ComplianceScore } from "./ComplianceScore";

interface ComplianceDashboardClientProps {
  overviewContent: React.ReactNode;
}

export function ComplianceDashboardClient({
  overviewContent,
}: ComplianceDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Compliance Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor registrations, deadlines, and compliance status
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">Compliance Alerts</TabsTrigger>
            <TabsTrigger value="score">Compliance Score</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">{overviewContent}</TabsContent>

          <TabsContent value="alerts">
            <AlertList />
          </TabsContent>

          <TabsContent value="score">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ComplianceScore />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Compliance Guidelines
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">
                          Excellent (90%+):{" "}
                        </strong>
                        All reports submitted on time, minimal violations
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-600 text-xs">!</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">
                          Needs Attention (75-89%):{" "}
                        </strong>
                        Some late reports, follow up with entities
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 text-xs">✕</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">
                          Critical (&lt;75%):{" "}
                        </strong>
                        Multiple overdue reports, violations may be necessary
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Automated Monitoring
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    The system automatically monitors for compliance issues and
                    generates alerts. Check the{" "}
                    <button
                      onClick={() => setActiveTab("alerts")}
                      className="text-primary hover:underline font-medium"
                    >
                      Compliance Alerts
                    </button>{" "}
                    tab to see active alerts.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      Unusual spending patterns detected automatically
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      Duplicate entries flagged for review
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      Overdue reports tracked and escalated
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      First-time filers receive extra attention
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
