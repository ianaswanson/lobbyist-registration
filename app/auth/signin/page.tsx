import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { DemoCredentialsPanel } from "@/components/DemoCredentialsPanel";
import Link from "next/link";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;

  async function handleSignIn(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      // If successful, redirect manually
      redirect(params.callbackUrl || "/dashboard");
    } catch (error) {
      if (error instanceof AuthError) {
        // Redirect back to signin with error
        redirect(`/auth/signin?error=CredentialsSignin`);
      }
      throw error;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {/* Demo Credentials Panel - bottom center */}
      <DemoCredentialsPanel />

      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-8 shadow-lg">
        <div className="text-center">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">
            Lobbyist Registration System
          </h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        {params.error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Invalid email or password. Please try again.
            </p>
          </div>
        )}

        <form action={handleSignIn} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Sign in
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">Don&apos;t have an account?</p>
          <p className="text-xs">
            Contact Multnomah County staff to request access.
          </p>
        </div>
      </div>
    </div>
  );
}
