import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import illustration from "../assets/images/illustration.png";
import stoxLogo from "../assets/images/stox-logo.png";

function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

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

    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = "Please confirm your password";

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters, include one uppercase letter and one number";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Reset token missing.");
      return;
    }

    if (validate()) {
      try {
        const response = await fetch("http://localhost:5064/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: token,
            newPassword: formData.password
          }),
        });

        const text = await response.text();
        if (response.ok) {
          setMessage("Password reset successful!");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setMessage(`Error: ${text}`);
        }
      } catch (err) {
        console.error(err);
        setMessage("Something went wrong.");
      }
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
        <img src={stoxLogo} alt="STOX Logo" className="w-[250px] h-[70px] object-contain mb-12 self-center xl:self-start" />

        <div className="flex items-center justify-between w-full max-w-[600px] mb-8 h-10 relative">
          <h2 className="text-xl font-bold text-center absolute left-1/2 transform -translate-x-1/2 font-outfit leading-none">
            Reset your password
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6 max-w-[500px]">
          {/* New Password */}
          <div className="space-y-1">
            <fieldset className={`border rounded-md px-3 pt-1 pb-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}>
              <legend className="text-sm text-gray-600 px-1">New Password</legend>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border-none outline-none text-gray-800"
              />
            </fieldset>
            {errors.password && <p className="text-red-500 text-xs pl-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <fieldset className={`border rounded-md px-3 pt-1 pb-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}>
              <legend className="text-sm text-gray-600 px-1">Confirm Password</legend>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border-none outline-none text-gray-800"
              />
            </fieldset>
            {errors.confirmPassword && <p className="text-red-500 text-xs pl-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#112D4E] text-white font-medium py-2 rounded-md hover:bg-[#0e2442] transition duration-300"
          >
            Change Password
          </button>

          {message && (
            <p className="text-sm text-center mt-2 text-gray-700">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
