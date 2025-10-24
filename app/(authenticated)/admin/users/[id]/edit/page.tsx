/**
 * Edit User Page
 * Admin form to edit existing user accounts
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { UserRole, UserStatus } from "@prisma/client";
import { UserForm, UserFormData } from "@/components/admin/UserForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err: any) {
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }

      const result = await response.json();
      console.log("✅ User updated successfully:", result.user.email);

      // Navigate back to users list
      router.push("/admin/users");
    } catch (error: any) {
      throw error; // UserForm will handle error display
    }
  };

  const handleCancel = () => {
    router.push("/admin/users");
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading user...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
        <Button variant="outline" onClick={handleCancel} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <div className="rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">User not found</p>
        </div>
        <Button variant="outline" onClick={handleCancel} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-gray-600">Update user account details</p>
      </div>

      {/* Info alert */}
      <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Email addresses cannot be changed. If you need
          to change a user's email, create a new account and deactivate this
          one.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-white p-6">
        <UserForm
          mode="edit"
          defaultValues={{
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
