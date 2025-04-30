import React, { useState } from "react";
import illustration from "../assets/images/illustration.png";
import stoxLogo from "../assets/images/stox-logo.png";
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
  const [emailExists, setEmailExists] = useState(false);

  const validate = () => {
    const newErrors = {};
    setEmailExists(false);

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
    if (name === "email") setEmailExists(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const checkRes = await fetch("http://localhost:5064/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email })
        });

        const { exists } = await checkRes.json();

        if (exists) {
          setEmailExists(true);
          return;
        }

        localStorage.setItem("signupStep1", JSON.stringify(formData));
        console.log("Form submitted:", formData);
        navigate("/step2");
      } catch (error) {
        console.error("Email check failed:", error);
      }
    }
  };

  return (
    <div className="flex justify-center bg-white min-h-screen font-sans px-4 md:px-10 xl:px-24">
      <div className="flex flex-col xl:flex-row w-full max-w-[1440px]">
        <div className="hidden xl:flex w-1/2 items-center justify-start px-8">
          <div className="border-[10px] border-[#0d274b] rounded-xl p-2 bg-white">
            <img
              src={illustration}
              alt="Illustration"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        <div className="w-full xl:w-1/2 max-w-[540px] p-10 bg-white flex flex-col justify-center items-center mx-auto">
          <img
            src={stoxLogo}
            alt="STOX Logo"
            className="w-[250px] h-[70px] object-contain mb-12 self-start"
          />

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

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[500px] flex flex-col items-stretch space-y-6"
          >
            {["businessName", "email", "businessNumber", "address"].map((id) => {
              const labels = {
                businessName: "Business name",
                email: "Email",
                businessNumber: "Business number",
                address: "Address"
              };
              const placeholders = {
                businessName: "Example business LLC",
                email: "business@domain.com",
                businessNumber: "123456789",
                address: "Prishtina"
              };
              return (
                <div key={id} className="space-y-1">
                  <fieldset
                    className={`border rounded-md px-3 pt-1 pb-2 ${
                      errors[id] || (id === "email" && emailExists) ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <legend className="text-sm text-gray-600 px-1">{labels[id]}</legend>
                    <input
                      id={id}
                      name={id}
                      maxLength={id === "businessNumber" ? 9 : undefined}
                      pattern={id === "businessNumber" ? "\\d*" : undefined}
                      value={formData[id]}
                      onChange={handleChange}
                      placeholder={placeholders[id]}
                      className="w-full border-none outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                    />
                  </fieldset>
                  {errors[id] && (
                    <p className="text-red-500 text-xs pl-1">{errors[id]}</p>
                  )}
                  {id === "email" && emailExists && (
                    <p className="text-red-500 text-xs pl-1">This email is already registered.</p>
                  )}
                </div>
              );
            })}

            <button
              type="submit"
              className="w-full bg-[#0d274b] text-white font-semibold py-3 rounded-md hover:bg-[#0b213f] transition duration-300"
            >
              Continue
            </button>
          </form>

          <p className="mt-5 text-sm text-center">
            Already have an account? {" "}
            <a href="/login" className="text-amber-500 font-medium hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
