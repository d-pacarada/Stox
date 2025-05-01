import React from 'react';
import SidebarAdmin from '../assets/Components/SidebarAdmin';
import Header from "../assets/Components/Header";

function AdminDashboard() {
  return (
    <div className='flex flex-col md:flex-row'>
        <SidebarAdmin />
        <div className="flex-1">
          <Header />
          <h1 className='p-8'>Admin Dashboard</h1>
        </div>
    </div>
  )
}

export default AdminDashboard;
