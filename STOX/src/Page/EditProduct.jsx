import React, { useState, useEffect } from 'react';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";
import { useParams, useNavigate } from 'react-router-dom';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    categoryId: "",
    stockQuantity: "",
    price: ""
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5064/api/product/${id}`);
      const data = await response.json();

      const selectedCategory = await getCategoryIdByName(data.categoryName);

      setFormData({
        productName: data.product_Name,
        description: data.description,
        categoryId: selectedCategory || "",
        stockQuantity: data.stock_Quantity,
        price: data.price
      });
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5064/api/category");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const getCategoryIdByName = async (categoryName) => {
    if (!categoryName) return "";

    const response = await fetch("http://localhost:5064/api/category");
    const data = await response.json();

    const found = data.find(cat => cat.category_Name.toLowerCase() === categoryName.toLowerCase());
    return found ? found.category_ID : "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId) {
      alert("Please select a category!");
      return;
    }

    const updatedProduct = {
      product_Name: formData.productName,
      description: formData.description,
      category_ID: parseInt(formData.categoryId),
      stock_Quantity: parseInt(formData.stockQuantity),
      price: parseFloat(formData.price),
    };

    try {
      const response = await fetch(`http://localhost:5064/api/product/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) throw new Error("Failed to update product");

      alert("Product updated successfully!");
      navigate("/Product");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
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
          className="text-sm font-medium text-gray-800 hover:text-amber-500 transition-colors bg-transparent border-none outline-none font-outfit cursor-pointer mb-5"
          onClick={() => navigate(-1)}
        >
          &lt;&lt; Back
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
            name="categoryId"
            value={formData.categoryId}
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
            Save Changes
          </button>
        </form>
      </div>
    </div>
  </div>
  
  );
}

export default EditProduct;
