import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from '../assets/Components/Header';

function EditCustomer() {
  const { id } = useParams();
  const [customer, setCustomer] = useState({
    full_Name: '',
    email: '',
    phone_Number: '',
    address: ''
  });
  const navigate = useNavigate();

  // Fetch customer data on mount
  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5064/api/customer/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch customer");

      const data = await response.json();
      setCustomer(data);
    } catch (error) {
      console.error("Error fetching customer:", error);
      alert("Failed to load customer details.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5064/api/customer/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(customer)
      });

      if (!response.ok) throw new Error("Failed to update customer");

      alert("Customer updated successfully!");
      navigate("/Customer");
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-8 flex flex-col">
        <Header />

        <div className="p-10 max-w-lg mx-auto mt-10">
          <h1 className="text-2xl font-semibold mb-6 text-center underline">Edit Customer</h1>
          <button
            type="button"
            className="text-sm font-medium text-gray-800 hover:text-amber-500 transition-colors mb-5"
            onClick={() => navigate(-1)}
          >
            &lt;&lt; Back
          </button>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="full_Name"
              placeholder="Full Name"
              value={customer.full_Name}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={customer.email}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />

            <input
              type="tel"
              name="phone_Number"
              placeholder="Phone Number"
              value={customer.phone_Number}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={customer.address}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />

            <button
              type="submit"
              className="bg-[#112D4E] text-white px-6 py-2 rounded-md hover:bg-[#0b213f] w-full"
            >
              Update Customer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditCustomer;
