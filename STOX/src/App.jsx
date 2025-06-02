  import React, { useEffect, useState, useCallback } from 'react';
  import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
  import PrivateRoute from './assets/Components/PrivateRoute.jsx';
  import Landingpage from './Page/Landingpage';
  import SignUpForm from './Page/SignUpForm';
  import StepTwo from './Page/StepTwo';
  import Contact from './Page/Contact';
  import Login from './Page/Login';
  import ResetPassword from './Page/ResetPassword';
  import UserDashboard from './Page/UserDashboard';
  import AdminDashboard from './Page/AdminDashboard';
  import Product from './Page/Product';
  import Customer from './Page/Customer';
  import AddProduct from './Page/AddProduct';
  import AddCustomer from './Page/AddCustomer';
  import AddSale from './Page/AddSale';
  import EditProduct from './Page/EditProduct';
  import EditCustomer from './Page/EditCustomer';
  import See_Messages from './Page/See_Messages';
  import AddPurchase from './Page/AddPurchase';
  import See_Users from './Page/See_Users';
  import Sale from './Page/Sale';
  import Purchase from './Page/Purchase';
  import SettingsPage from './Page/SettingsPage';
  import ContactDashboard from './Page/ContactDashboard';
  import SidebarUser from './assets/Components/SidebarUser';
  import SidebarAdmin from './assets/Components/SidebarAdmin';
  import ForgotLink from './Page/ForgotLink';
  import Income from './Page/Income';

  function App() {
    const [initialRedirect, setInitialRedirect] = useState(null);
    const [refreshInfo, setRefreshInfo] = useState({
      refreshedAt: null,
      nextRefreshIn: null
    });
    const location = useLocation();
    
    // Token refresh management
    const [refreshTimeoutId, setRefreshTimeoutId] = useState(null);
    const [countdownIntervalId, setCountdownIntervalId] = useState(null);

    // Token refresh function
    const refreshToken = useCallback(async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      console.log("🔄 Attempting to refresh token...");

      const res = await fetch("http://localhost:5064/api/auth/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error("Token refresh failed: " + errText);
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      if (data.role) localStorage.setItem("role", data.role);

      const refreshedAt = new Date().toISOString();
      console.log("✅ Token refreshed successfully at:", refreshedAt);

      setRefreshInfo({
      refreshedAt,
      nextRefreshIn: 3600
      });

      window.dispatchEvent(new CustomEvent("token-refreshed", {
      detail: {
      refreshedAt,
      nextRefreshIn: 3600
    }
    }));

      scheduleTokenRefresh();
      return true;
    } catch (error) {
      console.error("❌ Token refresh failed:", error.message);
      localStorage.clear();
      setRefreshInfo({ refreshedAt: null, nextRefreshIn: null });
      setInitialRedirect("/login");
      window.dispatchEvent(new CustomEvent("user-logged-out"));
      return false;
    }
  }, []);


    // Schedule token refresh
    const scheduleTokenRefresh = useCallback(() => {
      if (refreshTimeoutId || countdownIntervalId) {
        console.log("🔁 Token refresh already scheduled. Skipping...");
        return;
      }
    
      console.log("🕓 Scheduling token refresh...");
    
      const refreshDelayMs = 60 * 60 * 1000;
      let secondsRemaining = 60 * 60;
    
      const timeoutId = setTimeout(() => {
        console.log("✅ Refresh time reached! Attempting to refresh...");
        refreshToken();
      }, refreshDelayMs);
      setRefreshTimeoutId(timeoutId);
    
      const intervalId = setInterval(() => {
        secondsRemaining -= 1;
    
        setRefreshInfo(prev => ({
          ...prev,
          nextRefreshIn: secondsRemaining,
        }));
    
        if (secondsRemaining % 10 === 0) {
          console.log(`⏳ ${secondsRemaining} seconds remaining until token refresh...`);
        }
    
        if (secondsRemaining <= 0) {
          clearInterval(intervalId);
          console.log("⏰ Countdown complete. Waiting for token refresh...");
        }
      }, 1000);
      setCountdownIntervalId(intervalId);
    
      console.log("✅ Token refresh scheduled in 3600 seconds");
    }, [refreshToken, refreshTimeoutId, countdownIntervalId]);    


    // Clear timers on unmount
    useEffect(() => {
      return () => {
        if (refreshTimeoutId) {
          clearTimeout(refreshTimeoutId);
        }
        if (countdownIntervalId) {
          clearInterval(countdownIntervalId);
        }
      };
    }, [refreshTimeoutId, countdownIntervalId]);

    // Listen for custom events
    useEffect(() => {
      const handleLoginEvent = (e) => {
        console.log("🔐 Login event received in App.jsx:", e.detail);
        // Schedule token refresh after login
        console.log("🕓 Scheduling token refresh after login...");
        scheduleTokenRefresh();
      };

      const handleLogoutEvent = () => {
        console.log("🚪 Logout event received in App.jsx");
        setRefreshInfo({ refreshedAt: null, nextRefreshIn: null });
        
        // Clear timers
        if (refreshTimeoutId) {
          clearTimeout(refreshTimeoutId);
          setRefreshTimeoutId(null);
        }
        if (countdownIntervalId) {
          clearInterval(countdownIntervalId);
          setCountdownIntervalId(null);
        }
      };

      // Add event listeners
      window.addEventListener('user-logged-in', handleLoginEvent);
      window.addEventListener('user-logged-out', handleLogoutEvent);

      // Cleanup event listeners
      return () => {
        window.removeEventListener('user-logged-in', handleLoginEvent);
        window.removeEventListener('user-logged-out', handleLogoutEvent);
      };
    }, [scheduleTokenRefresh, refreshTimeoutId, countdownIntervalId]);

    // Initial authentication check
    useEffect(() => {
      const token = localStorage.getItem("token");
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const role = localStorage.getItem("role");

      const attemptRefresh = async () => {
        const success = await refreshToken();
        if (success) {
          const userRole = localStorage.getItem("role");
          setInitialRedirect(userRole === "Admin" ? "/AdminDashboard" : "/UserDashboard");
        }
      };

      const checkTokenExpiry = (token) => {
        try {
          // Decode JWT token to check expiry (basic implementation)
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          // If token expires in less than 10 minutes, refresh it
          return payload.exp - currentTime < 600; // 10 minutes
        } catch (error) {
          console.error("Error checking token expiry:", error);
          return true; // Assume expired if we can't decode
        }
      };

      if (!token && storedRefreshToken) {
        console.log("🔄 No token found, attempting refresh...");
        attemptRefresh();
      } else if (token && role && location.pathname === "/") {
        // Check if token is about to expire
        if (checkTokenExpiry(token)) {
          console.log("🔄 Token expiring soon, refreshing...");
          attemptRefresh();
        } else {
          // Schedule token refresh for existing authenticated users
          console.log("🕓 Scheduling token refresh for existing session...");
          scheduleTokenRefresh();
          setInitialRedirect(role === "Admin" ? "/AdminDashboard" : "/UserDashboard");
        }
      } else {
        setInitialRedirect("/landingpage");
      }
    }, [location.pathname, refreshToken, scheduleTokenRefresh]);

    // Global token refresh status display
    const TokenRefreshStatus = () => {
      const token = localStorage.getItem("token");
      if (!token || !refreshInfo.refreshedAt) return null;
    
      const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };
    };    

    if (initialRedirect === null) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-blue-500 rounded-full animate-spin mb-2"></div>
            <p className="text-gray-500 text-sm">Initializing application...</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Global Token Refresh Status */}
        <TokenRefreshStatus />
        
        <Routes>
          <Route path="/" element={<Navigate to={initialRedirect} />} />
          <Route path="/landingpage" element={<Landingpage />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/step2" element={<StepTwo />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/ForgotLink" element={<ForgotLink />} />

          {/* Protected Routes */}
          <Route path="/UserDashboard" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><UserDashboard /></PrivateRoute>
          } />
          <Route path="/AdminDashboard" element={
            <PrivateRoute allowedRoles={["Admin"]}><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/Product" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><Product /></PrivateRoute>
          } />
          <Route path="/Customer" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><Customer /></PrivateRoute>
          } />
          <Route path="/See_Messages" element={
            <PrivateRoute allowedRoles={["Admin"]}><See_Messages /></PrivateRoute>
          } />
          <Route path="/See_Users" element={
            <PrivateRoute allowedRoles={["Admin"]}><See_Users /></PrivateRoute>
          } />
          <Route path="/AddProduct" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><AddProduct /></PrivateRoute>
          } />
          <Route path="/AddCustomer" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><AddCustomer /></PrivateRoute>
          } />
          <Route path="/AddSale" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><AddSale /></PrivateRoute>
          } />
          <Route path="/AddPurchase" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><AddPurchase /></PrivateRoute>
          } />
          <Route path="/Sale" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><Sale /></PrivateRoute>
          } />
          <Route path="/Purchase" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><Purchase /></PrivateRoute>
          } />
          <Route path="/EditProduct/:id" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><EditProduct /></PrivateRoute>
          } />
          <Route path="/EditCustomer/:id" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><EditCustomer /></PrivateRoute>
          } />
          <Route path="/SettingsPage" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><SettingsPage /></PrivateRoute>
          } />
          <Route path="/messages" element={
            <PrivateRoute allowedRoles={["Admin"]}><ContactDashboard /></PrivateRoute>
          } />
          <Route path="/Income" element={
            <PrivateRoute allowedRoles={["User", "Admin"]}><Income /></PrivateRoute>
          } />
          <Route path="/SidebarUser" element={
            <PrivateRoute allowedRoles={["User"]}><SidebarUser /></PrivateRoute>
          } />
          <Route path="/SidebarAdmin" element={
            <PrivateRoute allowedRoles={["Admin"]}><SidebarAdmin /></PrivateRoute>
          } />
        </Routes>
      </>
    );
  }

  export default App;