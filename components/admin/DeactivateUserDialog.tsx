/**
 * Deactivate User Dialog Component
 * Confirmation dialog for deactivating user accounts
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DeactivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onConfirm: (userId: string) => Promise<void>;
}

export function DeactivateUserDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: DeactivateUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await onConfirm(user.id);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to deactivate user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Deactivate User
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate this user account?
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="mt-1 text-xs text-gray-500">Role: {user.role}</p>
          </div>

          <Alert>
            <AlertDescription>
              <p className="font-medium">This action will:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                <li>Set the user status to INACTIVE</li>
                <li>Prevent the user from logging in</li>
                <li>Preserve all user data for audit purposes</li>
                <li>Create an audit log entry</li>
              </ul>
              <p className="mt-3 text-sm">
                The user can be reactivated later if needed.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deactivating..." : "Deactivate User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
