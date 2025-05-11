import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import chartImg from "../images/chart.png";
import iconproduct from "../images/Iconproduct.png";
import logoutIcon from "../images/logout.png";
import mail from "../images/mail.png";
import shape from "../images/shape.png";
import shoppingcart from "../images/shoppingcart.png";
import user from "../images/user.png";
import stoxLogo from "../images/stox-logo.png";
import Panel from "../images/panel.png";
import Purchase from "../images/purchase.png";
import LogoutModal from "./LogoutModal";

function SidebarUser() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

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
            <Link to="/UserDashboard" className={linkClass("/UserDashboard")}>
              <img src={chartImg} alt="" />
              <h3>Overview</h3>
            </Link>
            <Link to="/Product" className={linkClass("/Product")}>
              <img src={iconproduct} alt="" />
              <h3 className='ml-1.5'>Products</h3>
            </Link>
            <Link to="/Sale" className={linkClass("/Sale")}>
              <img src={shoppingcart} alt="" />
              <h3>Sales</h3>
            </Link>
            <Link to="/Customer" className={linkClass("/Customer")}>
              <img src={user} alt="" />
              <h3>Customers</h3>
            </Link>
             <Link to="/Purchase" className={linkClass("/Purchase")}>
              <img src={Purchase} alt="" />
              <h3>Purchase</h3>
            </Link>
            {role === "Admin" && (
              <Link to="/AdminDashboard" className={linkClass("/AdminDashboard")}>
                <img src={Panel} alt="" />
                <h3>Admin Panel</h3>
              </Link>
            )}
          </div>
        </div>
        <div className='flex flex-col gap-6 m-5'>
          <Link to="/messages" className={linkClass("/messages")}>
            <img src={mail} alt="" />
            <h3>Contact Us</h3>
          </Link>
          <Link to="/SettingsPage" className={linkClass("/SettingsPage")}>
            <img src={shape} alt="" />
            <h3>Settings</h3>
          </Link>
          <button onClick={() => setShowLogout(true)} className="flex items-center gap-3 text-white">
            <img src={logoutIcon} alt="" />
            <h3>Logout</h3>
          </button>
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
          <Link to="/UserDashboard" className={mobileLinkClass("/UserDashboard")}>Overview</Link>
          <Link to="/Product" className={mobileLinkClass("/Product")}>Products</Link>
          <Link to="/Sale" className={mobileLinkClass("/Sale")}>Sales</Link>
          <Link to="/Customer" className={mobileLinkClass("/Customer")}>Customers</Link>
          <Link to="/Purchase" className={mobileLinkClass("/Purchase")}>Purchase</Link>
          {role === "Admin" && (
            <Link to="/AdminDashboard" className={mobileLinkClass("/AdminDashboard")}>Admin Panel</Link>
          )}
          <Link to="/messages" className={mobileLinkClass("/messages")}>Contact Us</Link>
          <Link to="/SettingsPage" className={mobileLinkClass("/SettingsPage")}>Settings</Link>
          <button onClick={() => setShowLogout(true)} className="text-left text-white">Logout</button>
        </div>
      )}

      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={() => {
            localStorage.clear();
            navigate("/login");
          }}
        />
      )}
    </>
  );
}

export default SidebarUser;
