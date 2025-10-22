import { ContractExceptionsPublicClient } from "./ContractExceptionsPublicClient";
import { PublicNavigation } from "@/components/PublicNavigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Contract Exceptions | Lobbyist Registry",
  description:
    "Public record of exceptions to Ordinance §9.230(C) 1-year cooling-off period for former County officials",
};

export default async function ContractExceptionsPublicPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavigation user={session?.user} />
      <ContractExceptionsPublicClient />
    </div>
  );
}
