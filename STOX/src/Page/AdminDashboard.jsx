import React from 'react';
import SidebarAdmin from '../assets/Components/SidebarAdmin';

function AdminDashboard() {
  return (
    <div className='flex flex-col md:flex-row'>
        <SidebarAdmin />
        <div className="">
          <h1 className=''>Admin Dashboard</h1>
        </div>
    </div>
  )
}

export default AdminDashboard;
