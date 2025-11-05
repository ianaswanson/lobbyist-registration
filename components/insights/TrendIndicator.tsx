import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendIndicatorProps {
  value: number;
  suffix?: string;
}

export function TrendIndicator({ value, suffix = "%" }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  return (
    <div
      className={`flex items-center gap-1 text-sm font-medium ${
        isPositive
          ? "text-green-600"
          : isNegative
            ? "text-red-600"
            : "text-gray-500"
      }`}
    >
      {isPositive && <TrendingUp className="h-4 w-4" />}
      {isNegative && <TrendingDown className="h-4 w-4" />}
      {isNeutral && <Minus className="h-4 w-4" />}
      <span>
        {isPositive && "+"}
        {Math.abs(value)}
        {suffix}
      </span>
    </div>
  );
}
