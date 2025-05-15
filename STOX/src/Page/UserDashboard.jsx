// Full updated UserDashboard.js with Option 1 for monthly chart

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  LineChart, Line, Legend, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";

function UserDashboard() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("daily");
  const [totalSales, setTotalSales] = useState(0);
  const [yearlyComparisonData, setYearlyComparisonData] = useState([]);
  const [yearlyComparisonLoading, setYearlyComparisonLoading] = useState(true);
  const [selectedYearData, setSelectedYearData] = useState(null);

  const token = localStorage.getItem("token");

  const COLORS = ['#112D4E', '#3F72AF', '#DBE2EF', '#F9F7F7', '#4E7FFF', '#48BB78'];

useEffect(() => {
  const fetchChartData = async () => {
    setLoading(true);
    setChartData([]); // Reset chart data before fetching new data

    try {
      const res = await fetch(`http://localhost:5064/api/chart/sales/${range}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Chart data fetch failed");
      const data = await res.json();
      setChartData(data);
      setTotalSales(data.reduce((sum, item) => sum + item.total, 0));
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchChartData();
}, [range, token]);


  useEffect(() => {
    const fetchYearlyComparisonData = async () => {
      setYearlyComparisonLoading(true);
      try {
        const res = await fetch(`http://localhost:5064/api/chart/sales/yearscomparison`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Yearly comparison data fetch failed");
        const data = await res.json();
        const processed = data.map(item => item.year === 0 ? { ...item, year: "All Years" } : item);
        setYearlyComparisonData(processed);
        if (processed.length > 0) setSelectedYearData(processed[0]);
      } catch (err) {
        console.error("Failed to fetch yearly comparison data:", err);
      } finally {
        setYearlyComparisonLoading(false);
      }
    };
    fetchYearlyComparisonData();
  }, [token]);

  const handleYearSelect = (year) => {
    const selected = yearlyComparisonData.find(data => data.year === year || data.year === year.toString());
    setSelectedYearData(selected || null);
  };

  const getChartTitle = () => {
    switch(range) {
      case 'daily': return "Today's Sales (Hourly)";
      case 'weekly': return 'Last 7 Days Sales';
      case 'monthly': return 'Last 30 Days Sales';
      case 'yearly': return 'Last 12 Months Sales';
      default: return 'Sales Data';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded text-xs">
          <p className="font-semibold">{label}</p>
          <p className="text-[#112D4E]">Sales: {formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      margin: { top: 5, right: 5, left: 0, bottom: 5 }
    };
    if (range === 'daily') {
      return (
        <BarChart data={chartData} {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="label" tick={{fontSize: 10}} />
          <YAxis tickFormatter={formatCurrency} tick={{fontSize: 10}} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" fill="#112D4E" />
        </BarChart>
      );
    } else if (range === 'weekly' || range === 'monthly') {
      return (
        <LineChart data={chartData} {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="label" tick={{fontSize: 10}} />
          <YAxis tickFormatter={formatCurrency} tick={{fontSize: 10}} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="total" stroke="#112D4E" strokeWidth={2} activeDot={{ r: 6 }} />
        </LineChart>
      );
    } else {
      return (
        <BarChart data={chartData} {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="label" tick={{fontSize: 10}} />
          <YAxis tickFormatter={formatCurrency} tick={{fontSize: 10}} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" fill="#112D4E" />
        </BarChart>
      );
    }
  };

  const renderYearlyComparisonChart = () => {
    const pieData = yearlyComparisonData.map(y => ({ name: y.year.toString(), value: y.total }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%" cy="50%"
            labelLine={false}
            outerRadius={60}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-sm">
      <SidebarUser />
      <div className="flex-1 p-2 md:p-3 overflow-x-hidden">
        <Header />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="range" className="font-semibold text-gray-700 text-sm">View:</label>
            <select
              id="range"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border rounded px-2 py-1 text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-[#112D4E]"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              {/*<option value="monthly">Monthly</option> This is a comment inside JSX */}
              <option value="yearly">Monthly</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow p-2 w-full sm:w-auto">
            <h3 className="text-xs text-gray-500">Total Sales ({range})</h3>
            <p className="text-lg font-bold text-[#112D4E]">
              {formatCurrency(totalSales)}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full h-48 bg-white rounded-lg shadow p-3 flex items-center justify-center mb-3">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-[#112D4E] rounded-full animate-spin mb-2"></div>
              <p className="text-gray-500 text-sm">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white rounded-lg shadow p-3 mb-3">
            <h2 className="text-base font-semibold mb-2 text-[#112D4E]">{getChartTitle()}</h2>
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                No sales data available for this period
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        <div className="mt-3">
          {yearlyComparisonLoading ? (
            <div className="w-full h-48 bg-white rounded-lg shadow p-3 flex items-center justify-center mb-3">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-[#112D4E] rounded-full animate-spin mb-2"></div>
                <p className="text-gray-500 text-sm">Loading yearly comparison data...</p>
              </div>
            </div>
          ) : yearlyComparisonData.length === 0 ? (
            <div className="w-full h-32 bg-white rounded-lg shadow p-3 flex items-center justify-center mb-3">
              <p className="text-gray-500 text-sm">No yearly sales data available</p>
            </div>
          ) : (
            <div className="w-full bg-white rounded-lg shadow p-3 mb-3">
              <h3 className="text-base font-semibold mb-2 text-[#112D4E]">Total Sales by Year</h3>
              <div className="h-48">
                {renderYearlyComparisonChart()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
