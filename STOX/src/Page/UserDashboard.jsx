import React from 'react';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";

function UserDashboard() {
  return (
    <div className='flex flex-col md:flex-row'>
      <SidebarUser />
      <div className="flex-1">
        <Header />
        <h1 className="p-8">Dashboard Content</h1>
      </div>
    </div>
  )
}

export default UserDashboard;
