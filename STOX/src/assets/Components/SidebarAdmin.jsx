import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import chartImg from "../images/chart.png";
import iconproduct from "../images/Iconproduct.png";
import logout from "../images/logout.png";
import mail from "../images/mail.png";
import shape from "../images/shape.png";
import shoppingcart from "../images/shoppingcart.png";
import user from "../images/user.png";
import stoxLogo from "../images/stox-logo.png";

function SidebarUser() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const linkClass = (path) =>
    `flex items-center gap-3 cursor-pointer ${location.pathname === path ? 'text-amber-500' : 'text-white'}`;

  const mobileLinkClass = (path) =>
    `${location.pathname === path ? 'text-amber-500' : 'text-white'}`;

  return (
    <>
      <div className='bg-[#112D4E] w-65 h-screen rounded-tr-2xl rounded-br-2xl flex-col justify-between p-4 hidden md:flex'>
        <div>
          <div className='mb-8 mt-5 flex justify-center'>
            <img src={stoxLogo} alt="Logo" className='h-10' />
          </div>
          <div className='flex flex-col gap-6 m-5'>
            <Link to="/AdminDashboard" className={linkClass("/AdminDashboard")}>
              <img src={chartImg} alt="" />
              <h3>Overview</h3>
            </Link>
            <Link to="/Users" className={linkClass("/Users")}>
              <img src={user} alt="" />
              <h3>Users</h3>
            </Link>
            <Link to="/See_Messages" className={linkClass("/See_Messages")}>
              <img src={mail} alt="" />
              <h3>See Messages</h3>
            </Link>
            <Link to="/UserDashboard" className={linkClass("/UserDashboard")}>
              <img src={chartImg} alt="" />
              <h3>User Dashboard</h3>
            </Link>
          </div>
        </div>
        <div className='flex flex-col gap-6 m-5'>
          <Link to="/SettingsPage" className={linkClass("/SettingsPage")}>
            <img src={shape} alt="" />
            <h3>Settings</h3>
          </Link>
          <Link to="/logout" className={linkClass("/logout")}>
            <img src={logout} alt="" />
            <h3>Logout</h3>
          </Link>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between bg-[#112D4E] p-4">
        <img src={stoxLogo} alt="Logo" className='h-8' />
        <button onClick={() => setIsOpen(!isOpen)} className="text-white text-3xl">
          &#9776;
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#112D4E] flex flex-col gap-4 p-4">
          <Link to="/AdminDashboard" className={mobileLinkClass("/AdminDashboard")}>Overview</Link>
          <Link to="/Users" className={mobileLinkClass("/Users")}>Users</Link>
          <Link to="/See_Messages" className={mobileLinkClass("/See_Messages")}>See Messages</Link>
          <Link to="/settings" className={mobileLinkClass("/settings")}>Settings</Link>
          <Link to="/logout" className={mobileLinkClass("/logout")}>Logout</Link>
        </div>
      )}
    </>
  );
}

export default SidebarUser;
