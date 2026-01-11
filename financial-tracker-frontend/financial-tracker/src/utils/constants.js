export const CATEGORY_COLORS = {
    "Groceries": "#3B82F6",    // blue-500
    "Gas": "#A855F7",           // purple-500
    "Bill": "#06B6D4",          // cyan-500
    "Entertainment": "#10B981", // emerald-500
    "Take-Out": "#FB923C"       // orange-400
  };
  
  // Helper function to get color (with fallback)
  export const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category] || "#6B7280"; // gray-500 fallback
  };