"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { groupAndSumBy } from "../utils/transactionHelpers";
import CustomTooltip from "./CustomTooltip";

export default function SpendingOverTime({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Spending Over Time
        </h2>
        <p className="text-gray-500 text-center">No transactions to display</p>
      </div>
    );
  }

  // Use utility function to group and sum by date
  const totals = groupAndSumBy(transactions, "date");

  const chartData = Object.keys(totals)
    .map((date) => ({
      name: date,
      value: totals[date],
    }))
    .sort((a, b) => new Date(a.name) - new Date(b.name));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Spending Over Time
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
