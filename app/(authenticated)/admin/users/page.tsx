/**
 * Admin Users List Page
 * Browse, search, and manage all users in the system
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserRole, UserStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { UserTable } from "@/components/admin/UserTable";
import { ResetPasswordDialog } from "@/components/admin/ResetPasswordDialog";
import { DeactivateUserDialog } from "@/components/admin/DeactivateUserDialog";
import { UserAuditLogModal } from "@/components/admin/UserAuditLogModal";
import { Plus } from "lucide-react";

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function UsersPage() {
  const router = useRouter();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog state
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null);
  const [auditLogUser, setAuditLogUser] = useState<User | null>(null);

  // Debounce search query (500ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch users when debounced search or filters change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Action handlers
  const handleEdit = (userId: string) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/admin/users/${userId}/reset-password`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      const data = await response.json();
      return data; // Returns { tempPassword: string }
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeactivate = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to deactivate user");
      }

      // Refresh users list
      await fetchUsers();
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button onClick={() => router.push("/admin/users/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* User table - Always visible, with loading overlay */}
      <div className="relative">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
            <div className="flex items-center gap-2 rounded-md bg-white px-4 py-2 shadow-md">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              <p className="text-sm text-gray-600">Searching...</p>
            </div>
          </div>
        )}

        <UserTable
          users={users}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEdit={handleEdit}
          onResetPassword={(user) => setResetPasswordUser(user)}
          onDeactivate={(user) => setDeactivateUser(user)}
          onViewAuditLog={(user) => setAuditLogUser(user)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={!!resetPasswordUser}
        onOpenChange={(open) => !open && setResetPasswordUser(null)}
        user={resetPasswordUser || { id: "", name: "", email: "" }}
        onConfirm={handleResetPassword}
      />

      {/* Deactivate User Dialog */}
      <DeactivateUserDialog
        open={!!deactivateUser}
        onOpenChange={(open) => !open && setDeactivateUser(null)}
        user={deactivateUser || { id: "", name: "", email: "", role: "" }}
        onConfirm={handleDeactivate}
      />

      {/* Audit Log Modal */}
      <UserAuditLogModal
        open={!!auditLogUser}
        onOpenChange={(open) => !open && setAuditLogUser(null)}
        userId={auditLogUser?.id || ""}
        userName={auditLogUser?.name || ""}
      />
    </div>
  );
}
