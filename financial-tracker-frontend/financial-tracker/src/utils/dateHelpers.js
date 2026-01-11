/**
 * Convert transaction date from MM-DD-YYYY to YYYY-MM-DD format
 * @param {string} dateStr - Date string in either MM-DD-YYYY or YYYY-MM-DD format
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const convertDate = (dateStr) => {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    // Check if it's already YYYY-MM-DD format
    if (parts[0].length === 4) {
      return dateStr; // Already correct format
    }
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateStr;
};
