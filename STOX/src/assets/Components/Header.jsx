import React, { useEffect, useState } from "react";

function Header() {
  const [userInfo, setUserInfo] = useState({
    businessName: "",
    businessNumber: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5064/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user info");

        const data = await response.json();
        setUserInfo({
          businessName: data.businessName,
          businessNumber: data.businessNumber,
        });
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex justify-between items-center border-b-3 border-[#112D4E] font-sans text-[#112D4E] ml-15 mr-15 mt-7">
      <h3 className="text-lg font-semibold">{userInfo.businessNumber}</h3>
      <h3 className="text-lg font-bold">{userInfo.businessName}</h3>
    </div>
  );
}

export default Header;
