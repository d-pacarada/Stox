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
import AddProduct from './Page/AddProduct';
import EditProduct from './Page/EditProduct';
import See_Messages from './Page/See_Messages';
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
      <Route path="/See_Messages" element={<See_Messages />} />
      <Route path="/AddProduct" element={<AddProduct />} />
      <Route path="/SidebarUser" element={<SidebarUser />} />
      <Route path="/SidebarAdmin" element={<SidebarAdmin />} />
      <Route path="/EditProduct/:id" element={<EditProduct />} />
    </Routes>
  );
}

export default App;
