import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../assets/Components/SidebarAdmin';
import Header from "../assets/Components/Header";

function See_Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("user_ID");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5064/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5064/api/users/${deleteId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      const updatedUsers = users.filter(user => user.user_ID !== deleteId);
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const filteredUsers = users
    .filter(user =>
      user.business_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortField] ?? "";
      let bValue = b[sortField] ?? "";

      // Date için özel sıralama
      if (sortField === "date") {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      }

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col">
        <Header />

        <div className="p-8 flex-1">
          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0 md:ml-7 md:mr-7">
            <input
              type="text"
              placeholder="Search by Business Name or Email"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="text-sm border px-4 py-2 rounded-md w-full md:w-64"
            />

            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortField(field);
                setSortOrder(order);
              }}
              className="border px-4 py-2 rounded-md w-full md:w-auto"
            >
              <option value="user_ID-asc">ID (Asc)</option>
              <option value="user_ID-desc">ID (Desc)</option>
              <option value="business_Name-asc">Business Name (A-Z)</option>
              <option value="business_Name-desc">Business Name (Z-A)</option>
              <option value="email-asc">Email (A-Z)</option>
              <option value="email-desc">Email (Z-A)</option>
              <option value="date-asc">Register Date (Oldest First)</option>
              <option value="date-desc">Register Date (Newest First)</option>
            </select>
          </div>

          {/* Table with Scroll */}
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] md:ml-10 md:mr-10 lg:ml-7 lg:mr-7 border border-gray-300">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#112D4E] text-white sticky top-0">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Business Name</th>
                  <th className="p-3">Business Number</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone Number</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Transit Number</th>
                  <th className="p-3">Register Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.user_ID} className="text-center border-b text-sm">
                    <td className="p-3">{user.user_ID}</td>
                    <td className="p-3">{user.business_Name}</td>
                    <td className="p-3">{user.business_Number}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.phone_Number}</td>
                    <td className="p-3">{user.address}</td>
                    <td className="p-3">{user.transit_Number}</td>
                    <td className="p-3">
                      {user.date
                        ? new Date(user.date).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : "No Date"}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => confirmDelete(user.user_ID)}
                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex justify-center items-center space-x-4 mt-6 mb-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#112D4E] text-white hover:bg-[#0b213f]'}`}
            >
              Previous
            </button>
            <p className="text-sm">Page {currentPage} of {totalPages}</p>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#112D4E] text-white hover:bg-[#0b213f]'}`}
            >
              Next
            </button>
          </div>
        )}

        {!loading && (
          <div className="bg-[#112D4E] text-white p-2 rounded-md flex justify-center text-lg font-semibold mt-auto md:ml-10 md:mr-10 lg:ml-15 lg:mr-15 md:mb-8">
            <p>Total Users: {filteredUsers.length}</p>
          </div>
        )}

        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center space-y-4 w-96 shadow-lg border border-[#112D4E]">
              <div className="text-red-600 text-4xl">!</div>
              <h2 className="text-xl font-semibold">Are you sure you want to delete this user?</h2>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="border border-gray-400 px-6 py-2 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default See_Users;
