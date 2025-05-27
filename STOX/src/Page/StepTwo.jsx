  import React, { useState } from "react";
  import illustration from "../assets/images/illustration.png";
  import stoxLogo from "../assets/images/stox-logo.png";
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
      if (!formData.transit.trim()) newErrors.transit = "Transit number is required";
      if (!formData.password.trim()) newErrors.password = "Password is required";
      if (!formData.confirmPassword.trim()) newErrors.confirmPassword = "Please confirm your password";

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (formData.password && !passwordRegex.test(formData.password)) {
        newErrors.password = "Password must be at least 8 characters, include one uppercase letter and one number";
      }

      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (validate()) {
        try {
          const signupStep1Raw = localStorage.getItem("signupStep1");
    
          if (!signupStep1Raw) {
            alert("Step 1 data missing. Please restart the signup process.");
            navigate("/signup"); // send user back to start
            return;
          }
    
          const step1Data = JSON.parse(signupStep1Raw);
    
          const allFormData = {
            businessName: step1Data.businessName,
            email: step1Data.email,
            businessNumber: step1Data.businessNumber,
            address: step1Data.address,
            phone: formData.phone,
            transit: formData.transit,
            password: formData.password,
          };
    
          const response = await fetch("http://localhost:5064/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(allFormData),
          });        
    
          if (!response.ok) {
            const error = await response.text();
            alert(`Error: ${error}`);
            return;
          }
    
          const data = await response.json();
          localStorage.removeItem("signupStep1"); // Clear after successful signup
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role); // save role for later if needed
          console.log("Signup successful:", data.token, data.role);

          // Navigate based on role
          if (data.role === "Admin") {
          navigate("/AdminDashboard");
          } else {
          navigate("/UserDashboard");
          }

        } catch (error) {
          console.error("Registration failed:", error);
          alert("Registration failed. Try again.");
        }
      }
    };  

    return (
      <div className="flex justify-center bg-white min-h-screen font-outfit px-4 md:px-10 xl:px-24">
        <div className="flex flex-col xl:flex-row w-full max-w-[1440px]">
          {/* Left Image Panel */}
          <div className="hidden xl:flex w-1/2 items-center justify-start px-8">
            <div className="border-[10px] border-[#0d274b] rounded-xl p-2 bg-white">
              <img src={illustration} alt="Illustration" className="w-full h-auto rounded-lg" />
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full xl:w-1/2 max-w-[540px] p-10 bg-white flex flex-col justify-center items-center mx-auto">
            <img src={stoxLogo} alt="STOX Logo" className="w-[250px] h-[70px] object-contain mb-12 self-start" />

            {/* Header */}
            <div className="flex items-center justify-between w-full max-w-[600px] mb-8 h-10 relative">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-sm font-medium text-gray-800 hover:text-amber-500 transition-colors bg-transparent border-none outline-none cursor-pointer"
              >
                &lt;&lt; Back
              </button>
              <h2 className="text-xl font-bold text-center absolute left-1/2 transform -translate-x-1/2">
                Sign Up
              </h2>
              <p className="text-sm text-gray-600 whitespace-nowrap">2 Step 2</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full max-w-[500px] flex flex-col items-stretch space-y-6">
              {[
                { id: "phone", label: "Phone number", type: "text", placeholder: "044111111" },
                { id: "transit", label: "Transit number", type: "text", placeholder: "111111122222" },
                { id: "password", label: "Password", type: "password", placeholder: "********" },
                { id: "confirmPassword", label: "Confirm password", type: "password", placeholder: "********" },
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
                  {errors[id] && <p className="text-red-500 text-xs pl-1">{errors[id]}</p>}
                </div>
              ))}

              <button
                type="submit"
                className="w-full bg-[#0d274b] text-white font-semibold py-3 rounded-md hover:bg-[#0b213f] transition duration-300"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  export default StepTwo;
