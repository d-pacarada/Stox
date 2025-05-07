import React, { useState } from "react";
import axios from "axios";

function SettingsComponent() {
  const [details, setDetails] = useState({
    address: "",
    phoneNumber: "",
    transitNumber: ""
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const token = localStorage.getItem("token");

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const saveDetails = async () => {
    try {
      await axios.put("http://localhost:5064/api/Settings/update-details", details, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Details updated successfully.");
    } catch (error) {
      alert("Failed to update details.");
      console.error(error);
    }
  };

  const savePassword = async () => {
    if (!passwords.currentPassword) {
      setPasswordMessage("Please enter your current password.");
      return;
    }

    if (!passwords.newPassword) {
      setPasswordMessage("Please enter a new password.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    try {
      setLoadingPassword(true);
      setPasswordMessage("Updating password...");

      await axios.put("http://localhost:5064/api/Settings/update-password", {
        CurrentPassword: passwords.currentPassword,
        NewPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPasswordMessage("Password updated successfully.");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      if (error.response?.data) {
        setPasswordMessage(error.response.data);
      } else {
        setPasswordMessage("Failed to update password.");
      }
      console.error(error);
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

      {/* Change Details */}
      <div>
        <h2 className="text-2xl font-semibold text-[#112D4E] mb-6">Change Details</h2>

        <div className="space-y-6">
          {["Address", "Phone Number", "Transit Number"].map((label) => {
            const name = label.toLowerCase().replace(" ", "");
            return (
              <fieldset key={name} className="border border-gray-300 rounded-md px-3 pt-1 pb-2">
                <legend className="text-sm text-gray-600 px-1">{label}</legend>
                <input
                  type="text"
                  name={name}
                  value={details[name] ?? ""}
                  onChange={handleDetailChange}
                  placeholder={`Enter your ${label.toLowerCase()}`}
                  className="w-full border-none outline-none text-gray-800"
                />
              </fieldset>
            );
          })}

          <button
            onClick={saveDetails}
            className="w-full bg-[#00B100] text-white font-medium py-2 rounded-md hover:bg-green-700 transition duration-300"
          >
            Save
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div>
        <h2 className="text-2xl font-semibold text-[#112D4E] mb-6">Change Password</h2>

        <div className="space-y-6">
          {["currentPassword", "newPassword", "confirmPassword"].map((name) => {
            const label = name.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
            return (
              <fieldset key={name} className="border border-gray-300 rounded-md px-3 pt-1 pb-2">
                <legend className="text-sm text-gray-600 px-1">{label}</legend>
                <input
                  type="password"
                  name={name}
                  value={passwords[name] ?? ""}
                  onChange={handlePasswordChange}
                  placeholder={`Enter ${label}`}
                  className="w-full border-none outline-none text-gray-800"
                />
              </fieldset>
            );
          })}

          {passwordMessage && (
            <div className={`p-2 rounded-md text-white ${passwordMessage.includes("successfully") ? "bg-green-500" : "bg-red-500"}`}>
              {passwordMessage}
            </div>
          )}

          <button
            onClick={savePassword}
            disabled={loadingPassword}
            className={`w-full text-white font-medium py-2 rounded-md transition duration-300 ${
              loadingPassword ? "bg-gray-400" : "bg-[#00B100] hover:bg-green-700"
            }`}
          >
            {loadingPassword ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsComponent;
