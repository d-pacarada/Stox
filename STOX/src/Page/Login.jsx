import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "../assets/images/illustration.png";
import stoxLogo from "../assets/images/stox-logo.png";
import { Link } from 'react-router-dom';

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



  return (
    <div className="flex justify-center bg-white min-h-screen font-sans px-4 md:px-10 xl:px-24">
      <div className="flex flex-col xl:flex-row w-full max-w-[1440px]">
        {/* Left Illustration */}
        <div className="hidden xl:flex w-1/2 items-center justify-start px-8">
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
          {/* Logo */}
          <img
            src={stoxLogo}
            alt="STOX Logo"
            className="w-[250px] h-[70px] object-contain mb-12 self-start"
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
              Login
            </h2>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[500px] flex flex-col items-stretch space-y-6"
          >
            {[
              {
                id: "email",
                label: "Email",
                type: "email",
                placeholder: "you@example.com",
              },
              {
                id: "password",
                label: "Password",
                type: "password",
                placeholder: "Enter your password",
              },
            ].map(({ id, label, type, placeholder }) => (
              <div key={id} className="space-y-1">
                <fieldset
                  className={`border rounded-md px-3 pt-1 pb-2 ${
                    errors[id] ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <legend className="text-sm text-gray-600 px-1">{label}</legend>
                  <input
                    id={id}
                    name={id}
                    type={type}
                    value={formData[id]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full border-none outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                  />
                </fieldset>
                {errors[id] && (
                  <p className="text-red-500 text-xs pl-1">{errors[id]}</p>
                )}
              </div>
            ))}

            {/* Forgot Password */}
            <div className="w-full text-right -mt-2">
              <a
                href="#"
                className="text-sm text-amber-500 hover:underline font-medium"
              >
               <Link to="/forgotpassword" className="text-amber-500">Forgot Password?</Link>
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#0d274b] text-white font-semibold py-3 rounded-md hover:bg-[#0b213f] transition duration-300"
            >
              Login
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-5 text-sm text-center">
            Don’t have an account?{" "}
            <a href="/signup" className="text-amber-500 font-medium hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};  

export default Login;
