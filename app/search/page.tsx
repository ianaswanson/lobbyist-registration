import { SearchClient } from "./SearchClient"
import { auth } from "@/lib/auth"

export default async function SearchPage() {
  const session = await auth()

  return <SearchClient user={session?.user} />
}
