import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getReport(reportId: string, userId: string) {
  try {
    // Get lobbyist record
    const lobbyist = await prisma.lobbyist.findUnique({
      where: { userId },
    });

    if (!lobbyist) {
      return null;
    }

    // Fetch the report with all related data
    const report = await prisma.lobbyistExpenseReport.findFirst({
      where: {
        id: reportId,
        lobbyistId: lobbyist.id,
      },
      include: {
        lobbyist: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) return null;

    // Fetch lineItems separately (polymorphic relation)
    const lineItems = await prisma.expenseLineItem.findMany({
      where: {
        reportId: report.id,
        reportType: "LOBBYIST",
      },
      orderBy: {
        date: "desc",
      },
    });

    return { ...report, lineItems };
  } catch (error) {
    console.error("Error fetching lobbyist expense report:", error);
    return null;
  }
}

export default async function LobbyistReportDetailPage({ params }: PageProps) {
  const session = await auth();
  const resolvedParams = await params;

  if (!session || session.user?.role !== "LOBBYIST") {
    redirect("/auth/signin");
  }

  const report = await getReport(resolvedParams.id, session.user.id);

  if (!report) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      SUBMITTED: "bg-blue-100 text-blue-800",
      LATE: "bg-red-100 text-red-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      NEEDS_CLARIFICATION: "bg-yellow-100 text-yellow-800",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
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

  const totalExpenses = report.lineItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/reports/lobbyist"
            className="mb-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Q{report.quarter} {report.year} Expense Report
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {report.lobbyist.name}
              </p>
            </div>
            <div>{getStatusBadge(report.status)}</div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Total Food & Entertainment
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {formatCurrency(report.totalFoodEntertainment)}
              </dd>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Number of Expenses
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {report.lineItems.length}
              </dd>
              <dd className="mt-1 text-sm text-gray-500">itemized expenses</dd>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Due Date
              </dt>
              <dd className="mt-1 text-xl font-semibold text-gray-900">
                {formatDate(report.dueDate)}
              </dd>
              {report.submittedAt && (
                <dd className="mt-1 text-sm text-gray-500">
                  Submitted: {formatDate(report.submittedAt)}
                </dd>
              )}
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="mb-6 rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Food & Entertainment Expenses
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Itemized expenses over $50
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {report.lineItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                No expenses reported
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Vendor
                      </th>
                      <th className="bg-gray-50 px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {report.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.purpose}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.payee || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap text-gray-900">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-right text-sm font-medium text-gray-900"
                      >
                        Total:
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold whitespace-nowrap text-gray-900">
                        {formatCurrency(totalExpenses)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Grand Total */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900">
                Total Food & Entertainment Spend
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                All itemized expenses over $50
              </p>
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {formatCurrency(report.totalFoodEntertainment)}
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        {report.reviewNotes && (
          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow">
            <h3 className="mb-2 text-lg font-medium text-yellow-900">
              Admin Review Notes
            </h3>
            <p className="text-sm whitespace-pre-wrap text-yellow-800">
              {report.reviewNotes}
            </p>
            {report.reviewedAt && (
              <p className="mt-2 text-xs text-yellow-700">
                Reviewed on {formatDate(report.reviewedAt)}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
