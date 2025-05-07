import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../assets/Components/SidebarAdmin';
import Header from "../assets/Components/Header";

function See_Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch("http://localhost:5064/api/contacts");
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
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
      const response = await fetch(`http://localhost:5064/api/contacts/${deleteId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      const updatedMessages = messages.filter(msg => msg.contact_ID !== deleteId);
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(messages.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMessages = messages.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col">
        <Header />

        <div className="p-8 flex-1">
          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p>No messages found.</p>
          ) : (
            <div className="overflow-x-auto md:ml-10 md:mr-10 lg:ml-7 lg:mr-7">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-[#112D4E] text-white">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">Received Date</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMessages.map((msg) => (
                    <tr key={msg.contact_ID} className="text-center border-b">
                      <td className="p-3">{msg.contact_ID}</td>
                      <td className="p-3">{msg.email}</td>
                      <td className="p-3">{msg.message}</td>
                      <td className="p-3">{new Date(msg.date).toLocaleString()}</td>
                      <td className="p-3">
                        <button
                          onClick={() => confirmDelete(msg.contact_ID)}
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
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && messages.length > 0 && (
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

        {/* Footer - Total Messages */}
        {!loading && (
          <div className="bg-[#112D4E] text-white p-2 rounded-md flex justify-center text-lg font-semibold mt-auto md:ml-10 md:mr-10 lg:ml-15 lg:mr-15 md:mb-8">
            <p>Total Messages: {messages.length}</p>
          </div>
        )}

        {/* Delete Confirm Popup */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center space-y-4 w-96 shadow-lg border border-[#112D4E]">
              <div className="text-red-600 text-4xl">!</div>
              <h2 className="text-xl font-semibold">Are you sure you want to delete this message?</h2>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                >
                  Yes, I'm sure
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="border border-gray-400 px-6 py-2 rounded hover:bg-gray-100"
                >
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default See_Messages;
