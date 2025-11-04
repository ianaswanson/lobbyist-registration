"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export function AlertCountBadge() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlertCount() {
      try {
        const response = await fetch("/api/admin/alerts/counts");
        if (response.ok) {
          const data = await response.json();
          setCount(data.total);
        }
      } catch (error) {
        console.error("Failed to fetch alert count:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAlertCount();

    // Refresh count every 60 seconds
    const interval = setInterval(fetchAlertCount, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || count === 0) {
    return null;
  }

  return (
    <Badge
      variant="destructive"
      className="ml-2 px-1.5 py-0.5 text-xs font-semibold"
    >
      {count}
    </Badge>
  );
}
