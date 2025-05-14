import React, { useEffect, useState } from 'react';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";
import { Link } from 'react-router-dom';

function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("purchase_ID-Descending");
  const [showModal, setShowModal] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await fetch("http://localhost:5064/api/purchase/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPurchases(data);
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
    }
  };

  const viewPurchaseDetails = (items) => {
    setPurchaseDetails(items);
    setShowModal(true);
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
        fetchPurchases();
      } else {
        alert("Failed to delete purchase: " + msg);
      }
    } catch (err) {
      console.error("Error deleting purchase:", err);
    } finally {
      setShowConfirm(false);
    }
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

  const filteredPurchases = purchases
    .filter(p => p.supplier_Name.toLowerCase().includes(searchTerm.toLowerCase()) || p.purchase_ID.toString().includes(searchTerm))
    .sort((a, b) => {
      const [key, dir] = sortOption.split("-");
      let aVal = a[key];
      let bVal = b[key];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      return dir === "Ascending" ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
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

        {/* Search and Sort */}
        <div className="flex flex-col mt-4 md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0 mx-5 lg:mx-15">
          <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border px-4 py-2 rounded-md w-full md:w-40" />
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-center w-full md:w-auto">
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="border px-4 py-2 rounded-md w-full md:w-auto">
              <option value="purchase_ID-Ascending">ID (Ascending)</option>
              <option value="purchase_ID-Descending">ID (Descending)</option>
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

        {/* Purchase Table */}
        <div className="overflow-x-auto md:mx-10">
          <table className="min-w-full table-auto border border-gray-300">
            <thead className="bg-[#112D4E] text-white">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Supplier</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Total</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {currentPurchases.map(p => (
                <tr key={p.purchase_ID} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-center">{p.purchase_ID}</td>
                  <td className="px-4 py-2 text-center">{p.supplier_Name}</td>
                  <td className="px-4 py-2 text-center">{formatDate(p.purchase_Date)}</td>
                  <td className="px-4 py-2 text-center">{formatCurrency(p.total_Amount)}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button onClick={() => viewPurchaseDetails(p.items)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">View</button>
                    <button onClick={() => confirmDelete(p.purchase_ID)} className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">Delete</button>
                    <button onClick={() => sendPurchaseEmail(p)} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Email</button>
                    <button onClick={() => downloadPdf(p)} className="bg-gray-700 text-white px-3 py-1 rounded text-xs hover:bg-gray-800">PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-4">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="bg-[#112D4E] text-white px-4 py-1 rounded mx-2">Previous</button>
          <p className="text-sm">Page {currentPage} of {totalPages}</p>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="bg-[#112D4E] text-white px-4 py-1 rounded mx-2">Next</button>
        </div>

        {/* Summary */}
        <div className="text-white bg-[#112D4E] mt-4 p-3 rounded-md text-center font-semibold">
          <p>Total Purchases: {filteredPurchases.length} | Total Amount: {formatCurrency(totalAmount)}</p>
        </div>

        {/* Detail Modal */}
        {showModal && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
              <h2 className="text-xl font-bold text-[#112D4E] mb-4">Purchase Details</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="font-semibold">
                    <th>Product</th><th>Qty</th><th>Price</th><th>Amount</th>
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
              <button onClick={() => setShowModal(false)} className="absolute top-2 right-4 text-xl font-bold text-[#112D4E] hover:text-red-600">×</button>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {showConfirm && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md text-center">
              <h2 className="text-lg font-bold mb-4">Are you sure you want to delete this purchase?</h2>
              <div className="flex justify-center gap-4">
                <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Yes</button>
                <button onClick={() => setShowConfirm(false)} className="border px-4 py-2 rounded hover:bg-gray-100">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Purchase;