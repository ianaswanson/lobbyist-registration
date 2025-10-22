import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ContractExceptionsClient } from "./ContractExceptionsClient";

export default async function ContractExceptionsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <ContractExceptionsClient />;
}
