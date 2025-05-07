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
    <div className="flex flex-col min-h-screen md:flex-row">

      {/* Sidebar */}
      <div className="w-auto md:block w-64">
        {role === "Admin" ? <SidebarAdmin /> : <SidebarUser />}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-0 flex flex-col">
        <Header />
        
        <div>
          <h1 className="text-3xl font-bold text-[#112D4E] mb-6 mt-5 lg:mt-15 text-center underline">Settings</h1>
          
          <div className="p-6 lg:mx-10 lg:mt-15">
            <SettingsComponent />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
