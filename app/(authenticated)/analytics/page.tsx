import { notFound } from "next/navigation"
import { AnalyticsClient } from "./AnalyticsClient"
import { FEATURE_FLAGS } from "@/lib/feature-flags"

export default async function AnalyticsPage() {
  // Check if feature is enabled
  if (!FEATURE_FLAGS.ANALYTICS_DASHBOARD) {
    notFound()
  }

  return <AnalyticsClient />
}
