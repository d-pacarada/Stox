import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from '../assets/Components/Header';

function AddCustomer() {
  const [formData, setFormData] = useState({
    full_Name: '',
    email: '',
    phone_Number: '',
    address: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.full_Name.trim() || !formData.email.trim() || !formData.phone_Number.trim() || !formData.address.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5064/api/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const resultText = await response.text();
      if (!response.ok) throw new Error(resultText);

      alert("Customer added successfully!");
      navigate("/Customer");

    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer");
    }
  };

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-8 flex flex-col">
        <Header />
        <div className="p-10 max-w-lg mx-auto mt-10">
          <h1 className="text-2xl font-semibold mb-6 text-center underline">Add Customer</h1>

          <button
            type="button"
            className="text-sm font-medium text-gray-800 hover:text-amber-500 transition-colors bg-transparent border-none outline-none cursor-pointer mb-5"
            onClick={() => navigate(-1)}
          >
            &lt;&lt; Back
          </button>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="full_Name"
              placeholder="Full Name"
              value={formData.full_Name}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />

            <input
              type="tel"
              name="phone_Number"
              placeholder="Phone Number"
              value={formData.phone_Number}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />

            <button
              type="submit"
              className="bg-[#112D4E] text-white px-6 py-2 rounded-md hover:bg-[#0b213f] w-full cursor-pointer"
            >
              Add Customer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCustomer;
