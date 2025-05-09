import { Routes, Route, Navigate } from 'react-router-dom';
import Landingpage from './Page/Landingpage';
import SignUpForm from './Page/SignUpForm';
import StepTwo from './Page/StepTwo';
import Contact from './Page/Contact';
import Login from './Page/Login';
import Forgotpassword from './Page/Forgotpassword';
import UserDashboard from './Page/UserDashboard';
import AdminDashboard from './Page/AdminDashboard';
import Product from './Page/Product';
import Customer from './Page/Customer';
import AddProduct from './Page/AddProduct';
import AddCustomer from './Page/AddCustomer';
import EditProduct from './Page/EditProduct';
import EditCustomer from './Page/EditCustomer';
import See_Messages from './Page/See_Messages';
import See_Users from './Page/See_Users';
import SettingsPage from './Page/SettingsPage';
import Logout from './Page/Logout';
import ContactDashboard from "./Page/ContactDashboard";
import SidebarUser from './assets/Components/SidebarUser';
import SidebarAdmin from './assets/Components/SidebarAdmin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/landingpage" />} />
      <Route path="/landingpage" element={<Landingpage />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/step2" element={<StepTwo />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/Forgotpassword" element={<Forgotpassword />} />
      <Route path="/UserDashboard" element={<UserDashboard />} />
      <Route path="/AdminDashboard" element={<AdminDashboard />} />
      <Route path="/Product" element={<Product />} />
      <Route path="/Customer" element={<Customer />} />
      <Route path="/See_Messages" element={<See_Messages />} />
      <Route path="/See_Users" element={<See_Users />} />
      <Route path="/AddProduct" element={<AddProduct />} />
      <Route path="/AddCustomer" element={<AddCustomer />} />
      <Route path="/SidebarUser" element={<SidebarUser />} />
      <Route path="/SidebarAdmin" element={<SidebarAdmin />} />
      <Route path="/EditProduct/:id" element={<EditProduct />} />
      <Route path="/EditCustomer/:id" element={<EditCustomer />} />
      <Route path="/SettingsPage" element={<SettingsPage />} />
      <Route path="/Logout" element={<Logout />} />
      <Route path="/messages" element={<ContactDashboard />} />
    </Routes>
  );
}

export default App;
