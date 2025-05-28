import React, { useEffect, useState } from "react";
import SidebarUser from "../assets/Components/SidebarUser";
import Header from "../assets/Components/Header";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Income() {
  const [incomeData, setIncomeData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [sortOption, setSortOption] = useState("date-desc");
  const [filter, setFilter] = useState("daily");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const token = localStorage.getItem("token");

  const filterTitles = {
    daily: "Daily Income",
    weekly: "Weekly Income",
    monthly: "Monthly Income",
    yearly: "Yearly Income",
  };

  const clearDateRange = () => setDateRange([null, null]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.append("startDate", startDate.toISOString());
      params.append("endDate", endDate.toISOString());
    } else {
      params.append("filter", filter);
    }

    fetch(`http://localhost:5064/api/income?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => {
        const sorted = [...data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (sortOption === "date-desc") return dateB - dateA;
          if (sortOption === "date-asc") return dateA - dateB;
          if (sortOption === "amount-asc") return a.amount - b.amount;
          if (sortOption === "amount-desc") return b.amount - a.amount;
          return 0;
        });
        setIncomeData(sorted);
        setIsLoading(false);
        setCurrentPage(1);
      })
      .catch((err) => {
        setError("Failed to load income data");
        setIsLoading(false);
      });
  }, [sortOption, filter, startDate, endDate]);

  useEffect(() => {
    if (startDate || endDate) {
      setComparisonData(null);
      return;
    }

    fetch(`http://localhost:5064/api/income/comparison?filter=${filter}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok && res.json())
      .then(setComparisonData)
      .catch(console.error);
  }, [filter, startDate, endDate]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = incomeData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(incomeData.length / itemsPerPage);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);

  const getFilterTitle = () =>
    startDate && endDate ? "Custom Date Range Income" : filterTitles[filter] || "Income";

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-0 flex flex-col">
        <Header />

        <div className="flex flex-col items-center w-full mt-6 md:mt-10 space-y-4">
          <div className="flex flex-col w-full max-w-4xl space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border rounded-md px-4 py-2 w-full md:w-auto"
              >
                <option value="date-desc">Sort by Date (Newest)</option>
                <option value="date-asc">Sort by Date (Oldest)</option>
                <option value="amount-desc">Sort by Amount (High → Low)</option>
                <option value="amount-asc">Sort by Amount (Low → High)</option>
              </select>

              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
                {["daily", "weekly", "monthly", "yearly"].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      clearDateRange();
                    }}
                    className={`border px-3 py-1 md:px-4 md:py-2 rounded-md text-sm md:text-base ${
                      filter === f && !startDate && !endDate
                        ? "bg-[#0d274b] text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="w-full md:w-1/2">
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  isClearable
                  placeholderText="Select custom date range"
                  className="border px-4 py-2 w-full rounded-md"
                />
              </div>

              {startDate && endDate && (
                <button
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                  onClick={clearDateRange}
                >
                  Clear Date Range
                </button>
              )}
            </div>
          </div>

          {comparisonData && !startDate && !endDate && (
            <div className="w-full max-w-4xl bg-gray-50 rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Current Period</p>
                  <p className="text-xl font-bold">{formatCurrency(comparisonData.current)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Previous Period</p>
                  <p className="text-xl font-bold">{formatCurrency(comparisonData.previous)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Change</p>
                  <p
                    className={`text-xl font-bold ${
                      comparisonData.percentChange > 0
                        ? "text-green-600"
                        : comparisonData.percentChange < 0
                        ? "text-red-600"
                        : ""
                    }`}
                  >
                    {comparisonData.percentChange > 0 ? "+" : ""}
                    {comparisonData.percentChange.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-xl md:text-2xl font-semibold">{getFilterTitle()}</h2>

          {isLoading ? (
            <div className="w-full max-w-3xl text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d274b] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading income data...</p>
            </div>
          ) : error ? (
            <div className="w-full max-w-3xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="w-full max-w-4xl overflow-x-auto">
                <table className="w-full border-collapse shadow-md">
                  <thead>
                    <tr className="bg-[#0d274b] text-white text-left">
                      <th className="py-3 px-4">
                        {startDate && endDate ? "Date" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </th>
                      <th className="py-3 px-4 text-right">Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((entry, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {entry.displayLabel || new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">{formatCurrency(entry.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="py-6 text-center text-gray-500">
                          No income data found for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination with Previous/Next */}
              {incomeData.length > itemsPerPage && (
                <div className="flex justify-center items-center space-x-4 mt-3">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded ${
                      currentPage === 1
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-[#112D4E] text-white hover:bg-[#0b213f]"
                    }`}
                  >
                    Previous
                  </button>
                  <p className="text-sm">Page {currentPage} of {totalPages}</p>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded ${
                      currentPage === totalPages
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-[#112D4E] text-white hover:bg-[#0b213f]"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Income;
