import React, { useEffect, useState } from "react";
import SidebarUser from "../assets/Components/SidebarUser";
import SidebarAdmin from "../assets/Components/SidebarAdmin";
import Header from "../assets/Components/Header";
import eoqImage from "../assets/images/landing1.png";

function ContactDashboard() {
  const [formData, setFormData] = useState({ email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (storedRole) setRole(storedRole);

    if (token) {
      fetch("http://localhost:5064/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to fetch user info");
          }
          return res.json();
        })
        .then((data) => {
          setFormData((prev) => ({ ...prev, email: data.email || "" }));
          setUserInfo(data);
        })
        .catch((err) => {
          console.error("Error fetching user info:", err);
        });
    }
  }, []);

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
        setFormData({ email: formData.email, message: "" });
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
      console.error("Error submitting message:", error);
    }

    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen text-[#112D4E] flex-col md:flex-row">
      {/* Sidebar */}
      <div className="md:block">
        {role === "Admin" ? <SidebarAdmin /> : <SidebarUser />}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Header />

        <div className="flex flex-col xl:flex-row items-center justify-center gap-12 px-6 py-12 max-w-screen-xl mx-auto min-h-[calc(100vh-80px)]">
        {/* Illustration */}
          <div className="w-full md:w-1/2 flex justify-center items-center">
            <img
              src={eoqImage}
              alt="EOQ Illustration"
              className="block md:hidden xl:block w-full h-auto xl:w-[700px] object-contain"
            />
          </div>

          {/* Contact Form */}
          <div className="w-full md:w-1/2 max-w-md flex flex-col items-center">
            <h1 className="text-3xl font-semibold mb-6 text-center underline">
              Contact Us
            </h1>

            {userInfo && (
              <div className="mb-4 text-center text-sm text-gray-600">
                <p>
                  <strong>Business:</strong> {userInfo.businessName}
                </p>
                <p>
                  <strong>Number:</strong> {userInfo.businessNumber}
                </p>
              </div>
            )}

            <form className="space-y-6 w-full" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full bg-gray-100 p-2 rounded-md outline-none text-gray-800"
              />

              <textarea
                name="message"
                rows="4"
                placeholder="Your message here..."
                value={formData.message}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-gray-50 outline-none resize-none text-gray-800 border border-gray-300"
                required
              ></textarea>

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
      </div>
    </div>
  );
}

export default ContactDashboard;
