import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { TransparencyClient } from "./TransparencyClient";

export const metadata: Metadata = {
  title: "Transparency Dashboard | Accountability Portal",
  description:
    "Comprehensive lobbying data, metrics, and visualizations for Multnomah County",
};

export default async function TransparencyPage() {
  const session = await auth();

  return <TransparencyClient user={session?.user} />;
}
