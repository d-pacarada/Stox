import React, { useState, useEffect } from 'react';
import Header from "../assets/Components/Header";
import SidebarUser from '../assets/Components/SidebarUser';
import { useNavigate } from "react-router-dom";
 




export default function AddProduct() {
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category_ID: '',
    stockQuantity: '',
    price: ''
  });

  const [categories, setCategories] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5064/api/category');
      const data = await response.json();
      console.log("Fetched Categories", data); // Debug log
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedCategoryId = parseInt(formData.category_ID);
    const parsedStockQuantity = parseInt(formData.stockQuantity);
    const parsedPrice = parseFloat(formData.price);

    // Validation
    if (!parsedCategoryId || isNaN(parsedCategoryId)) {
      alert('Please select a valid category');
      return;
    }

    if (isNaN(parsedStockQuantity) || parsedStockQuantity < 0) {
      alert('Please enter a valid stock quantity');
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      alert('Please enter a valid price');
      return;
    }

    const newProduct = {
      product_Name: formData.productName.trim(),
      description: formData.description.trim(),
      category_ID: parsedCategoryId,
      stock_Quantity: parsedStockQuantity,
      price: parsedPrice
    };

    try {
      const response = await fetch('http://localhost:5064/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

      const resultText = await response.text();
      if (!response.ok) throw new Error(resultText);

      alert('Product added successfully!');
      window.location.href = "/Product";
      // Reset form
      setFormData({
        productName: '',
        description: '',
        category_ID: '',
        stockQuantity: '',
        price: ''
      });
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`Failed to add product: ${error.message}`);
    }
  };

  const navigate = useNavigate();


  return (
    <div className="flex flex-col min-h-screen md:flex-row">
  <SidebarUser />
  <div className="flex-1 p-4 md:p-8 flex flex-col">
    <Header />
    
    
    <div className="p-10 max-w-lg mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-6 text-center underline">Add Product</h1>
      <button type="button"
        className="text-sm font-medium text-gray-800 hover:text-amber-500 transition-colors bg-transparent border-none outline-none font-outfit cursor-pointer mb-5"
        onClick={() => navigate(-1)}
        > &lt;&lt; Back
      </button>
      

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="productName"
          placeholder="Product Name"
          value={formData.productName}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <select
          name="category_ID"
          value={formData.category_ID}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        >
          <option value="">-- Select Category --</option>
          {categories.map(cat => (
            <option key={cat.category_ID} value={cat.category_ID}>
              {cat.category_Name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="stockQuantity"
          placeholder="Stock Quantity"
          value={formData.stockQuantity}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <input
          type="number"
          step="0.01"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <button
          type="submit"
          className="bg-[#112D4E] text-white px-6 py-2 rounded-md hover:bg-[#0b213f] w-full"
        >
          Add Product
        </button>
      </form>
    </div>
    </div>
    </div>
  );
}
