"use client";

/**
 * Custom tooltip component for Recharts
 * Displays transaction information when hovering over chart elements
 */
export default function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-green-600">${payload[0].value}</p>
      </div>
    );
  }
  return null;
}
