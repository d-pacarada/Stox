import React, { useState } from 'react';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";
import { Link, useNavigate } from 'react-router-dom';

function Sale() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("localId-Ascending");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-0 flex flex-col">
        <Header />

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
              to="/AddSale"
              className="bg-[#112D4E] text-white px-6 py-2 rounded-md hover:bg-[#0b213f] w-full md:w-auto text-center"
            >
              Add Sale
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sale;
