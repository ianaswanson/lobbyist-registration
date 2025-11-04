import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendIndicator } from "./TrendIndicator";
import { LucideIcon } from "lucide-react";

interface InsightCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendSuffix?: string;
  icon?: LucideIcon;
  formatter?: (value: number) => string;
}

export function InsightCard({
  title,
  value,
  subtitle,
  trend,
  trendSuffix = "%",
  icon: Icon,
  formatter,
}: InsightCardProps) {
  const displayValue =
    typeof value === "number" && formatter ? formatter(value) : value;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend !== undefined && trend !== null && (
          <div className="mt-2">
            <TrendIndicator value={trend} suffix={trendSuffix} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
