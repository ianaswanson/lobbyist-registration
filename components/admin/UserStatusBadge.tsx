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
  const variants: Record<
    UserStatus,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      className: string;
    }
  > = {
    ACTIVE: {
      variant: "default",
      className: "bg-success/20 text-success-foreground hover:bg-success/20",
    },
    INACTIVE: {
      variant: "secondary",
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    },
    SUSPENDED: {
      variant: "destructive",
      className: "bg-destructive/20 text-red-800 hover:bg-destructive/20",
    },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
}
