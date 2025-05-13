import React, { useEffect, useState } from 'react';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";
import { Link } from 'react-router-dom';

function Sale() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("Invoice_ID-Ascending");
  const [showModal, setShowModal] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("http://localhost:5064/api/invoice/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    }
  };

  const viewInvoiceDetails = async (invoiceId) => {
    try {
      const res = await fetch(`http://localhost:5064/api/invoice/details/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setInvoiceDetails(data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch invoice details", err);
    }
  };

  const deleteInvoice = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const res = await fetch(`http://localhost:5064/api/invoice/${invoiceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json") ? await res.json() : await res.text();

      if (res.ok) {
        alert(data.message || "Invoice deleted.");
        fetchInvoices();
      } else {
        alert(data.message || "Failed to delete invoice.");
      }
    } catch (err) {
      console.error("Error deleting invoice:", err);
    }
  };

  const sendInvoiceEmail = async (invoiceId) => {
    try {
      const itemsRes = await fetch(`http://localhost:5064/api/invoice/details/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const items = await itemsRes.json();

      const invoiceMeta = invoices.find(i => i.invoice_ID === invoiceId);
      if (!invoiceMeta || !invoiceMeta.customerEmail) {
        throw new Error("Missing customer email");
      }

      const payload = {
  From: "STOX\nBardhosh\nPrishtine, Kosove",
  To: invoiceMeta.customerEmail,
  Number: invoiceId,
  Amount_Paid: 0,
  Items: items.map(item => ({
    Name: item.product_Name,
    Quantity: item.quantity,
    Unit_Cost: item.price
  }))
};

      const res = await fetch("http://localhost:5064/api/invoice/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Email failed");
      }

      alert("Invoice email sent successfully.");
    } catch (err) {
      console.error("Email error:", err);
      alert(`Email error: ${err.message}`);
    }
  };

  const downloadPdf = async (invoiceId) => {
    try {
      const itemsRes = await fetch(`http://localhost:5064/api/invoice/details/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const items = await itemsRes.json();

      const invoiceMeta = invoices.find(i => i.invoice_ID === invoiceId);
      if (!invoiceMeta) throw new Error("Invoice metadata not found");

      const payload = {
  From: "STOX\nBardhosh\nPrishtine, Kosove",
  To: invoiceMeta.customerEmail,
  Number: invoiceId,
  Amount_Paid: 0,
  Items: items.map(item => ({
    Name: item.product_Name,
    Quantity: item.quantity,
    Unit_Cost: item.price
  }))
};


      const res = await fetch("http://localhost:5064/api/invoice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` // ✅ Added header
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "PDF generation failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("PDF generation failed", err);
      alert(`Failed to generate PDF: ${err.message}`);
    }
  };

  const filteredInvoices = invoices
    .filter(inv =>
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoice_ID.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      const [key, direction] = sortOption.split("-");
      let aVal = a[key];
      let bVal = b[key];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      return direction === "Ascending" ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
    });

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString("en-GB");
  const formatCurrency = (amount) => `${parseFloat(amount).toFixed(2)}€`;

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 flex flex-col">
        <Header />
        <div className="flex flex-col mt-4 md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0 mx-10">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded-md w-full md:w-40"
          />
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-center w-full md:w-auto">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border px-4 py-2 rounded-md w-full md:w-auto"
            >
              <option value="Invoice_ID-Ascending">ID (Ascending)</option>
              <option value="Invoice_ID-Descending">ID (Descending)</option>
              <option value="customerName-Ascending">Name (A-Z)</option>
              <option value="customerName-Descending">Name (Z-A)</option>
              <option value="invoice_Date-Ascending">Date (Oldest)</option>
              <option value="invoice_Date-Descending">Date (Newest)</option>
              <option value="total_Amount-Ascending">Total (Low to High)</option>
              <option value="total_Amount-Descending">Total (High to Low)</option>
            </select>
            <Link
              to="/AddSale"
              className="bg-[#112D4E] text-white px-6 py-2 rounded-md hover:bg-[#0b213f] w-full md:w-auto text-center"
            >
              Add Invoice
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto mx-10">
          <h2 className="text-2xl font-bold mb-4 text-center text-[#112D4E]">Invoice List</h2>
          <table className="min-w-full bg-white border rounded-md text-sm">
            <thead className="bg-[#112D4E] text-white">
              <tr>
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Customer Name</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Total</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr key={inv.invoice_ID} className="border-t">
                    <td className="py-2 px-4">{inv.invoice_ID}</td>
                    <td className="py-2 px-4">{inv.customerName}</td>
                    <td className="py-2 px-4">{formatDate(inv.invoice_Date)}</td>
                    <td className="py-2 px-4">{formatCurrency(inv.total_Amount)}</td>
                    <td className="py-2 px-4 space-x-1">
                      <button onClick={() => viewInvoiceDetails(inv.invoice_ID)} className="bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 rounded-md text-xs">View</button>
                      <button onClick={() => deleteInvoice(inv.invoice_ID)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs">Delete</button>
                      <button onClick={() => sendInvoiceEmail(inv.invoice_ID)} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-xs">Email</button>
                      <button onClick={() => downloadPdf(inv.invoice_ID)} className="bg-gray-700 hover:bg-gray-800 text-white px-2 py-1 rounded-md text-xs">PDF</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-4">No invoices found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-xl w-full shadow-lg relative">
              <h2 className="text-xl font-bold text-[#112D4E] border-b pb-2 mb-4">Sale Details</h2>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="font-semibold text-[#112D4E]">
                    <th className="py-1">Product Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceDetails.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1">{item.product_Name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-4 text-2xl font-bold text-[#112D4E] hover:text-red-500"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sale;
