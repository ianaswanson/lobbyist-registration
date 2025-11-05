import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicNavigation } from "@/components/PublicNavigation";
import { auth } from "@/lib/auth";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getLobbyistDetails(lobbyistId: string) {
  try {
    const lobbyist = await prisma.lobbyist.findUnique({
      where: {
        id: lobbyistId,
        status: "APPROVED", // Only show approved lobbyists publicly
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        registrationDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        LobbyistEmployer: {
          where: {
            endDate: null, // Only active employments
          },
          select: {
            id: true,
            subjectsOfInterest: true,
            Employer: {
              select: {
                id: true,
                name: true,
                businessDescription: true,
              },
            },
          },
        },
        LobbyistExpenseReport: {
          where: {
            status: {
              in: ["APPROVED", "SUBMITTED"],
            },
          },
          orderBy: {
            year: "desc",
          },
          select: {
            id: true,
            quarter: true,
            year: true,
            totalFoodEntertainment: true,
            status: true,
            submittedAt: true,
          },
        },
      },
    });

    if (!lobbyist) {
      return null;
    }

    // Calculate total expenses across all reports
    const totalExpenses = lobbyist.LobbyistExpenseReport.reduce(
      (sum, report) => sum + report.totalFoodEntertainment,
      0
    );

    return {
      ...lobbyist,
      totalExpenses,
    };
  } catch (error) {
    console.error("Error fetching lobbyist details:", error);
    return null;
  }
}

export default async function PublicLobbyistDetailPage({ params }: PageProps) {
  const session = await auth();
  const resolvedParams = await params;

  const lobbyist = await getLobbyistDetails(resolvedParams.id);

  if (!lobbyist) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavigation user={session?.user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/search"
            className="mb-4 inline-flex items-center text-sm font-medium text-primary hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {lobbyist.name}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Registered Lobbyist - Multnomah County
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Registration Date
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatDate(lobbyist.registrationDate)}
              </dd>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Active Employers
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {lobbyist.LobbyistEmployer.length}
              </dd>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Total Reported Expenses
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(lobbyist.totalExpenses)}
              </dd>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-6 rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Contact Information
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a
                    href={`mailto:${lobbyist.email}`}
                    className="text-primary hover:underline"
                  >
                    {lobbyist.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{lobbyist.phone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {lobbyist.address}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Employers & Subjects */}
        {lobbyist.LobbyistEmployer.length > 0 && (
          <div className="mb-6 rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Employers & Lobbying Subjects
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {lobbyist.LobbyistEmployer.map((employment) => (
                  <div key={employment.id} className="border-l-4 border-primary pl-4">
                    <h4 className="text-base font-semibold text-gray-900">
                      {employment.Employer.name}
                    </h4>
                    {employment.Employer.businessDescription && (
                      <p className="mt-1 text-sm text-gray-600">
                        {employment.Employer.businessDescription}
                      </p>
                    )}
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-500">
                        Lobbying Subjects:
                      </span>
                      <p className="mt-1 text-sm text-gray-900">
                        {employment.subjectsOfInterest}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Expense Reports */}
        {lobbyist.LobbyistExpenseReport.length > 0 && (
          <div className="mb-6 rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Quarterly Expense Reports
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Food & entertainment expenses reported by this lobbyist
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Quarter
                      </th>
                      <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Submitted
                      </th>
                      <th className="bg-gray-50 px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Total Amount
                      </th>
                      <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {lobbyist.LobbyistExpenseReport.map((report) => (
                      <tr key={report.id}>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                          Q{report.quarter} {report.year}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {report.submittedAt
                            ? formatDate(report.submittedAt)
                            : "Not submitted"}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap text-gray-900">
                          {formatCurrency(report.totalFoodEntertainment)}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              report.status === "APPROVED"
                                ? "bg-success/20 text-success-foreground"
                                : "bg-primary/20 text-primary"
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan={2}
                        className="px-6 py-4 text-right text-sm font-medium text-gray-900"
                      >
                        Total:
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold whitespace-nowrap text-gray-900">
                        {formatCurrency(lobbyist.totalExpenses)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Public Record Notice */}
        <div className="rounded-lg border border-blue-200 bg-primary/10 p-6">
          <h3 className="mb-2 text-sm font-semibold text-blue-900">
            Public Record Notice
          </h3>
          <p className="text-sm text-primary">
            This information is a public record under Multnomah County ordinance.
            Data is updated quarterly and reflects information submitted by
            registered lobbyists. For questions or corrections, please contact the
            County Administrator's office.
          </p>
        </div>
      </main>
    </div>
  );
}
