import React, { useState } from 'react';
import illustration from './assets/illustration.png';
import stoxLogo from './assets/stox-logo.png';
import { useNavigate } from 'react-router-dom';

const StepTwo = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: '',
    transit: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};

    // Empty checks
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.transit.trim()) newErrors.transit = 'Transit number is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';

    // Password rules
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters, include one uppercase letter and one number';
    }

    // Confirm password match
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      console.log('Step 2 Data:', formData);
      // Proceed to next step or submit
    }
  };

  return (
    <div className="signup-wrapper">
      {/* Left image panel */}
      <div className="left-panel">
        <div className="image-wrapper">
          <img src={illustration} alt="Illustration" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="right-panel">
        <img src={stoxLogo} alt="STOX Logo" className="logo-img" />

        <div className="header-row">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate('/')}
          >
            &lt;&lt; Back
          </button>
          <h2 className="form-title">Sign Up</h2>
          <p className="step-text">2 Step 2</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Phone number */}
          <fieldset className="input-fieldset">
            <legend>Phone number</legend>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="044111222"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="input-error">{errors.phone}</span>}
          </fieldset>

          {/* Transit number */}
          <fieldset className="input-fieldset">
            <legend>Transit number</legend>
            <input
              type="text"
              id="transit"
              name="transit"
              value={formData.transit}
              onChange={handleChange}
              placeholder="111112222"
              className={errors.transit ? 'error' : ''}
            />
            {errors.transit && <span className="input-error">{errors.transit}</span>}
          </fieldset>

          {/* Password */}
          <fieldset className="input-fieldset">
            <legend>Password</legend>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="input-error">{errors.password}</span>}
          </fieldset>

          {/* Confirm password */}
          <fieldset className="input-fieldset">
            <legend>Confirm password</legend>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="********"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && (
              <span className="input-error">{errors.confirmPassword}</span>
            )}
          </fieldset>

          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};

export default StepTwo;
