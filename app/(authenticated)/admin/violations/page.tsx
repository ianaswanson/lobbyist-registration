import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ViolationsClient } from "./ViolationsClient";

export default async function ViolationsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <ViolationsClient />;
}
