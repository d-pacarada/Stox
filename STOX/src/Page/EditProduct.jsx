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
    <div className='flex flex-col md:flex-row min-h-screen'>
      <SidebarUser />
      <div className="flex-1 p-8">
        <Header />
        <h2 className="text-2xl font-semibold text-[#112D4E] mb-8">Edit Product</h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Product Name */}
          <fieldset className="border border-gray-300 rounded-md px-3 pt-1 pb-2">
            <legend className="text-sm text-gray-600 px-1">Product Name</legend>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              className="w-full border-none outline-none text-gray-800"
              required
            />
          </fieldset>

          {/* Description */}
          <fieldset className="border border-gray-300 rounded-md px-3 pt-1 pb-2">
            <legend className="text-sm text-gray-600 px-1">Description</legend>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border-none outline-none text-gray-800"
              required
            />
          </fieldset>

          {/* Category */}
          <fieldset className="border border-gray-300 rounded-md px-3 pt-1 pb-2">
            <legend className="text-sm text-gray-600 px-1">Category</legend>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border-none outline-none text-gray-800"
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.category_ID} value={cat.category_ID}>
                  {cat.category_Name}
                </option>
              ))}
            </select>
          </fieldset>

          {/* Stock Quantity */}
          <fieldset className="border border-gray-300 rounded-md px-3 pt-1 pb-2">
            <legend className="text-sm text-gray-600 px-1">Stock Quantity</legend>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              className="w-full border-none outline-none text-gray-800"
              required
            />
          </fieldset>

          {/* Price */}
          <fieldset className="border border-gray-300 rounded-md px-3 pt-1 pb-2">
            <legend className="text-sm text-gray-600 px-1">Price</legend>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border-none outline-none text-gray-800"
              required
            />
          </fieldset>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#112D4E] text-white py-3 rounded-md hover:bg-[#0b213f] transition duration-300"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
