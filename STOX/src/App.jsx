import { Routes, Route, Navigate } from 'react-router-dom';
import Landingpage from './Page/Landingpage';
import SignUpForm from './Page/SignUpForm';
import StepTwo from './Page/StepTwo';
import Contact from './Page/Contact';
import Login from './Page/Login';
import Forgotpassword from './Page/Forgotpassword';
import SidebarUser from './assets/Components/SidebarUser';

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
      <Route path="/SidebarUser" element={<SidebarUser />} />
    </Routes>
  );
}

export default App;
