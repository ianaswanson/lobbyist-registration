/**
 * User Status Badge Component
 * Visual indicator for user account status (Active/Inactive/Suspended)
 */

import { UserStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const variants: Record<UserStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    ACTIVE: {
      variant: "default",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    INACTIVE: {
      variant: "secondary",
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    },
    SUSPENDED: {
      variant: "destructive",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
}
