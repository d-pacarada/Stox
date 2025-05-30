import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import stoxLogo from "../assets/images/stox-logo.png";
import illustration from "../assets/images/illustration.png";
import "../index.css";

function Contact() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5064/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.text();
        alert(`Failed to submit: ${err}`);
      } else {
        alert("Message submitted successfully!");
        setFormData({ email: "", message: "" });
      }
    } catch (error) {
      console.error("Error submitting message:", error);
      alert("An error occurred. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className="flex flex-col min-h-screen text-[#112D4E]">
      <div className="mx-4 md:mx-20">
        {/* Navbar */}
        <nav className="bg-grey-50 flex items-center justify-between px-4 py-2 mt-5">
          <div className="flex items-center">
            <img src={stoxLogo} alt="stoxLogo" className="h-10 w-auto" />
          </div>
          <div className="hidden md:flex items-center space-x-7">
            <Link to="/landingpage" className="text-gray-800">Home</Link>
            <Link to="/contact" className="text-gray-800">Contact</Link>
            <Link to="/signup" className="bg-[#112D4E] text-white px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-500 hover:border hover:border-blue-500">Sign Up</Link>
            <Link to="/login" className="bg-white text-[#112D4E] px-4 py-2 border border-[#112D4E] rounded-lg hover:bg-[#112D4E] hover:text-gray-50">Login</Link>
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
            <Link to="/landingpage" className="text-gray-800">Home</Link>
            <Link to="/contact" className="text-gray-800">Contact</Link>
            <Link to="/signup" className="bg-[#112D4E] text-white px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-500 hover:border hover:border-blue-500">Sign Up</Link>
            <Link to="/login" className="bg-white text-[#112D4E] px-4 py-2 border border-[#112D4E] rounded-lg hover:bg-[#112D4E] hover:text-gray-50">Login</Link>
          </div>
        )}
      </div>

      {/* Form & Illustration */}
      <div className="flex flex-col md:flex-row items-center justify-start md:justify-center gap-12 px-6 py-12 flex-1">
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="border-[10px] border-[#0d274b] rounded-xl p-2 bg-white hidden md:block">
            <img src={illustration} alt="Illustration" className="w-full h-auto rounded-lg" />
          </div>
        </div>

        {/* Contact Form */}
        <div className="w-full md:w-1/2 max-w-md">
          <h1 className="text-3xl font-semibold text-[#112D4E] mb-6">Contact Us</h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <fieldset className="border border-gray-300 rounded-md px-3 pt-1 pb-2">
              <legend className="text-sm text-gray-600 px-1">Email</legend>
              <input
                type="email"
                name="email"
                placeholder="business@domain.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-none outline-none text-gray-800"
                required
              />
            </fieldset>

            <fieldset className="border border-gray-300 rounded-md px-3 pt-1 pb-2">
              <legend className="text-sm text-gray-600 px-1">Message</legend>
              <textarea
                name="message"
                rows="4"
                placeholder="Your message here..."
                value={formData.message}
                onChange={handleChange}
                className="w-full border-none outline-none resize-none text-gray-800"
                required
              ></textarea>
            </fieldset>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#112D4E] text-white font-medium py-2 rounded-md hover:bg-[#0e2442] transition duration-300"
            >
              {submitting ? "Sending..." : "Submit"}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#112D4E] text-white py-6 mt-auto">
        <footer className="flex flex-col items-center justify-center">
          <img src={stoxLogo} alt="stoxLogofoot" className="h-20 w-auto mb-2 mt-10" />
          <p className="text-sm mt-5">&copy; 2025 STOX — All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default Contact;
