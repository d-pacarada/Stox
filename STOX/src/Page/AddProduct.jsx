import React, { useState, useEffect } from 'react';
import Header from "../assets/Components/Header";
import SidebarUser from '../assets/Components/SidebarUser';
import { useNavigate } from "react-router-dom";
import CreatableSelect from 'react-select/creatable'; 

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5064/api/product/category/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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

    const trimmedCategoryName = (selectedCategory?.label || formData.newCategory || "").trim();
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
        const createResponse = await fetch('http://localhost:5064/api/product/category', {
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

      // Show popup modal instead of alert
      setShowSuccessModal(true);

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
            className="text-sm font-medium text-gray-800 hover:text-amber-500 mb-5 cursor-pointer"
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

            <CreatableSelect
              options={categories.map(cat => ({ value: cat.category_ID, label: cat.category_Name }))}
              onChange={(selected) => {
                setSelectedCategory(selected);
                handleInputChange("newCategory", selected?.label || '');
              }}
              onInputChange={(inputValue, actionMeta) => {
                if (actionMeta.action === 'input-change') {
                  setSelectedCategory({ label: inputValue, value: null });
                  handleInputChange("newCategory", inputValue);
                }
              }}
              value={selectedCategory}
              placeholder="Start typing or select a category"
              isClearable
              isSearchable
            />

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
              className="bg-[#112D4E] text-white px-6 py-2 rounded-md hover:bg-[#0b213f] w-full cursor-pointer"
            >
              Add Product
            </button>
          </form>
        </div>
      </div>

      {/* Success Popup Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 md:ml-65">
          <div className="bg-white p-6 rounded-lg shadow-md w-96 text-center border border-[#112D4E]">
            <h2 className="text-xl font-semibold text-green-700">Product Added Successfully!</h2>
            <p className="mt-2 text-gray-700">The product has been saved.</p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/Product");
              }}
              className="mt-4 px-6 py-2 bg-[#112D4E] text-white rounded hover:bg-[#0b213f] cursor-pointer"
            >
              Go to Product List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
