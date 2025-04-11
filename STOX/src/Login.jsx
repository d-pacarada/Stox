import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "./assets/images/illustration.png";
import stoxLogo from "./assets/images/stox-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Login submitted:", formData);
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex flex-col xl:flex-row min-h-screen font-sans bg-white">
      {/* Left Illustration */}
      <div className="hidden xl:flex w-1/2 items-center justify-center p-10">
        <div className="border-[10px] border-[#0d274b] rounded-xl p-2 bg-white">
          <img
            src={illustration}
            alt="Illustration"
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full xl:w-1/2 max-w-[540px] p-10 bg-white flex flex-col justify-center items-center mx-auto">
        <img
          src={stoxLogo}
          alt="STOX Logo"
          className="w-[250px] h-[70px] object-contain mb-12 self-start"
        />

        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-[600px] mb-8 h-10 relative">
          <button
            type="button"
            className="text-sm font-medium text-gray-800 hover:text-amber-500 transition-colors font-outfit"
            onClick={() => navigate(-1)}
          >
            &lt;&lt; Back
          </button>
          <h2 className="text-xl font-bold text-center absolute left-1/2 transform -translate-x-1/2 font-outfit leading-none">
            Login
          </h2>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[500px] flex flex-col items-stretch"
        >
          {/* Email Field */}
          <fieldset
            className={`relative border border-gray-400 rounded-md mb-5 w-full max-w-[600px] px-3 pt-3 pb-2 ${
              errors.email ? "border-red-500" : ""
            }`}
          >
            <legend className="px-1 text-xs text-gray-800 font-medium">
              Email
            </legend>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full text-sm font-outfit placeholder-montserrat outline-none bg-white ${
                errors.email ? "text-red-500" : "text-black"
              }`}
            />
            {errors.email && (
              <small className="absolute left-3 bottom-[-18px] text-red-500 text-xs font-montserrat">
                {errors.email}
              </small>
            )}
          </fieldset>

          {/* Password Field */}
          <fieldset
            className={`relative border border-gray-400 rounded-md mb-2 w-full max-w-[600px] px-3 pt-3 pb-2 ${
              errors.password ? "border-red-500" : ""
            }`}
          >
            <legend className="px-1 text-xs text-gray-800 font-medium">
              Password
            </legend>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full text-sm font-outfit placeholder-montserrat outline-none bg-white ${
                errors.password ? "text-red-500" : "text-black"
              }`}
            />
            {errors.password && (
              <small className="absolute left-3 bottom-[-18px] text-red-500 text-xs font-montserrat">
                {errors.password}
              </small>
            )}
          </fieldset>

          {/* Forgot Password */}
          <div className="w-full text-right mb-4">
            <a
              href="#"
              className="text-sm text-amber-500 hover:underline font-medium"
            >
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full max-w-[600px] mx-auto py-3 bg-[#0d274b] text-white rounded-md text-base font-medium cursor-pointer"
          >
            Login
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-5 text-sm text-center">
          Don’t have an account?{" "}
          <a href="/signup" className="text-amber-500 font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
