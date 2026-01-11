"use client";

export default function SummaryCards({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  // Calculate total spent
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate transaction count
  const transactionCount = transactions.length;

  // Calculate average
  const averageTransaction = Math.round(totalSpent / transactionCount);

  // Find top category
  const categoryTotals = {};

  transactions.forEach((t) => {
    if (categoryTotals[t.category]) {
      categoryTotals[t.category] += t.amount;
    } else {
      categoryTotals[t.category] = t.amount;
    }
  });

  // Find which category has highest total
  const topCategory = Object.keys(categoryTotals).reduce((top, category) =>
    categoryTotals[category] > categoryTotals[top] ? category : top
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Total Spent */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-500 text-sm">Total Spent</p>
          <p className="text-3xl font-bold text-red-600">${totalSpent}</p>
        </div>

        {/* Card 2: Transaction Count */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-500 text-sm">Transactions</p>
          <p className="text-3xl font-bold text-blue-600">{transactionCount}</p>
        </div>

        {/* Card 3: Average */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-500 text-sm">Average</p>
          <p className="text-3xl font-bold text-green-600">
            ${averageTransaction}
          </p>
        </div>

        {/* Card 4: Top Category */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-500 text-sm">Top Category</p>
          <p className="text-3xl font-bold text-purple-600">{topCategory}</p>
        </div>
      </div>
    </div>
  );
}
