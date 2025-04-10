import { Routes, Route } from 'react-router-dom';
import LandingPage from './Landingpage';
import SignUpForm from './SignUpForm';
import StepTwo from './StepTwo'; // We’ll create this next

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/step2" element={<StepTwo />} />

    </Routes>
  );
}

export default App;
