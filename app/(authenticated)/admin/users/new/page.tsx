/**
 * Create New User Page
 * Admin form to create new user accounts
 */

"use client";

import { useRouter } from "next/navigation";
import { UserForm, UserFormData } from "@/components/admin/UserForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewUserPage() {
  const router = useRouter();

  const handleSubmit = async (data: UserFormData) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      const result = await response.json();

      // Show success message in console (temporary password logged there)
      console.log("✅ User created successfully:", result.user.email);
      console.log("📧 Check console logs above for welcome email and temp password");

      // Navigate back to users list
      router.push("/admin/users");
    } catch (error: any) {
      throw error; // UserForm will handle error display
    }
  };

  const handleCancel = () => {
    router.push("/admin/users");
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold">Create New User</h1>
        <p className="text-gray-600">
          Create a new user account with a temporary password
        </p>
      </div>

      {/* Info alert */}
      <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> A temporary password will be generated and logged to
          the console. The user will be required to change their password on first
          login.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-white p-6">
        <UserForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
