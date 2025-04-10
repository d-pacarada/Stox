import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import stoxLogo from "./assets/stox-logo.png";
import landing1 from "./assets/landing1.png";
import Icon from "./assets/Icon.png";
import Icon2 from "./assets/Icon2.png";
import metode from "./assets/metode_EOQ__Economic_Order_Quantity__dalam_manajemen_inventori-removebg-preview 1.png";
import Vector from "./assets/Vector.png";
import "./index.css";
import { Menu, X } from "lucide-react"; 
import { Link } from 'react-router-dom';


function Landingpage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="text-[#112D4E]">
      <div className="mx-4 md:mx-20">
        {/* Navbar */}
        <nav className="bg-grey-50 flex items-center justify-between px-4 py-2 mt-5">
          <div className="flex items-center">
            <img src={stoxLogo} alt="stoxLogo" className="h-10 w-auto" />
          </div>
          <div className="hidden md:flex items-center space-x-7">
          <Link to="/landingpage" className="text-gray-800">Home</Link>
            <Link to="/contact" className="text-gray-800">Contact</Link>
            <Link to="/signup" className="bg-[#112D4E] text-white px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-500 hover:border hover:border-blue-500"> Sign Up</Link>
            <Link to="/login" className="bg-white text-[#112D4E] px-4 py-2 border border-[#112D4E] rounded-lg hover:bg-[#112D4E] hover:text-gray-50"> Login</Link>
          </div>
          {/* Hamburger for mobile */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
        <div className="flex flex-col md:hidden items-center space-y-2 pb-4">
          <Link to="/" className="text-gray-800">Home</Link>
          <Link to="/contact" className="text-gray-800">Contact</Link>
          <Link to="/signup" className="bg-[#112D4E] text-white px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-500 hover:border hover:border-blue-500">Sign Up</Link>
          <Link to="/login" className="bg-white text-[#112D4E] px-4 py-2 border border-[#112D4E] rounded-lg hover:bg-[#112D4E] hover:text-gray-50">Login</Link>
        </div>
        )}

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-10 md:mt-0">
          <div className="text-center md:text-left md:ml-10">
            <p className="text-4xl md:text-5xl text-[#112D4E] mb-1 font-bold">A New Era in Stock Tracking</p>
            <p className="text-4xl md:text-5xl text-amber-500 font-bold">Easy, Fast, Reliable!</p>
            <h6 className="mt-5 font-bold">Check Every Product, Track Every Sale!</h6>
          </div>
          <div className="hidden md:block">
            <img src={landing1} alt="landing1" />
          </div>
        </div>

        {/* Features */}
        <div className="mt-10">
          <div className="text-center underline font-bold text-3xl">
            <h1>Make Stock Management Smart!</h1>
          </div>
          <section className="flex flex-col md:flex-row justify-center items-start md:space-x-16 px-4 py-8 mt-7">
            <div className="text-center max-w-xs mx-auto mb-8 md:mb-0">
              <img src={Vector} alt="Vector" className="mx-auto mb-4"/>
              <h6 className="text-lg font-semibold mb-1">Track your products <br /> instantly</h6>
              <p className="text-sm text-gray-700">
                Instantly see which products are left in stock. Take precautions before your products run out and manage your orders on time with low stock alerts.
              </p>
            </div>
            <div className="text-center max-w-xs mx-auto mb-8 md:mb-0">
              <img src={Icon} alt="Icon" className="mx-auto mb-1"/>
              <h6 className="text-lg font-semibold mb-2">Automatically update <br /> sales and stocks</h6>
              <p className="text-sm text-gray-700">
                Each time a sale is made, the system deducts the stock, so you don't have to enter it manually. Add and update products with a single click, save time.
              </p>
            </div>
            <div className="text-center max-w-xs mx-auto">
              <img src={Icon2} alt="Icon2" className="mx-auto mb-1"/>
              <h6 className="text-lg font-semibold mb-2">Easily manage invoices <br /> and customer records</h6>
              <p className="text-sm text-gray-700">
                Quickly view each transaction by storing customer information and invoice records in the system.
              </p>
            </div>
          </section>
        </div>

        {/* Info Section */}
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-6 py-12">
          <div className="w-full md:w-1/2 mb-6 md:mb-0 hidden md:block">
            <img src={metode} alt="metode" className="w-full h-auto" />
          </div>
          <div className="w-full md:w-1/2 md:pl-12 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-[#112D4E] mb-4">
              Simplify Your Stock Management,<br />Grow Your Business!
            </h1>
            <p className="text-[#112D4E] font-medium leading-relaxed">
              Track your business's stocks instantly and manage all processes automatically. Your stocks will be updated automatically as you make sales, so everything will be under control without the need for manual processing. Easily manage invoices and customer records, quickly access past orders, and store customer information securely.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#112D4E] text-white py-6 mx-0">
        <footer className="flex flex-col items-center justify-center">
          <img src={stoxLogo} alt="stoxLogofoot" className="h-20 w-auto mb-2 mt-10" />
          <p className="text-sm mt-5">&copy; 2025 STOX — All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default Landingpage;