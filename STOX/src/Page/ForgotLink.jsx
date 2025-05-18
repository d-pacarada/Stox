import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import illustration from "../assets/images/illustration.png";
import stoxLogo from "../assets/images/stox-logo.png";

function ForgotLink() {
  const navigate = useNavigate(); // ← navigate tanımlandı

  const [formData, setFormData] = useState({ email: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.email) {
    setErrors({ email: "Email is required" });
    return;
  }

  try {
    const response = await fetch("http://localhost:5064/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      alert(`Error: ${errorText}`);
    } else {
      const text = await response.text();
      alert(text); // Or show success toast/message
    }
  } catch (error) {
    console.error("Error submitting email:", error);
    alert("Something went wrong. Please try again.");
  }
};

  return (
    <div className='flex justify-center bg-white min-h-screen font-sans px-4 md:px-10 xl:px-24'>
      {/* Left Illustration */}
      <div className="hidden xl:flex w-1/2 items-center justify-start px-8">
        <div className="border-[10px] border-[#0d274b] rounded-xl p-2 bg-white">
          <img src={illustration} alt="Illustration" className="w-full h-auto rounded-lg" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full xl:w-1/2 max-w-[540px] p-10 bg-white flex flex-col justify-center items-center mx-auto">
        {/* Logo */}
        <img
          src={stoxLogo}
          alt="STOX Logo"
          className="w-[250px] h-[70px] object-contain mb-12 self-center xl:self-start"
        />

        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-[600px] mb-8 h-10 relative">
          <button
            type="button"
            className="text-sm font-medium text-gray-800 hover:text-amber-500 transition-colors bg-transparent border-none outline-none font-outfit cursor-pointer"
            onClick={() => navigate(-1)}
          >
            &lt;&lt; Back
          </button>
          <h2 className="text-xl font-bold text-center absolute left-1/2 transform -translate-x-1/2 font-outfit leading-none">
            Forgot your password?
          </h2>
        </div>

        {/* Description */}
        <p className="mb-5 text-sm text-gray-600">
          Don't worry, happens to all of us. Enter your email below to recover your password
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6 max-w-[500px]">
          {/* Email */}
          <div className="space-y-1">
            <fieldset className={`border rounded-md px-3 pt-1 pb-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}>
              <legend className="text-sm text-gray-600 px-1">Email</legend>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="business@domain.com"
                className="w-full border-none outline-none text-gray-800"
              />
            </fieldset>
            {errors.email && <p className="text-red-500 text-xs pl-1">{errors.email}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#112D4E] text-white font-medium py-2 rounded-md hover:bg-[#0e2442] transition duration-300"
          >
            Send Email
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotLink;
