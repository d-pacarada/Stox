import React, { useEffect, useState } from "react";
import SidebarUser from "../assets/Components/SidebarUser";
import SidebarAdmin from "../assets/Components/SidebarAdmin";
import Header from "../assets/Components/Header";
import SettingsComponent from "../assets/Components/SettingsComponent";

function SettingsPage() {
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <div className="hidden md:block">
        {role === "Admin" ? <SidebarAdmin /> : <SidebarUser />}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 space-y-8">
        <Header />
        
        <div>
          <h1 className="text-3xl font-bold text-[#112D4E] mb-6">Settings</h1>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <SettingsComponent />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
