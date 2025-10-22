import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MyViolationsClient } from "./MyViolationsClient";

export default async function MyViolationsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Only lobbyists and employers can see their violations
  if (session.user.role !== "LOBBYIST" && session.user.role !== "EMPLOYER") {
    redirect("/dashboard");
  }

  return (
    <MyViolationsClient userId={session.user.id} userRole={session.user.role} />
  );
}
