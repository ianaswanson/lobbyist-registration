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
    // Get employer record
    const employer = await prisma.employer.findUnique({
      where: { userId },
    });

    if (!employer) {
      return null;
    }

    // Fetch the report with all related data
    const report = await prisma.employerExpenseReport.findFirst({
      where: {
        id: reportId,
        employerId: employer.id,
      },
      include: {
        lineItems: {
          orderBy: {
            date: "desc",
          },
        },
        lobbyistPayments: {
          include: {
            lobbyist: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            amountPaid: "desc",
          },
        },
        employer: {
          select: {
            name: true,
          },
        },
      },
    });

    return report;
  } catch (error) {
    console.error("Error fetching employer expense report:", error);
    return null;
  }
}

export default async function EmployerReportDetailPage({ params }: PageProps) {
  const session = await auth();
  const resolvedParams = await params;

  if (!session || session.user?.role !== "EMPLOYER") {
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
  const totalPayments = report.lobbyistPayments.reduce(
    (sum, payment) => sum + payment.amountPaid,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/reports/employer"
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
                {report.employer.name}
              </p>
            </div>
            <div>{getStatusBadge(report.status)}</div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Total Lobbying Spend
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {formatCurrency(report.totalLobbyingSpend)}
              </dd>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Direct Expenses
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {formatCurrency(totalExpenses)}
              </dd>
              <dd className="mt-1 text-sm text-gray-500">
                {report.lineItems.length} items
              </dd>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Lobbyist Payments
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {formatCurrency(totalPayments)}
              </dd>
              <dd className="mt-1 text-sm text-gray-500">
                {report.lobbyistPayments.length} payments
              </dd>
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

        {/* Direct Expenses */}
        <div className="mb-6 rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Direct Expenses (Food, Entertainment, etc.)
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Itemized expenses over $50
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {report.lineItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                No direct expenses reported
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
                          {item.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.vendor || "N/A"}
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
                        Subtotal (Direct Expenses):
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

        {/* Lobbyist Payments */}
        <div className="mb-6 rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Lobbyist Payments
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Payments made to registered lobbyists
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {report.lobbyistPayments.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                No lobbyist payments reported
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Lobbyist Name
                      </th>
                      <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="bg-gray-50 px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {report.lobbyistPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                          {payment.lobbyist?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {payment.lobbyist?.email || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {payment.description || "Lobbying services"}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap text-gray-900">
                          {formatCurrency(payment.amountPaid)}
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
                        Subtotal (Lobbyist Payments):
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold whitespace-nowrap text-gray-900">
                        {formatCurrency(totalPayments)}
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
                Total Lobbying Spend
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Direct expenses + Lobbyist payments
              </p>
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {formatCurrency(report.totalLobbyingSpend)}
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
