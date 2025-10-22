"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      // Sign out without automatic redirect
      await signOut({ redirect: false });

      // Manually redirect after signout completes
      router.push("/auth/signin");
    };

    handleSignOut();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <p className="text-gray-600">Signing out...</p>
      </div>
    </div>
  );
}
