import React, { useEffect, useState, useRef } from 'react';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";
import { Link } from 'react-router-dom';

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

function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("localId-Ascending");
  const [showModal, setShowModal] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("token");
  const userIdRef = useRef(null);
  const localIdMapRef = useRef({});

  useEffect(() => {
    const userId = getUserIdFromToken();
    userIdRef.current = userId;

    const storedMap = localStorage.getItem(`purchaseLocalIdMap_${userId}`);
    if (storedMap) {
      localIdMapRef.current = JSON.parse(storedMap);
    }

    fetchPurchases(userId);
  }, []);

  const fetchPurchases = async (userId) => {
    try {
      const res = await fetch("http://localhost:5064/api/purchase/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      let maxLocalId = Math.max(0, ...Object.values(localIdMapRef.current));
      data.forEach((p) => {
        if (!localIdMapRef.current[p.purchase_ID]) {
          localIdMapRef.current[p.purchase_ID] = ++maxLocalId;
        }
      });

      localStorage.setItem(`purchaseLocalIdMap_${userId}`, JSON.stringify(localIdMapRef.current));

      const purchasesWithLocalId = data.map(p => ({
        ...p,
        localId: localIdMapRef.current[p.purchase_ID]
      }));

      setPurchases(purchasesWithLocalId);
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5064/api/purchase/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const msg = await res.text();
      if (res.ok) {
        alert(msg);
        delete localIdMapRef.current[deleteId];
        localStorage.setItem(`purchaseLocalIdMap_${userIdRef.current}`, JSON.stringify(localIdMapRef.current));
        fetchPurchases(userIdRef.current);
      } else {
        alert("Failed to delete purchase: " + msg);
      }
    } catch (err) {
      console.error("Error deleting purchase:", err);
    } finally {
      setShowConfirm(false);
    }
  };

  const viewPurchaseDetails = (items) => {
    setPurchaseDetails(items);
    setShowModal(true);
  };

  const sendPurchaseEmail = async (purchase) => {
    try {
      const payload = {
        From: "STOX\nBardhosh\nPrishtine, Kosove",
        To: purchase.supplier_Email,
        Number: purchase.purchase_ID,
        Amount_Paid: 0,
        Items: purchase.items
      };

      const res = await fetch("http://localhost:5064/api/purchase/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());
      alert("Purchase email sent successfully.");
    } catch (err) {
      alert("Error sending email: " + err.message);
    }
  };

  const downloadPdf = async (purchase) => {
    try {
      const payload = {
        From: "STOX\nBardhosh\nPrishtine, Kosove",
        To: purchase.supplier_Email,
        Number: purchase.purchase_ID,
        Amount_Paid: 0,
        Items: purchase.items
      };

      const res = await fetch("http://localhost:5064/api/purchase/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `purchase_${purchase.purchase_ID}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("PDF generation failed: " + err.message);
    }
  };

  const [sortField, sortOrder] = sortOption.split("-");
  const filteredPurchases = purchases
    .filter(p => p.supplier_Name.toLowerCase().includes(searchTerm.toLowerCase()) || p.localId.toString().includes(searchTerm))
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      return sortOrder === "Ascending" ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
    });

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const currentPurchases = filteredPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (date) => new Date(date).toLocaleString("en-GB");
  const formatCurrency = (val) => `${parseFloat(val).toFixed(2)}€`;
  const totalAmount = filteredPurchases.reduce((sum, p) => sum + parseFloat(p.total_Amount), 0);

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-0 flex flex-col">
        <Header />

        <div className="flex flex-col mt-4 md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0 mx-5 lg:mx-15">
          <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border px-4 py-2 rounded-md w-full md:w-40" />
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-center w-full md:w-auto">
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="border px-4 py-2 rounded-md w-full md:w-auto">
              <option value="localId-Ascending">ID (Ascending)</option>
              <option value="localId-Descending">ID (Descending)</option>
              <option value="supplier_Name-Ascending">Supplier (A-Z)</option>
              <option value="supplier_Name-Descending">Supplier (Z-A)</option>
              <option value="purchase_Date-Ascending">Date (Oldest)</option>
              <option value="purchase_Date-Descending">Date (Newest)</option>
              <option value="total_Amount-Ascending">Total (Low to High)</option>
              <option value="total_Amount-Descending">Total (High to Low)</option>
            </select>
            <Link to="/AddPurchase" className="bg-[#112D4E] text-white px-6 py-2 rounded-md hover:bg-[#0b213f] w-full md:w-auto text-center">
              Add Purchase
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto flex-grow lg:mx-15">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-[#112D4E] text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPurchases.map(p => (
                <tr key={p.purchase_ID} className="border-t text-center">
                  <td className="p-3">{p.localId}</td>
                  <td className="p-3">{p.supplier_Name}</td>
                  <td className="p-3">{formatDate(p.purchase_Date)}</td>
                  <td className="p-3">{formatCurrency(p.total_Amount)}</td>
                  <td className="p-3">
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center items-center">
                      <button onClick={() => viewPurchaseDetails(p.items)} className="bg-blue-600 text-white px-4 py-2 rounded text-xs hover:bg-blue-700 cursor-pointer">View</button>
                      <button onClick={() => confirmDelete(p.purchase_ID)} className="bg-red-600 text-white px-4 py-2 rounded text-xs hover:bg-red-700 cursor-pointer">Delete</button>
                      <button onClick={() => sendPurchaseEmail(p)} className="bg-green-600 text-white px-4 py-2 rounded text-xs hover:bg-green-700 cursor-pointer">Email</button>
                      <button onClick={() => downloadPdf(p)} className="bg-gray-700 text-white px-4 py-2 rounded text-xs hover:bg-gray-800 cursor-pointer">PDF</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center items-center space-x-4 mt-6">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
            className={`px-3 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#112D4E] text-white hover:bg-[#0b213f]'}`}>
            Previous
          </button>
          <p className="text-sm">Page {currentPage} of {totalPages}</p>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#112D4E] text-white hover:bg-[#0b213f]'}`}>
            Next
          </button>
        </div>

        <div className="bg-[#112D4E] text-white p-2 rounded-md flex flex-col md:flex-row justify-around items-center text-lg font-semibold mt-8 space-y-4 md:space-y-0 md:ml-10 md:mr-10 lg:ml-15 lg:mr-15 md:mb-8">
          <p>Total Purchases: {filteredPurchases.length}</p>
          <p>Total Amount: {formatCurrency(totalAmount)}</p>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl max-w-xl w-full shadow-lg relative">
              <h2 className="text-xl font-bold text-[#112D4E] border-b pb-2 mb-4">Purchase Details</h2>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="font-semibold text-[#112D4E]">
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseDetails.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unit_Cost)}</td>
                      <td>{formatCurrency(item.quantity * item.unit_Cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setShowModal(false)} className="absolute top-2 right-4 text-2xl font-bold text-[#112D4E] hover:text-red-500">×</button>
            </div>
          </div>
        )}

        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center space-y-4 w-96 shadow-lg border border-[#112D4E]">
              <div className="text-red-600 text-4xl">!</div>
              <h2 className="text-xl font-semibold">Are you sure you want to delete this purchase?</h2>
              <div className="flex justify-center space-x-4 mt-4">
                <button onClick={handleDelete} className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Yes, I'm sure</button>
                <button onClick={() => setShowConfirm(false)} className="border border-gray-400 px-6 py-2 rounded hover:bg-gray-100">No, cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Purchase;
