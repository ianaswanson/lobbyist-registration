import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppealsClient } from "./AppealsClient"

export default async function AppealsPage() {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return <AppealsClient />
}
