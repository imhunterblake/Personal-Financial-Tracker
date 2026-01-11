"use client";
import { useEffect, useState } from "react";

/**
 * Modal component for editing transaction details
 * @param {Object} transaction - The transaction to edit
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onUpdate - Callback to update the transaction
 */
export default function EditTransactionModal({
  transaction,
  isOpen,
  onClose,
  onUpdate,
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("select-one");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(transaction.amount);
      setCategory(transaction.category);
      setDate(transaction.date);
    }
  }, [transaction]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      description,
      amount: parseInt(amount),
      category,
      date,
      id: transaction.id,
    };

    await onUpdate(updatedData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-11/12"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Update Transaction</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            Description:
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
          </label>
          <label className="block mb-4">
            Amount:
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
          </label>
          <label className="block mb-4">
            Category:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            >
              <option value="select-one" disabled>
                Select a Category
              </option>
              <option value="Take-Out">Take-Out</option>
              <option value="Bill">Bill</option>
              <option value="Gas">Gas</option>
              <option value="Groceries">Groceries</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </label>
          <label className="block mb-4">
            Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update
            </button>
            <button
              type="button"
              className="ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
