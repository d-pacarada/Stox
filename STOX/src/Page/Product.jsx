import React, { useState, useEffect } from 'react';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";
import { Link, useNavigate } from 'react-router-dom';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("localId-Ascending");
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5064/api/product/user", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      // Add localId
      const productsWithLocalId = data.map((product, index) => ({
        ...product,
        localId: index + 1
      }));

      setProducts(productsWithLocalId);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const updateLocalIds = (productList) => {
    return productList.map((product, index) => ({
      ...product,
      localId: index + 1
    }));
  };

  const confirmDelete = (productId) => {
    setDeleteId(productId);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5064/api/product/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      const updatedProducts = products.filter(p => p.product_ID !== deleteId);
      const updatedWithLocalIds = updateLocalIds(updatedProducts);

      setProducts(updatedWithLocalIds);
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const [sortField, sortOrder] = sortOption.split("-");

  const filteredProducts = products
    .filter(product =>
      product.product_Name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortField] ?? "";
      let bValue = b[sortField] ?? "";

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (["localId", "stock_Quantity", "price"].includes(sortField)) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (aValue < bValue) return sortOrder === "Ascending" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "Ascending" ? 1 : -1;
      return 0;
    });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, product) => acc + product.stock_Quantity, 0);
  const totalPrice = products.reduce((acc, product) => acc + (product.price * product.stock_Quantity), 0);

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-0 flex flex-col">
        <Header />

        {/* Search and Controls */}
        <div className="flex flex-col mt-4 md:mt-0 md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0 md:ml-10 md:mr-10 lg:ml-15 lg:mr-15 lg:mt-5 md:mt-5">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border px-4 py-2 rounded-md w-full md:w-40"
          />

          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-center w-full md:w-auto">
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="border px-4 py-2 rounded-md w-full md:w-auto"
            >
              <option value="localId-Ascending">ID (Ascending)</option>
              <option value="localId-Descending">ID (Descending)</option>
              <option value="product_Name-Ascending">Name (A-Z)</option>
              <option value="product_Name-Descending">Name (Z-A)</option>
              <option value="category_Name-Ascending">Category (A-Z)</option>
              <option value="category_Name-Descending">Category (Z-A)</option>
              <option value="stock_Quantity-Ascending">Stock (Low to High)</option>
              <option value="stock_Quantity-Descending">Stock (High to Low)</option>
              <option value="price-Ascending">Price (Low to High)</option>
              <option value="price-Descending">Price (High to Low)</option>
            </select>

            <Link
              to="/AddProduct"
              className="bg-[#112D4E] text-white px-6 py-2 rounded-md hover:bg-[#0b213f] w-full md:w-auto text-center"
            >
              Add Product
            </Link>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto flex-grow md:ml-10 md:mr-10 lg:ml-15 lg:mr-15">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-[#112D4E] text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Product</th>
                <th className="p-3">Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Stock Quantity</th>
                <th className="p-3">Price</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product.product_ID} className="text-center border-b">
                  <td className="p-3">{product.localId}</td>
                  <td className="p-3">{product.product_Name}</td>
                  <td className="p-3">{product.description}</td>
                  <td className="p-3">{product.category_Name}</td>
                  <td className="p-3">{product.stock_Quantity}</td>
                  <td className="p-3">{product.price}€</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => navigate(`/EditProduct/${product.product_ID}`)}
                      className="bg-[#112D4E] text-white px-4 py-1 rounded hover:bg-[#0b213f]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(product.product_ID)}
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

        {/* Pagination Controls */}
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#112D4E] text-white hover:bg-[#0b213f]'}`}
          >
            Previous
          </button>
          <p className="text-s">Page {currentPage} of {totalPages}</p>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#112D4E] text-white hover:bg-[#0b213f]'}`}
          >
            Next
          </button>
        </div>

        {/* Footer Bar */}
        <div className="bg-[#112D4E] text-white p-2 rounded-md flex flex-col md:flex-row justify-around items-center text-lg font-semibold mt-8 space-y-4 md:space-y-0 md:ml-10 md:mr-10 lg:ml-15 lg:mr-15 md:mb-8">
          <p>Product Number: {totalProducts}</p>
          <p>Total Stock Quantity: {totalStock}</p>
          <p>Total Price: {totalPrice}€</p>
        </div>
      </div>

      {/* Delete Confirm Popup */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center space-y-4 w-96 shadow-lg border border-[#112D4E]">
            <div className="text-red-600 text-4xl">!</div>
            <h2 className="text-xl font-semibold">Are you sure you want to delete this product?</h2>
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
  );
}

export default ProductList;
