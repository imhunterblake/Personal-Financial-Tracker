"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import EditTransactionModal from "../../components/EditTransactionModal";
import { getCategoryColor } from "../../utils/constants";
import DateRangeFilter from "../../components/DateRangeFilter";
import { BACKEND_URL, API_HEADERS } from "../../utils/apiHelpers";
import { filterByDateRange } from "../../utils/transactionHelpers";

function TransactionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management for transactions and sorting configuration
  const [transactions, setTransactions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "asc",
  }); // Default sort by date ascending
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Initialize date filters from URL query parameters
  useEffect(() => {
    const urlStartDate = searchParams.get("startDate");
    const urlEndDate = searchParams.get("endDate");
    if (urlStartDate) setStartDate(urlStartDate);
    if (urlEndDate) setEndDate(urlEndDate);
  }, [searchParams]);

  // Get filtered transactions using utility function
  const filteredTransactions = filterByDateRange(
    transactions,
    startDate,
    endDate,
  );

  // Fetch transactions when the component loads
  useEffect(() => {
    fetch(`${BACKEND_URL}/data/transactions`)
      .then((response) => response.json())
      .then((data) => setTransactions(data))
      .catch((error) => console.error("Error fetching transactions:", error));
  }, []);

  // Sort transactions based on sortConfig
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Handle column header click for sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle delete transaction
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/data/transactions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Transaction deleted successfully!");
        // Update the state to remove the deleted transaction
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } else {
        console.error("Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  // Handle update transaction
  const handleUpdateClick = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setEditingTransaction(null);
  };

  const handleUpdate = async (updatedData) => {
    console.log("Updated data:", updatedData);
    try {
      const response = await fetch(
        `${BACKEND_URL}/data/transactions/${updatedData.id}`,
        {
          method: "PATCH",
          headers: API_HEADERS,
          body: JSON.stringify(updatedData),
        },
      );
      if (response.ok) {
        console.log("Transaction updated successfully!");
        // Update state to update transaction
        setTransactions((prev) =>
          prev.map((t) => (t.id === updatedData.id ? updatedData : t)),
        );
      } else {
        console.error("Failed to update transaction");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  return (
    <div className="min-h-screen bg-stone-700">
      <div className="max-w-6xl mx-auto">
        {/* Back to Dashboard Link */}
        <Link
          href={`/?${new URLSearchParams(
            Object.fromEntries(
              Object.entries({ startDate, endDate }).filter(([_, v]) => v),
            ),
          ).toString()}`}
          className="text-green-300 hover:underline mb-4 inline-block pt-8 px-4"
        >
          ← Back to Dashboard
        </Link>

        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-6 text-white pt-8 px-4">
          All Transactions ({filteredTransactions.length})
        </h1>
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={(date) => {
            setStartDate(date);
            const params = new URLSearchParams(searchParams);
            if (date) {
              params.set("startDate", date);
            } else {
              params.delete("startDate");
            }
            router.push(`/transactions?${params.toString()}`);
          }}
          onEndDateChange={(date) => {
            setEndDate(date);
            const params = new URLSearchParams(searchParams);
            if (date) {
              params.set("endDate", date);
            } else {
              params.delete("endDate");
            }
            router.push(`/transactions?${params.toString()}`);
          }}
          onReset={() => {
            setStartDate("");
            setEndDate("");
            router.push("/transactions");
          }}
        />
        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mx-4 mb-8">
          {filteredTransactions.length === 0 ?
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No transactions found.</p>
              <p className="text-sm mt-2">
                {startDate || endDate ?
                  "Try adjusting your date filter."
                : "Add your first transaction to get started!"}
              </p>
            </div>
          : <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {/* Table Headers with Sorting */}
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => handleSort("date")}
                  >
                    Date{" "}
                    {sortConfig.key === "date" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => handleSort("description")}
                  >
                    Description{" "}
                    {sortConfig.key === "description" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => handleSort("category")}
                  >
                    Category{" "}
                    {sortConfig.key === "category" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => handleSort("amount")}
                  >
                    Amount{" "}
                    {sortConfig.key === "amount" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Render Transactions */}
                {sortedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {t.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {t.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {t.category}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right font-semibold"
                      style={{ color: getCategoryColor(t.category) }}
                    >
                      ${t.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {/* Update Button */}
                      <button
                        onClick={() => handleUpdateClick(t)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mx-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        Update
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      </div>
      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={isEditing}
        onClose={handleCloseModal}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionsPageContent />
    </Suspense>
  );
}
