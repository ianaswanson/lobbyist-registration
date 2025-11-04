"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ComplianceRateChartProps {
  data: {
    onTime: number;
    late: number;
    rate: number;
  };
}

export function ComplianceRateChart({ data }: ComplianceRateChartProps) {
  const chartData = [
    { name: "On-Time", value: data.onTime },
    { name: "Late", value: data.late },
  ];

  const COLORS = ["#16a34a", "#dc2626"];

  return (
    <div className="h-[400px] w-full">
      <div className="mb-4 text-center">
        <div className="text-4xl font-bold text-blue-800">{data.rate}%</div>
        <div className="text-sm text-gray-600">On-Time Submission Rate</div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) =>
              `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [value, `${name} Submissions`]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.375rem",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
