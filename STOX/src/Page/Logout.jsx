import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any stored auth data
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Optionally, clear all localStorage
    // localStorage.clear();

    // Redirect to login page
    navigate("/login");
  }, [navigate]);

  return null;
}

export default Logout;
