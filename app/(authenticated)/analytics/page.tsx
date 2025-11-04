import { redirect } from "next/navigation";

export default function AnalyticsRedirect() {
  // Redirect to unified Transparency Dashboard
  redirect("/transparency");
}
