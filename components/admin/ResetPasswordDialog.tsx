/**
 * Reset Password Dialog Component
 * Confirmation dialog for resetting user passwords
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
import { Copy, CheckCircle } from "lucide-react";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    email: string;
  };
  onConfirm: (userId: string) => Promise<{ tempPassword: string }>;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: ResetPasswordDialogProps) {
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await onConfirm(user.id);
      setTempPassword(result.tempPassword);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (tempPassword) {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setTempPassword(null);
    setCopied(false);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            {!tempPassword
              ? `Generate a new temporary password for ${user.name}?`
              : "Password has been reset successfully"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!tempPassword ? (
          <>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                This will:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                <li>Generate a secure temporary password</li>
                <li>Require password change on next login</li>
                <li>Display the password here (copy and share securely)</li>
                <li>Log the password to the console</li>
              </ul>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <Alert>
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">Temporary password generated:</p>
                  <div className="flex items-center gap-2 rounded-md bg-gray-100 p-3">
                    <code className="flex-1 font-mono text-sm">
                      {tempPassword}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopy}
                      className="shrink-0"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Share this password with <strong>{user.email}</strong> securely.
                    They will be required to change it on first login.
                  </p>
                  <p className="text-xs text-gray-500">
                    Note: The password has also been logged to the console.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
