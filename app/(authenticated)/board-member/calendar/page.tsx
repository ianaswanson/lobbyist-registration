import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BoardMemberCalendarForm } from "@/components/forms/board-member/BoardMemberCalendarForm";
import { DemoFilesPanel } from "@/components/DemoFilesPanel";

export default async function BoardMemberCalendarPage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Files Panel - bottom center */}
      <DemoFilesPanel page="board-calendar" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Quarterly Calendar & Lobbying Receipts
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Post your quarterly calendar and report lobbying receipts. Must be
            submitted within 15 days after quarter ends.
          </p>
        </div>

        <BoardMemberCalendarForm userId={session.user.id} />
      </main>
    </div>
  );
}
