import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../assets/Components/Header';
import SidebarUser from '../assets/Components/SidebarUser';
import Select from 'react-select';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product_Name: '',
    description: '',
    category_ID: '',
    stock_Quantity: '',
    price: ''
  });

  const [categories, setCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5064/api/product/category/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5064/api/product/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();

      setFormData({
        product_Name: data.product_Name,
        description: data.description,
        category_ID: data.category_ID,
        stock_Quantity: data.stock_Quantity,
        price: data.price
      });
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      category_ID: selectedOption?.value || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5064/api/product/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to update product");

      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate("/Product");
      }, 2000);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-8 flex flex-col">
        <Header />
        <div className="p-10 max-w-lg mx-auto mt-10">
          <h1 className="text-2xl font-semibold mb-6 text-center underline">Edit Product</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-gray-800 hover:text-amber-500 mb-5 cursor-pointer"
          >
            &lt;&lt; Back
          </button>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="product_Name"
              value={formData.product_Name}
              onChange={handleChange}
              placeholder="Product Name"
              className="border p-2 w-full rounded-md"
              required
            />

            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="border p-2 w-full rounded-md"
              required
            />

            <Select
              options={categories.map(cat => ({
                value: cat.category_ID,
                label: cat.category_Name
              }))}
              onChange={handleCategoryChange}
              value={categories.find(cat => cat.category_ID === formData.category_ID) ? {
                value: formData.category_ID,
                label: categories.find(cat => cat.category_ID === formData.category_ID).category_Name
              } : null}
              placeholder="Select category"
              isClearable
              className="rounded-md"
            />

            <input
              type="number"
              name="stock_Quantity"
              value={formData.stock_Quantity}
              onChange={handleChange}
              placeholder="Stock Quantity"
              className="border p-2 w-full rounded-md"
              required
            />

            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price"
              className="border p-2 w-full rounded-md"
              required
            />

            <button
              type="submit"
              className="bg-[#112D4E] text-white px-6 py-2 rounded-md hover:bg-[#0b213f] w-full cursor-pointer"
            >
              Update Product
            </button>
          </form>
        </div>
      </div>

      {showPopup && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 md:ml-30">
          Product updated successfully!
        </div>
      )}
    </div>
  );
}
