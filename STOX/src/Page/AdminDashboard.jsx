import React from 'react';
import SidebarAdmin from '../assets/Components/SidebarAdmin';
import Header from "../assets/Components/Header";
import UserActivityPanel from '../assets/Components/UserActivityPanel'; // fixed path

function AdminDashboard() {
  return (
    <div className='flex flex-col md:flex-row'>
      <SidebarAdmin />
      <div className="flex-1">
        <Header />
        <UserActivityPanel />
      </div>
    </div>
  );
}

export default AdminDashboard;
