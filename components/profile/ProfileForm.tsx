/**
 * Profile Form Component
 * Allows users to edit their own name
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  defaultValues: {
    name: string;
    email: string;
  };
  onSuccess?: () => void;
}

export function ProfileForm({ defaultValues, onSuccess }: ProfileFormProps) {
  const [name, setName] = useState(defaultValues.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = name.trim() !== defaultValues.name;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Email (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={defaultValues.email}
          disabled
          className="bg-gray-50 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500">
          Email cannot be changed. Contact an administrator if you need to
          update your email address.
        </p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={255}
          placeholder="Your full name"
          disabled={loading}
        />
      </div>

      {/* Submit button */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading || !hasChanges}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Saving..." : "Save Changes"}
        </Button>
        {hasChanges && !loading && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setName(defaultValues.name)}
          >
            Reset
          </Button>
        )}
      </div>
    </form>
  );
}
