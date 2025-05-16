import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Clock, Activity, LogIn, Info, X } from 'lucide-react';

function UserActivityPanel() {
  const [loggedInToday, setLoggedInToday] = useState([]);
  const [latestLogs, setLatestLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5064/api/admin/user-activity", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch user activity");
        return res.json();
      })
      .then(data => {
        const grouped = {};
        data.usersLoggedInToday.forEach(log => {
          const name = log.business_Name;
          if (!grouped[name]) grouped[name] = [];
          grouped[name].push(log.timestamp);
        });

        const summary = Object.entries(grouped).map(([businessName, timestamps]) => ({
          businessName,
          count: timestamps.length,
          latest: timestamps.sort().slice(-1)[0]
        }));

        setLoggedInToday(summary);
        setLatestLogs(data.latestLogs);
      })
      .catch(err => console.error("Activity fetch error:", err));
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-10 relative">
      <h2 className="text-2xl font-bold text-[#112D4E] mb-6 flex items-center gap-2">
        <Activity className="text-orange-500" /> User Activity Panel
      </h2>

      <div className="mb-10">
        <h3 className="text-lg font-semibold text-[#112D4E] mb-3 flex items-center gap-2">
          <LogIn size={20} /> Users Logged In Today
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-100 text-[#112D4E] text-sm">
              <tr>
                <th className="px-4 py-3 font-semibold">Business Name</th>
                <th className="px-4 py-3 font-semibold">Login Count</th>
                <th className="px-4 py-3 font-semibold">Latest Login</th>
                <th className="px-4 py-3 font-semibold">View Who</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loggedInToday.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium">{row.businessName}</td>
                  <td className="px-4 py-3">{row.count}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {moment(row.latest).format("YYYY-MM-DD HH:mm")}
                  </td>
                  <td className="px-4 py-3 relative">
                    <div
                      className="inline-block text-left"
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Info size={16} />
                        <span className="text-xs">View</span>
                      </button>
                      {hoveredRow === idx && (
                        <div className="fixed z-50 mt-2 w-52 p-3 bg-white border border-gray-300 text-xs text-gray-700 rounded-lg shadow-lg">
                          <p><span className="font-semibold">Latest login:</span><br />{moment(row.latest).format("dddd, MMMM D • HH:mm")}</p>
                          <p className="mt-2 text-gray-500">User has logged in {row.count} {row.count === 1 ? 'time' : 'times'} today.</p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {loggedInToday.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No users have logged in today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-[#112D4E] flex items-center gap-2">
          <Clock size={20} /> Latest Activity Logs
        </h3>
        {latestLogs.length > 4 && (
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            View More
          </button>
        )}
      </div>

      <div className="grid gap-3">
        {latestLogs.slice(0, 4).map((log, idx) => (
          <div
            key={idx}
            className="bg-white p-3 rounded-lg border border-gray-200 text-sm shadow-sm hover:shadow-md transition"
          >
            <span className="font-medium text-[#112D4E]">{log.business_Name}</span> -{' '}
            <span className="text-gray-700">{log.action}</span>
            <span className="block text-xs text-gray-500 mt-1">
              {moment(log.timestamp).format("dddd, MMM D • HH:mm")}
            </span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-600 hover:text-red-500"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-[#112D4E] flex items-center gap-2">
              <Clock /> Recent Activity Logs
            </h3>
            <div className="grid gap-3">
              {latestLogs.slice(0, 15).map((log, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-lg border border-gray-200 text-sm shadow-sm"
                >
                  <span className="font-medium text-[#112D4E]">{log.business_Name}</span> -{' '}
                  <span className="text-gray-700">{log.action}</span>
                  <span className="block text-xs text-gray-500 mt-1">
                    {moment(log.timestamp).format("dddd, MMM D • HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserActivityPanel;
