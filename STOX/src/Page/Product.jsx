import React from 'react'
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";
import { Link } from 'react-router-dom';

function Product() {
    return (
      <div className='flex flex-col md:flex-row'>
        <SidebarUser />
        <div className="flex-1">
          <Header />
          <h1 className="p-8">Product Content</h1>
          <Link to="/AddProduct" className="bg-[#112D4E] text-white px-4 py-2 rounded-lg"> Add Product</Link>
        </div>
      </div>
    )
  }

export default Product