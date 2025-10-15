import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export default function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string }
}) {
  async function handleSignIn(formData: FormData) {
    "use server"

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: searchParams.callbackUrl || "/dashboard",
      })
    } catch (error) {
      if (error instanceof AuthError) {
        return redirect(`/auth/signin?error=CredentialsSignin`)
      }
      throw error
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Lobbyist Registration System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {searchParams.error && (
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign in
          </button>
        </form>

        <div className="text-center text-sm">
          <a
            href="/auth/signup"
            className="text-blue-600 hover:text-blue-500"
          >
            Don&apos;t have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  )
}
