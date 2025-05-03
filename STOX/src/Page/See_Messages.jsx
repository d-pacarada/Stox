import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../assets/Components/SidebarAdmin';
import Header from "../assets/Components/Header";

function See_Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

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
      const response = await fetch(`http://localhost:5064/api/contacts/${deleteId}`, 
        { method: "DELETE" })


      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      setMessages(messages.filter(msg => msg.contact_ID !== deleteId));
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  return (
    <div className='flex flex-col md:flex-row'>
      <SidebarAdmin />
      <div className="flex-1">
        <Header />
        <div className='p-8'>
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
                  {messages.map((msg) => (
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
