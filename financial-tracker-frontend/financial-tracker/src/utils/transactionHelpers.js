import { convertDate } from "./dateHelpers";

/**
 * Filter transactions by date range
 * @param {Array} transactions - Array of transaction objects
 * @param {string} startDate - Start date in YYYY-MM-DD format (optional)
 * @param {string} endDate - End date in YYYY-MM-DD format (optional)
 * @returns {Array} - Filtered array of transactions
 */
export const filterByDateRange = (transactions, startDate, endDate) => {
  if (!startDate && !endDate) {
    return transactions;
  }

  return transactions.filter((t) => {
    const transactionDate = convertDate(t.date);

    // If only start date is set
    if (startDate && !endDate) {
      return transactionDate >= startDate;
    }

    // If only end date is set
    if (!startDate && endDate) {
      return transactionDate <= endDate;
    }

    // If both dates are set
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

/**
 * Calculate total spending from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} - Total amount
 */
export const calculateTotal = (transactions) => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Group transactions by a specific field and sum amounts
 * @param {Array} transactions - Array of transaction objects
 * @param {string} field - Field to group by (e.g., 'category', 'date')
 * @returns {Object} - Object with field values as keys and totals as values
 */
export const groupAndSumBy = (transactions, field) => {
  const totals = {};
  transactions.forEach((t) => {
    if (totals[t[field]]) {
      totals[t[field]] += t.amount;
    } else {
      totals[t[field]] = t.amount;
    }
  });
  return totals;
};
