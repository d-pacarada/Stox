import React, { useState, useEffect } from 'react';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";
import { Link, useNavigate } from 'react-router-dom';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("ID-Ascending");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5064/api/product");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`http://localhost:5064/api/product/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      setProducts(prev => prev.filter(p => p.product_ID !== productId));
      alert("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const [sortField, sortOrder] = sortOption.split("-");

  const sortedProducts = [...products]
    .filter(product =>
      product.product_Name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortField.toLowerCase()] ?? "";
      let bValue = b[sortField.toLowerCase()] ?? "";

      if (sortField === "Price" || sortField === "Stock_Quantity" || sortField === "ID") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (sortOrder === "Ascending") return aValue > bValue ? 1 : -1;
      else return aValue < bValue ? 1 : -1;
    });

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, product) => acc + product.stock_Quantity, 0);
  const totalPrice = products.reduce((acc, product) => acc + (product.price * product.stock_Quantity), 0);

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
  <SidebarUser />
  <div className="flex-1 p-4 md:p-8 flex flex-col">
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
          <option value="ID-Ascending">ID (Ascending)</option>
          <option value="ID-Descending">ID (Descending)</option>
          <option value="product_Name-Ascending">Name (A-Z)</option>
          <option value="product_Name-Descending">Name (Z-A)</option>
          <option value="categoryName-Ascending">Category (A-Z)</option>
          <option value="categoryName-Descending">Category (Z-A)</option>
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
          {sortedProducts.map((product) => (
            <tr key={product.product_ID} className="text-center border-b">
              <td className="p-3">{product.product_ID}</td>
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
                  onClick={() => handleDelete(product.product_ID)}
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

    {/* Footer Bar */}
    <div className="bg-[#112D4E] text-white p-2 rounded-md flex flex-col md:flex-row justify-around items-center text-lg font-semibold mt-8 space-y-4 md:space-y-0 md:ml-10 md:mr-10 lg:ml-15 lg:mr-15">
      <p>Product Number: {totalProducts}</p>
      <p>Total Stock Quantity: {totalStock}</p>
      <p>Total Price: {totalPrice}€</p>
    </div>
  </div>
</div>

  );
}

export default ProductList;
