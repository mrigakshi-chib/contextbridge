"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendPoint = {
  week: string;
  independentSuccessRate: number;
  promptDependencyRate: number;
  observationCount: number;
};

export default function ProgressTrendChart({
  data,
}: {
  data: TrendPoint[];
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
          />

          <XAxis
            dataKey="week"
            tick={{
              fontSize: 12,
              fill: "#64748b",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            domain={[0, 100]}
            tick={{
              fontSize: 12,
              fill: "#64748b",
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              `${value}%`
            }
          />

          <Tooltip
            formatter={(
              value,
              name
            ) => {
              const label =
                name ===
                "independentSuccessRate"
                  ? "Independent success"
                  : "Prompt dependency";

              return [
                `${value}%`,
                label,
              ];
            }}
            labelFormatter={(label) =>
              `${label}`
            }
          />

          <Legend
            formatter={(value) =>
              value ===
              "independentSuccessRate"
                ? "Independent success"
                : "Prompt dependency"
            }
          />

          <Line
            type="monotone"
            dataKey="independentSuccessRate"
            stroke="#0f766e"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: "#0f766e",
            }}
            activeDot={{ r: 6 }}
          />

          <Line
            type="monotone"
            dataKey="promptDependencyRate"
            stroke="#d97706"
            strokeWidth={3}
            strokeDasharray="6 4"
            dot={{
              r: 4,
              fill: "#d97706",
            }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}