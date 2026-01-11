"use client";

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
  noContainer = false,
}) {
  const content = (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        {/* Start Date */}
        <div className="flex items-center gap-2">
          <label className="font-semibold">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="border-2 rounded-sm p-2 focus:outline-none focus:border-violet-300"
          />
        </div>

        {/* End Date */}
        <div className="flex items-center gap-2">
          <label className="font-semibold">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="border-2 rounded-sm p-2 focus:outline-none focus:border-violet-300"
          />
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 font-semibold"
        >
          Reset
        </button>
      </div>
    </div>
  );

  // If noContainer is true, return content without wrapper
  if (noContainer) {
    return content;
  }

  // Otherwise, return with container (for dashboard)
  return <div className="max-w-6xl mx-auto py-4 px-4">{content}</div>;
}
