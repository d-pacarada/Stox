import React, { useState } from 'react';
import chartImg from "../images/chart.png";
import iconproduct from "../images/Iconproduct.png";
import logout from "../images/logout.png";
import mail from "../images/mail.png";
import shape from "../images/shape.png";
import shoppingcart from "../images/shoppingcart.png";
import user from "../images/user.png";
import stoxLogo from "../images/stox-logo.png";
import { Link } from 'react-router-dom';

function SidebarUser() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className='bg-[#112D4E] w-55 h-screen rounded-tr-2xl rounded-br-2xl flex-col justify-between p-4 hidden md:flex'>
        <div>
          <div className='mb-8 mt-5'>
            <img src={stoxLogo} alt="Logo" className='h-10 m-5'/>
          </div>
          <div className='flex flex-col gap-6 m-5'>
            <Link to="/UserDashboard" className='flex items-center gap-3 cursor-pointer'>
              <img src={chartImg} alt="" />
              <h3 className='text-white'>Overview</h3>
            </Link>
            <Link to="/products" className='flex items-center gap-3 cursor-pointer'>
              <img src={iconproduct} alt="" />
              <h3 className='text-white'>Products</h3>
            </Link>
            <Link to="/orders" className='flex items-center gap-3 cursor-pointer'>
              <img src={shoppingcart} alt="" />
              <h3 className='text-white'>Sales</h3>
            </Link>
            <Link to="/customers" className='flex items-center gap-3 cursor-pointer'>
              <img src={user} alt="" />
              <h3 className='text-white'>Customers</h3>
            </Link>
          </div>
        </div>
        <div className='flex flex-col gap-6 m-5'>
          <Link to="/messages" className='flex items-center gap-3 cursor-pointer'>
            <img src={mail} alt="" />
            <h3 className='text-white'>Contact Us</h3>
          </Link>
          <Link to="/settings" className='flex items-center gap-3 cursor-pointer'>
            <img src={shape} alt="" />
            <h3 className='text-white'>Settings</h3>
          </Link>
          <Link to="/logout" className='flex items-center gap-3 cursor-pointer'>
            <img src={logout} alt="" />
            <h3 className='text-white'>Logout</h3>
          </Link>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between bg-[#112D4E] p-4">
        <img src={stoxLogo} alt="Logo" className='h-8'/>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white text-3xl">
          &#9776;  {/* Hamburger Icon */}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#112D4E] flex flex-col gap-4 p-4">
          <Link to="/UserDashboard" className='text-white'>Overview</Link>
          <Link to="/products" className='text-white'>Products</Link>
          <Link to="/orders" className='text-white'>Sales</Link>
          <Link to="/customers" className='text-white'>Customers</Link>
          <Link to="/messages" className='text-white'>Contact Us</Link>
          <Link to="/settings" className='text-white'>Settings</Link>
          <Link to="/logout" className='text-white'>Logout</Link>
        </div>
      )}
    </>
  )
}

export default SidebarUser;
