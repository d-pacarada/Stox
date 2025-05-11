import React, { useState, useEffect, useRef } from 'react';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";
import { Link, useNavigate } from 'react-router-dom';


function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.User_ID || payload.user_id || payload.sub;
  } catch (error) {
    return null;
  }
}

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sortField, setSortField] = useState("full_Name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const navigate = useNavigate();
  const localIdMapRef = useRef({});
  const userIdRef = useRef(null);

  useEffect(() => {
    const userId = getUserIdFromToken();
    userIdRef.current = userId;

    const storedMap = localStorage.getItem(`customerLocalIdMap_${userId}`);
    if (storedMap) {
      localIdMapRef.current = JSON.parse(storedMap);
    }

    fetchCustomers(userId);
  }, []);

  const fetchCustomers = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5064/api/customer/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch customers");

      const data = await response.json();

      let maxLocalId = Math.max(0, ...Object.values(localIdMapRef.current));
      data.forEach((customer) => {
        if (!localIdMapRef.current[customer.customer_ID]) {
          localIdMapRef.current[customer.customer_ID] = ++maxLocalId;
        }
      });

      localStorage.setItem(`customerLocalIdMap_${userId}`, JSON.stringify(localIdMapRef.current));

      const customersWithLocalId = data.map(customer => ({
        ...customer,
        localId: localIdMapRef.current[customer.customer_ID]
      }));

      setCustomers(customersWithLocalId);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const confirmDelete = (customerId) => {
    setDeleteId(customerId);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = userIdRef.current;

      const response = await fetch(`http://localhost:5064/api/customer/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to delete customer");

      const updatedCustomers = customers.filter(c => c.customer_ID !== deleteId);

      delete localIdMapRef.current[deleteId];
      localStorage.setItem(`customerLocalIdMap_${userId}`, JSON.stringify(localIdMapRef.current));

      setCustomers(updatedCustomers);
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer");
    }
  };

  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split("-");
    setSortField(field);
    setSortOrder(order);
  };

  const filteredCustomers = customers
    .filter(customer =>
      customer.full_Name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = (a[sortField] ?? "").toString().toLowerCase();
      const bValue = (b[sortField] ?? "").toString().toLowerCase();

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalCustomers = customers.length;

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-0 flex flex-col">
        <Header />
        {/* Search & Sort */}
        <div className="flex flex-col mt-4 md:mt-0 md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0 md:ml-10 md:mr-10 lg:ml-15 lg:mr-15 lg:mt-5 md:mt-5">
          <input
            type="text"
            placeholder="Search customers"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); 
            }}
            className="border px-4 py-2 rounded-md w-full md:w-40"
          />

          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-center w-full md:w-auto">
            <select
              onChange={handleSortChange}
              className="border px-4 py-2 rounded-md w-full md:w-auto"
            >
              <option value="full_Name-asc">Name (A-Z)</option>
              <option value="full_Name-desc">Name (Z-A)</option>
              <option value="email-asc">Email (A-Z)</option>
              <option value="email-desc">Email (Z-A)</option>
              <option value="address-asc">Address (A-Z)</option>
              <option value="address-desc">Address (Z-A)</option>
              <option value="customer_ID-asc">ID (Ascending)</option>
              <option value="customer_ID-desc">ID (Descending)</option>
            </select>

            <Link
              to="/AddCustomer"
              className="bg-[#112D4E] text-white px-6 py-2 rounded-md hover:bg-[#0b213f] w-full md:w-auto text-center"
            >
              Add Customer
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-grow md:ml-15 md:mr-15 lg:ml-15 lg:mr-15">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-[#112D4E] text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone Number</th>
                <th className="p-3">Address</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((customer) => (
                <tr key={customer.customer_ID} className="text-center border-b">
                  <td className="p-3">{customer.localId}</td>
                  <td className="p-3">{customer.full_Name}</td>
                  <td className="p-3">{customer.email}</td>
                  <td className="p-3">{customer.phone_Number}</td>
                  <td className="p-3">{customer.address}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => navigate(`/EditCustomer/${customer.customer_ID}`)}
                      className="bg-[#112D4E] text-white px-4 py-1 rounded hover:bg-[#0b213f]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(customer.customer_ID)}
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

        {/* Next */}
        <div className="flex justify-center items-center space-x-4 mt-6">
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

        {/* Total */}
        <div className="bg-[#112D4E] text-white p-2 rounded-md flex flex-col md:flex-row justify-center items-center text-lg font-semibold mt-8 space-y-4 md:space-y-0 md:ml-10 md:mr-10 md:mb-8">
          <p>Total Customers: {totalCustomers}</p>
        </div>

        {/* Delete*/}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center space-y-4 w-96 shadow-lg border border-[#112D4E]">
              <div className="text-red-600 text-4xl">!</div>
              <h2 className="text-xl font-semibold">Are you sure you want to delete this customer?</h2>
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

export default Customer;
