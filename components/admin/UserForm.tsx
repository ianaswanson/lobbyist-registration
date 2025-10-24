/**
 * User Form Component
 * Reusable form for creating and editing users
 */

"use client";

import { useState } from "react";
import { UserRole, UserStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFormProps {
  mode: "create" | "edit";
  defaultValues?: {
    email?: string;
    name?: string;
    role?: UserRole;
    status?: UserStatus;
  };
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
}

export interface UserFormData {
  email?: string;
  name: string;
  role: UserRole;
  status?: UserStatus;
}

export function UserForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: defaultValues?.email || "",
    name: defaultValues?.name || "",
    role: defaultValues?.role || UserRole.LOBBYIST,
    status: defaultValues?.status || UserStatus.ACTIVE,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Email field - only for create mode */}
      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="user@example.com"
            required
            disabled={loading}
          />
          <p className="text-sm text-gray-500">
            Email address cannot be changed after creation
          </p>
        </div>
      )}

      {/* Email field - display only for edit mode */}
      {mode === "edit" && defaultValues?.email && (
        <div className="space-y-2">
          <Label htmlFor="email-display">Email</Label>
          <Input
            id="email-display"
            type="email"
            value={defaultValues.email}
            disabled
            className="bg-gray-50"
          />
          <p className="text-sm text-gray-500">
            Email address is immutable and cannot be changed
          </p>
        </div>
      )}

      {/* Name field */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
          required
          disabled={loading}
        />
      </div>

      {/* Role field */}
      <div className="space-y-2">
        <Label htmlFor="role">
          Role <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.role}
          onValueChange={(value: UserRole) =>
            setFormData({ ...formData, role: value })
          }
          disabled={loading}
        >
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
            <SelectItem value={UserRole.LOBBYIST}>Lobbyist</SelectItem>
            <SelectItem value={UserRole.EMPLOYER}>Employer</SelectItem>
            <SelectItem value={UserRole.BOARD_MEMBER}>Board Member</SelectItem>
            <SelectItem value={UserRole.PUBLIC}>Public</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status field - only for edit mode */}
      {mode === "edit" && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: UserStatus) =>
              setFormData({ ...formData, status: value })
            }
            disabled={loading}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
              <SelectItem value={UserStatus.SUSPENDED}>Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Form actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : mode === "create"
              ? "Create User"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
