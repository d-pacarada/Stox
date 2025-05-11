import React from "react";
import { ArrowRight } from "lucide-react"; // Optional: install `lucide-react` or use an <img>

export default function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl w-[90%] max-w-md border-[3px] border-[#112D4E] text-[#112D4E] relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b-2 border-[#112D4E] pb-2">
          <h2 className="text-2xl font-bold">Log out</h2>
          <button onClick={onCancel} className="text-2xl font-bold hover:text-red-600">X</button>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <ArrowRight size={64} strokeWidth={2.5} className="text-orange-500" />
        </div>

        {/* Message */}
        <p className="text-center text-lg font-medium mb-6">
          Are you sure you want to log out?
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-orange-500 text-white font-semibold px-6 py-2 rounded-xl hover:bg-orange-600 transition"
          >
            Yes, I’m sure
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-xl border-2 border-[#112D4E] text-[#112D4E] font-semibold hover:bg-gray-100 transition"
          >
            No, cancel
          </button>
        </div>
      </div>
    </div>
  );
}
