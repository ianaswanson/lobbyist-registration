/**
 * User Audit Log Modal Component
 * Displays complete audit history for a user
 */

"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AuditLogEntry {
  id: string;
  action: string;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  ipAddress: string | null;
  createdAt: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

interface UserAuditLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function UserAuditLogModal({
  open,
  onOpenChange,
  userId,
  userName,
}: UserAuditLogModalProps) {
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId) {
      fetchAuditLog();
    }
  }, [open, userId]);

  const fetchAuditLog = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/audit-log`);
      if (!response.ok) {
        throw new Error("Failed to fetch audit log");
      }
      const data = await response.json();
      setAuditLog(data.auditLog);
    } catch (err: any) {
      setError(err.message || "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATED: "bg-blue-100 text-blue-800",
      UPDATED: "bg-green-100 text-green-800",
      DEACTIVATED: "bg-red-100 text-red-800",
      ACTIVATED: "bg-green-100 text-green-800",
      SUSPENDED: "bg-orange-100 text-orange-800",
      PASSWORD_RESET: "bg-purple-100 text-purple-800",
      ROLE_CHANGED: "bg-yellow-100 text-yellow-800",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Audit Log: {userName}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">Loading audit log...</p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!loading && !error && auditLog.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">No audit log entries found</p>
            </div>
          )}

          {!loading && !error && auditLog.length > 0 && (
            <div className="space-y-4">
              {auditLog.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getActionBadgeColor(entry.action)}
                          variant="secondary"
                        >
                          {entry.action}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>

                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">
                          By: {entry.admin.name} ({entry.admin.email})
                        </p>
                        {entry.ipAddress && (
                          <p className="text-xs text-gray-500">
                            IP: {entry.ipAddress}
                          </p>
                        )}
                      </div>

                      {entry.changes && Object.keys(entry.changes).length > 0 && (
                        <div className="mt-3 rounded-md bg-gray-50 p-3">
                          <p className="text-xs font-medium text-gray-700">
                            Changes:
                          </p>
                          <div className="mt-2 space-y-1">
                            {Object.entries(entry.changes).map(
                              ([field, change]) => (
                                <div key={field} className="text-xs">
                                  <span className="font-medium">{field}:</span>
                                  <span className="ml-1 text-red-600">
                                    {String(change.old || "null")}
                                  </span>
                                  <span className="mx-1">→</span>
                                  <span className="text-green-600">
                                    {String(change.new || "null")}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
