import React from "react";
import { useNavigate } from "react-router-dom";
import stoxLogo from "./assets/stox-logo.png";
import landing1 from "./assets/landing1.png";
import Icon from "./assets/Icon.png";
import Icon2 from "./assets/Icon2.png";
import metode from "./assets/metode_EOQ__Economic_Order_Quantity__dalam_manajemen_inventori-removebg-preview 1.png";
import Vector from "./assets/Vector.png";
import "./index.css";

function Landingpage() {
  const navigate = useNavigate();

  return (
    <div className="text-[#112D4E]">
        <div className="ml-50 mr-50 ">
<nav className="bg-grey-50 flex items-center justify-between px-4 py-2 m-5">
  {/* Logo on the left, vertically centered */}
  <div className="flex items-center">
    <img
      src={stoxLogo}
      alt="stoxLogo"
      className="h-10 w-auto"
    />
  </div>

  {/* Navigation links on the right, vertically centered */}
  <div className="flex items-center space-x-7">
    <a href="#" className="text-gray-800 ">Home</a>
    <a href="#" className="text-gray-800">Contact</a>
    <a
      href="#"
      className="bg-[#112D4E] text-white px-4 py-2 rounded-lg hover:bg-blue-600"
    >
      Sign Up
    </a>
    <a
      href="#"
      className="bg-white text-[#112D4E] px-4 py-2 border border-[#112D4E] rounded-lg hover:bg-blue-100"
    >
      Login
    </a>
  </div>
</nav>
        <div className="flex items-center justify-between">
            <div className="ml-10">
                <p className="text-5xl text-[#112D4E] mb-1 font-bold">A New Era in Stock Tracking</p>
                <p className="text-5xl text-amber-500 font-bold">Easy, Fast, Reliable!</p>
                <h6 className="mt-5 ml-1 font-bold">Check Every Product, Track Every Sale!</h6>
            </div>
            <div className="">
                <img src={landing1} alt="landing1" />
            </div>
        </div>

        <div className="mt-10">
            <div className="text-center underline font-bold text-3xl">
                <h1>Make Stock Management Smart!</h1>
            </div>
            <section className="flex flex-col md:flex-row justify-center items-start md:space-x-16 px-4 py-8 mt-7">
  {/* Feature 1 */}
  <div className="text-center max-w-xs mx-auto mb-8 md:mb-0">
    <img src={Vector} alt="Vector" className="mx-auto mb-4" />
    <h6 className="text-lg font-semibold mb-1">Track your products <br /> instantly</h6>
    <p className="text-sm text-gray-700">
      Instantly see which products are left in stock. Take precautions before your products run out and manage your orders on time with low stock alerts.
    </p>
  </div>

  {/* Feature 2 */}
  <div className="text-center max-w-xs mx-auto mb-8 md:mb-0">
    <img src={Icon} alt="Icon" className="mx-auto mb-1" />
    <h6 className="text-lg font-semibold mb-2">Automatically update <br /> sales and stocks</h6>
    <p className="text-sm text-gray-700 ">
      Each time a sale is made, the system deducts the stock, so you don't have to enter it manually. Add and update products with a single click, save time.
    </p>
  </div>

  {/* Feature 3 */}
  <div className="text-center max-w-xs mx-auto">
    <img src={Icon2} alt="Icon2" className="mx-auto mb-1" />
    <h6 className="text-lg font-semibold mb-2">Easily manage invoices <br /> and customer records</h6>
    <p className="text-sm text-gray-700">
      Quickly view each transaction by storing customer information and invoice records in the system.
    </p>
  </div>
</section>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-6 py-12 ">
  {/* Left - Image */}
  <div className="w-full md:w-1/2 mb-6 md:mb-0 ">
    <img src={metode} alt="metode" className="w-full h-auto" />
  </div>

  {/* Right - Text */}
  <div className="w-full md:w-1/2 md:pl-12 text-center">
    <h1 className="text-3xl md:text-4xl font-bold text-[#112D4E] mb-4">
      Simplify Your Stock Management,<br />Grow Your Business!
    </h1>
    <p className="text-[#112D4E] font-medium leading-relaxed">
      Track your business's stocks instantly and manage all processes automatically. Your stocks will be updated automatically as you make sales, so everything will be under control without the need for manual processing. Easily manage invoices and customer records, quickly access past orders, and store customer information securely.
    </p>
  </div>
</div>
</div>

    <div className="bg-[#112D4E] text-white py-6 mx-0">
    <footer className="flex flex-col items-center justify-center">
        <img src={stoxLogo} alt="stoxLogofoot" className="h-20 w-auto mb-2 mt-10" />
        <p className="text-sm">&copy; 2025 STOX — All rights reserved.</p>
    </footer>
    </div>

    </div>
    
  );
}

export default Landingpage;
