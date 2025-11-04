import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SkipLink } from "@/components/SkipLink";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-white">
      <SkipLink />
      <main
        id="main-content"
        className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account information and security settings.
          </p>
        </div>

        {/* Profile Information Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your name and view your account details. Email addresses
              cannot be changed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              defaultValues={{
                name: session.user.name || "",
                email: session.user.email || "",
              }}
            />
          </CardContent>
        </Card>

        <div className="my-8 border-t border-gray-200" />

        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure. Your new
              password must meet the strength requirements shown below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>

        {/* Account Information (Read-only) */}
        <div className="mt-8 rounded-lg bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {session.user.id}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {session.user.role}
              </dd>
            </div>
            {session.user.email && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Email Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {session.user.email}
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-4 text-xs text-gray-500">
            To update your email address or role, please contact a system
            administrator.
          </p>
        </div>
      </main>
    </div>
  );
}
