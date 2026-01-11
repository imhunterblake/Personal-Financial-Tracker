"use client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { getCategoryColor } from "../utils/constants";
import { groupAndSumBy } from "../utils/transactionHelpers";
import CustomTooltip from "./CustomTooltip";

export default function SpendingByCategory({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Spending by Category
        </h2>
        <p className="text-gray-500 text-center">No transactions to display</p>
      </div>
    );
  }

  // Use utility function to group and sum by category
  const totals = groupAndSumBy(transactions, "category");

  const chartData = Object.keys(totals).map((category) => ({
    name: category,
    value: totals[category],
    color: getCategoryColor(category),
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Spending by Category
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
