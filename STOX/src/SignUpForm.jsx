import React, { useState } from "react";
import illustration from "./assets/images/illustration.png";
import stoxLogo from "./assets/images/stox-logo.png";
import { useNavigate } from "react-router-dom";

const SignUpForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    businessNumber: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!/^[a-zA-Z0-9\s.,&\-()']+$/.test(formData.businessName)) {
      newErrors.businessName = "Invalid characters in business name";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!/^\d{9}$/.test(formData.businessNumber)) {
      newErrors.businessNumber = "Business number must be exactly 9 digits";
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(formData.address)) {
      newErrors.address = "Address must contain only letters and numbers";
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
      console.log("Form submitted:", formData);
      navigate("/step2");
    }
  };

  return (
    <div className="flex flex-col xl:flex-row min-h-screen font-sans bg-white">
      {/* Left Image Panel */}
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

        {/* Header Row */}
        <div className="flex items-center justify-between w-full max-w-[600px] mb-8 h-10 relative">
          <button
            type="button"
            className="text-sm font-medium text-gray-800 hover:text-amber-500 transition-colors bg-transparent border-none outline-none font-outfit cursor-pointer"
            onClick={() => navigate(-1)}
          >
            &lt;&lt; Back
          </button>
          <h2 className="text-xl font-bold text-center absolute left-1/2 transform -translate-x-1/2 font-outfit leading-none">
            Sign Up
          </h2>
          <p className="text-sm text-gray-600 whitespace-nowrap font-outfit leading-none">
            1 Step 2
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[500px] flex flex-col items-stretch"
        >
          {[
            {
              id: "businessName",
              label: "Business name",
              placeholder: "Example business LLC",
            },
            { id: "email", label: "Email", placeholder: "business@domain.com" },
            {
              id: "businessNumber",
              label: "Business number",
              placeholder: "123456789",
            },
            { id: "address", label: "Address", placeholder: "Prishtina" },
          ].map(({ id, label, placeholder }) => (
            <fieldset
              key={id}
              className={`relative border border-gray-400 rounded-md mb-5 w-full max-w-[600px] px-3 pt-3 pb-2 ${
                errors[id] ? "border-red-500" : ""
              }`}
            >
              <legend className="px-1 text-xs text-gray-800 font-medium">
                {label}
              </legend>
              <input
                id={id}
                name={id}
                maxLength={id === "businessNumber" ? 9 : undefined}
                pattern={id === "businessNumber" ? "\\d*" : undefined}
                value={formData[id]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full text-sm font-outfit placeholder-montserrat outline-none bg-white ${
                  errors[id] ? "text-red-500" : "text-black"
                }`}
              />
              {errors[id] && (
                <small className="absolute left-3 bottom-[-18px] text-red-500 text-xs font-montserrat">
                  {errors[id]}
                </small>
              )}
            </fieldset>
          ))}

          <button
            type="submit"
            className="w-full max-w-[600px] mx-auto mt-2 py-3 bg-[#0d274b] text-white rounded-md text-base font-medium cursor-pointer"
          >
            Continue
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-5 text-sm text-center">
          Already have an account?{" "}
          <a href="/login" className="text-amber-500 font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};
export default SignUpForm;
