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

interface RegistrationGrowthChartProps {
  data: Array<{
    month: string;
    count: number;
  }>;
}

export function RegistrationGrowthChart({
  data,
}: RegistrationGrowthChartProps) {
  // Format month labels to be more readable (YYYY-MM -> Mon YYYY)
  const formattedData = data.map((item) => {
    const [year, month] = item.month.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = monthNames[parseInt(month) - 1];
    return {
      ...item,
      monthLabel: `${monthName} ${year}`,
    };
  });

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis
            dataKey="monthLabel"
            className="text-sm"
            label={{
              value: "Month",
              position: "insideBottom",
              offset: -5,
            }}
            interval="preserveStartEnd"
          />
          <YAxis
            className="text-sm"
            label={{
              value: "Total Registered Lobbyists",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={(value: number) => [value, "Registered Lobbyists"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.375rem",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ fill: "#16a34a", r: 4 }}
            activeDot={{ r: 6 }}
            name="Registered Lobbyists"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
