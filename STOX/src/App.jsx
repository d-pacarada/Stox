import { Routes, Route, Navigate } from 'react-router-dom';
import Landingpage from './Landingpage';
import SignUpForm from './SignUpForm';
import StepTwo from './StepTwo'; 
import Contact from './Contact';

import Login from './Login';


function App() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/landingpage" />} />
      <Route path="/landingpage" element={<Landingpage />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/step2" element={<StepTwo />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
