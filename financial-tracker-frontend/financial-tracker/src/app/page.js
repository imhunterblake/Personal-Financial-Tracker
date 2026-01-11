"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import EditTransactionModal from "../components/EditTransactionModal";
import SpendingByCategory from "../components/SpendingByCategory";
import SpendingOverTime from "../components/SpendingOverTime";
import SummaryCards from "../components/SummaryCards";
import { getCategoryColor } from "../utils/constants";
import DateRangeFilter from "../components/DateRangeFilter";
import { BACKEND_URL, API_HEADERS } from "../utils/apiHelpers";
import { filterByDateRange } from "../utils/transactionHelpers";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState([]);

  // State variables for the form
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("select-one");
  const [date, setDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
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
  const filteredTransactions = filterByDateRange(transactions, startDate, endDate);

  //Get last 3 transactions efficiently
  const recentTransactions = filteredTransactions.length <= 3
    ? [...filteredTransactions].reverse()
    : [
        filteredTransactions[filteredTransactions.length - 1],
        filteredTransactions[filteredTransactions.length - 2],
        filteredTransactions[filteredTransactions.length - 3]
      ];

  // Fetch transactions when the component loads
  useEffect(() => {
    fetch(`${BACKEND_URL}/data/transactions`)
      .then((response) => response.json())
      .then((data) => setTransactions(data))
      .catch((error) => console.error("Error fetching transactions:", error));
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page refresh

    // Creates the transaction object from form data
    const newTransaction = {
      description: description,
      amount: parseInt(amount), // Convert to number
      category: category,
      date: date,
      id: Date.now(), // Generates an ID using timestamp
    };

    // Send to backend
    try {
      const response = await fetch(`${BACKEND_URL}/data/transactions`, {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify(newTransaction),
      });

      if (response.ok) {
        console.log("Transaction saved successfully!");
        // Clear the form
        setDescription("");
        setAmount("");
        setCategory("select-one");
        setDate("");
        // Refresh transaction list
        fetch(`${BACKEND_URL}/data/transactions`)
          .then((response) => response.json())
          .then((data) => setTransactions(data))
          .catch((error) =>
            console.error("Error refreshing transactions:", error)
          );
      } else {
        console.error("Failed to save transaction");
      }
    } catch (error) {
      console.error("Error:", error);
    }
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
        }
      );
      if (response.ok) {
        console.log("Transaction updated successfully!");
        // Update state to update transaction
        setTransactions((prev) =>
          prev.map((t) => (t.id === updatedData.id ? updatedData : t))
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
      <div className="text-center">
        <div className="bg-green-300 p-4 flex flex-row items-center sticky top-0 z-50 shadow-md">
          {/* Logo */}
          <img
            src="/images/financial-icon.png"
            alt="Financial Logo"
            className="w-20"
          />

          {/* Title - Centered */}
          <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
            Personal Financial Tracker
          </h1>

          {/* Navigation Links - Right side */}
          <nav className="flex gap-8 ml-auto text-lg">
            <a
              href="#summary"
              className="font-semibold hover:underline cursor-pointer transition-all"
            >
              Summary
            </a>
            <a
              href="#add-transaction"
              className="font-semibold hover:underline cursor-pointer transition-all"
            >
              Add
            </a>
            <a
              href="#recent"
              className="font-semibold hover:underline cursor-pointer transition-all"
            >
              Recent
            </a>
            <a
              href="#analytics"
              className="font-semibold hover:underline cursor-pointer transition-all"
            >
              Analytics
            </a>
          </nav>
        </div>
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
            router.push(`/?${params.toString()}`);
          }}
          onEndDateChange={(date) => {
            setEndDate(date);
            const params = new URLSearchParams(searchParams);
            if (date) {
              params.set("endDate", date);
            } else {
              params.delete("endDate");
            }
            router.push(`/?${params.toString()}`);
          }}
          onReset={() => {
            setStartDate("");
            setEndDate("");
            router.push("/");
          }}
         />
        {/* Summary Cards */}
        <div id="summary" className="pt-6">
          <SummaryCards transactions={filteredTransactions} />
        </div>
        {/* Add Transaction */}
        <div id="add-transaction" className="max-w-6xl mx-auto pt-8 pb-10 px-4">
          <h2 className="text-2xl text-white font-bold mb-4 text-center">
            Add a Transaction
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col rounded-lg p-6 bg-white shadow-lg"
          >
            <label className="font-semibold w-full block max-w-2xl mx-auto">
              Description:
              <input
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="border-2 rounded-sm mb-2 p-2 w-full appearance-none focus:outline-none focus:appearance-none focus:border-violet-300 text-center"
              />
            </label>
            <label className="font-semibold w-full block max-w-2xl mx-auto">
              Amount:
              <input
                name="amount"
                type="number"
                onChange={(e) => setAmount(e.target.value)}
                required
                value={amount}
                className="border-2 rounded-sm appearance-none focus:outline-none focus:appearance-none p-2 mb-2 w-full focus:border-violet-300 text-center"
              />
            </label>
            <label className="font-semibold w-full block max-w-2xl mx-auto">
              Category:
              <select
                name="category"
                onChange={(e) => setCategory(e.target.value)}
                required
                value={category}
                className="border-2 rounded-sm p-2 mb-2 w-full w-50 appearance-none focus:outline-none focus:appearance-none focus:border-violet-300 text-center"
              >
                <option value="select-one">Select a Category</option>
                <option value="Take-Out">Take-Out</option>
                <option value="Bill">Bill</option>
                <option value="Gas">Gas</option>
                <option value="Groceries">Groceries</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </label>
            <label className="font-semibold w-full block max-w-2xl mx-auto">
              Date:
              <input
                name="date"
                type="date"
                onChange={(e) => setDate(e.target.value)}
                required
                value={date}
                className="border-2 rounded-sm p-2 mb-2 w-full appearance-none focus:outline-none focus:appearance-none focus:border-violet-400 flex justify-center"
              />
            </label>
            <button
              type="submit"
              className="rounded-sm w-full p-2 mt-3 m-auto bg-green-300 hover:bg-green-500 font-semibold shadow hover:shadow-lg"
            >
              Submit
            </button>
          </form>
        </div>
        {/* Recent Transaction */}
        <div id="recent" className="max-w-6xl mx-auto pt-8 pb-10 px-4">
          <h2 className="text-2xl text-white font-bold mb-4 text-center">
            Recent Transactions
          </h2>

          {filteredTransactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet. Add one above!</p>
          ) : (
            <>
              <div className="space-y-3">
                {recentTransactions.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white rounded-lg shadow-lg p-4 flex items-center group"
                    >
                      {/* Description, Category, and Date */}
                      <div className="flex flex-col justify-start w-1/4">
                        <p className="font-semibold text-lg">{t.description}</p>
                        <p className="text-sm text-gray-600">
                          {t.category} • {t.date}
                        </p>
                      </div>

                      {/* Amount */}
                      <div
                        className="text-xl font-bold flex items-center justify-center w-1/2"
                        style={{ color: getCategoryColor(t.category) }}
                      >
                        ${t.amount}
                      </div>

                      {/*Update Button */}
                      <div className="flex justify-end w-1/8">
                        <button
                          onClick={() => handleUpdateClick(t)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          Update
                        </button>
                      </div>

                      {/* Delete Button */}
                      <div className="flex justify-end w-1/8">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              {transactions.length > 3 && (
                <Link href={`/transactions?${new URLSearchParams(
                  Object.fromEntries(
                    Object.entries({ startDate, endDate }).filter(([_, v]) => v)
                  )
                ).toString()}`}>
                  <button className="mt-4 w-full shadow bg-green-300 hover:bg-green-500 hover:shadow-lg rounded-lg p-3 font-semibold">
                    View All {filteredTransactions.length} Transactions →
                  </button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={isEditing}
        onClose={handleCloseModal}
        onUpdate={handleUpdate}
      />
      {/* Charts */}
      <div id="analytics" className="max-w-6xl mx-auto pt-8 pb-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingByCategory transactions={filteredTransactions} />
          <SpendingOverTime transactions={filteredTransactions} />
        </div>
      </div>
    </div>
  );
}
