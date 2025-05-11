import React, { useState, useEffect } from 'react';
import Header from "../assets/Components/Header";
import SidebarUser from '../assets/Components/SidebarUser';
import { useNavigate } from "react-router-dom";
import Select from 'react-select';

export default function AddProduct() {
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    newCategory: '',
    stockQuantity: '',
    price: ''
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5064/api/category');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedStockQuantity = parseInt(formData.stockQuantity);
    const parsedPrice = parseFloat(formData.price);

    if (isNaN(parsedStockQuantity) || parsedStockQuantity < 0) {
      alert('Please enter a valid stock quantity');
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      alert('Please enter a valid price');
      return;
    }

    const trimmedCategoryName = (selectedCategory || formData.newCategory || "").trim();
    if (!trimmedCategoryName) {
      alert('Please select or type a category');
      return;
    }

    let finalCategoryId = null;
    const matchedCategory = categories.find(
      c => c.category_Name.toLowerCase() === trimmedCategoryName.toLowerCase()
    );

    if (matchedCategory) {
      finalCategoryId = matchedCategory.category_ID;
    } else {
      try {
        const token = localStorage.getItem("token");
        const createResponse = await fetch('http://localhost:5064/api/category', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ category_Name: trimmedCategoryName })
        });

        if (!createResponse.ok) throw new Error(await createResponse.text());
        const newCat = await createResponse.json();
        finalCategoryId = newCat.category_ID;
        await fetchCategories();
      } catch (error) {
        alert("Failed to create new category: " + error.message);
        return;
      }
    }

    const newProduct = {
      product_Name: formData.productName.trim(),
      description: formData.description.trim(),
      category_ID: finalCategoryId,
      stock_Quantity: parsedStockQuantity,
      price: parsedPrice
    };

    try {
      const token = localStorage.getItem("token");

      const response = await fetch('http://localhost:5064/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });

      const resultText = await response.text();
      if (!response.ok) throw new Error(resultText);

      alert('Product added successfully!');
      window.location.href = "/Product";

      setFormData({
        productName: '',
        description: '',
        newCategory: '',
        stockQuantity: '',
        price: ''
      });
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`Failed to add product: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-8 flex flex-col">
        <Header />
        <div className="p-10 max-w-lg mx-auto mt-10">
          <h1 className="text-2xl font-semibold mb-6 text-center underline">Add Product</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-gray-800 hover:text-amber-500 mb-5"
          >
            &lt;&lt; Back
          </button>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="productName"
              placeholder="Product Name"
              value={formData.productName}
              onChange={(e) => handleInputChange("productName", e.target.value)}
              className="border p-2 w-full rounded-md"
              required
            />

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="border p-2 w-full rounded-md"
              required
            />

            <div>
              <Select
                options={categories.map(cat => ({
                  value: cat.category_ID,
                  label: cat.category_Name
                }))}
                onChange={(selected) => {
                  setSelectedCategory(selected ? selected.label : '');
                  handleInputChange("newCategory", selected ? selected.label : '');
                }}
                placeholder="Start typing or select a category"
                isClearable
                isSearchable
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: '#fff',
                    borderColor: '#000',
                    boxShadow: state.isFocused ? '0 0 0 1px #000' : 'none',
                    borderRadius: '0.375rem',
                    padding: '2px 6px',
                    fontSize: '1rem',
                    minHeight: '2.5rem',
                    cursor: 'text',
                    '&:hover': {
                      borderColor: '#000'
                    }
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? '#2563eb'
                      : state.isFocused
                      ? '#eff6ff'
                      : '#fff',
                    color: state.isSelected ? '#fff' : '#111827',
                    padding: '0.5rem 0.75rem'
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 20
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: '#9ca3af'
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: '#111827'
                  }),
                  input: (base) => ({
                    ...base,
                    color: '#111827'
                  })
                }}
              />
            </div>

            <input
              type="number"
              name="stockQuantity"
              placeholder="Stock Quantity"
              value={formData.stockQuantity}
              onChange={(e) => handleInputChange("stockQuantity", e.target.value)}
              className="border p-2 w-full rounded-md"
              required
            />

            <input
              type="number"
              step="0.01"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="border p-2 w-full rounded-md"
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
