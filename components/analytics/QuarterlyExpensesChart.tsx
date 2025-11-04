"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface QuarterlyExpensesChartProps {
  data: Array<{
    quarter: string;
    total: number;
  }>;
}

export function QuarterlyExpensesChart({ data }: QuarterlyExpensesChartProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis
            dataKey="quarter"
            className="text-sm"
            label={{
              value: "Quarter",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            className="text-sm"
            label={{
              value: "Total Expenses ($)",
              angle: -90,
              position: "insideLeft",
            }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value: number) => [
              `$${value.toLocaleString()}`,
              "Total Expenses",
            ]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.375rem",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#1e40af"
            strokeWidth={2}
            dot={{ fill: "#1e40af", r: 4 }}
            activeDot={{ r: 6 }}
            name="Total Expenses"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
