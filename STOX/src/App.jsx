import { Routes, Route } from 'react-router-dom';
import Landingpage from './Landingpage';
import SignUpForm from './SignUpForm';
import StepTwo from './StepTwo'; 
import Contact from './Contact';
import { Link } from 'react-router-dom';



function App() {
  return (
    <Routes>
      <Route path="/landingpage" element={<Landingpage />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/step2" element={<StepTwo />} />
      <Route path="/contact" element={<Contact />} /> 
    </Routes>
  );
}

export default App;
