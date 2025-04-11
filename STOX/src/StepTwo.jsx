import React, { useState } from "react";
import illustration from "./assets/images/illustration.png";
import stoxLogo from "./assets/images/stox-logo.png";
import { useNavigate } from "react-router-dom";

const StepTwo = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: "",
    transit: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.transit.trim())
      newErrors.transit = "Transit number is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.confirmPassword.trim())
      newErrors.confirmPassword = "Please confirm your password";

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters, include one uppercase letter and one number";
    }

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Step 2 Data:", formData);
      // Submit or navigate next
    }
  };

  return (
    <div className="flex flex-col xl:flex-row min-h-screen font-outfit bg-white">
      {/* Left Panel */}
      <div className="hidden xl:flex w-1/2 items-center justify-center p-10">
        <div className="border-[10px] border-[#0d274b]  rounded-xl p-2 bg-white">
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

        <div className="flex items-center justify-between w-full max-w-[600px] mb-8 h-10 relative">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-gray-800 hover:text-amber-500 transition-colors bg-transparent border-none outline-none font-outfit cursor-pointer"
          >
            &lt;&lt; Back
          </button>
          <h2 className="text-xl font-bold text-center absolute left-1/2 transform -translate-x-1/2 font-outfit">
            Sign Up
          </h2>
          <p className="text-sm text-gray-600 whitespace-nowrap font-outfit leading-none">
            2 Step 2
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[500px] flex flex-col items-stretch"
        >
          {[
            {
              id: "phone",
              label: "Phone number",
              type: "text",
              placeholder: "044111111",
            },
            {
              id: "transit",
              label: "Transit number",
              type: "text",
              placeholder: "111111122222",
            },
            {
              id: "password",
              label: "Password",
              type: "password",
              placeholder: "********",
            },
            {
              id: "confirmPassword",
              label: "Confirm password",
              type: "password",
              placeholder: "********",
            },
          ].map(({ id, label, type, placeholder }) => (
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
                type={type}
                value={formData[id]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full text-sm bg-white font-outfit placeholder-montserrat outline-none ${
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
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default StepTwo;
