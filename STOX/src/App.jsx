import React, { useEffect, useState } from 'react';
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
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const role = localStorage.getItem("role");

    const attemptRefresh = async () => {
      try {
        const res = await fetch("http://localhost:5064/api/auth/refresh-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(refreshToken)
        });

        if (!res.ok) throw new Error("Refresh token invalid");

        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("role", data.role || role);

        setInitialRedirect(data.role === "Admin" ? "/AdminDashboard" : "/UserDashboard");
      } catch {
        localStorage.clear();
        setInitialRedirect("/login");
      }
    };

    if (!token && refreshToken) {
      attemptRefresh();
    } else if (token && role && location.pathname === "/") {
      setInitialRedirect(role === "Admin" ? "/AdminDashboard" : "/UserDashboard");
    } else {
      setInitialRedirect("/landingpage");
    }
  }, [location.pathname]);

  if (initialRedirect === null) return null;

  return (
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
  );
}

export default App;
