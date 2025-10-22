import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReviewRegistrationsList } from "@/components/admin/ReviewRegistrationsList";
import { prisma } from "@/lib/db";
import { RegistrationStatus } from "@prisma/client";

async function getPendingRegistrations() {
  try {
    const registrations = await prisma.lobbyist.findMany({
      where: {
        status: RegistrationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        employers: {
          include: {
            employer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc", // Oldest first
      },
    });

    return registrations;
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    return [];
  }
}

export default async function AdminReviewRegistrationsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const registrations = await getPendingRegistrations();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Review Lobbyist Registrations
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Review and approve or reject pending lobbyist registrations
              </p>
            </div>
            <a
              href="/admin/compliance"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </a>
          </div>
        </div>

        <ReviewRegistrationsList registrations={registrations} />
      </main>
    </div>
  );
}
