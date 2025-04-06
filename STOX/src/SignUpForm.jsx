import React, { useState } from 'react';
import illustration from './assets/illustration.png';
import stoxLogo from './assets/stox-logo.png';
import { useNavigate } from 'react-router-dom';

const SignUpForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    businessNumber: '',
    address: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!/^[a-zA-Z0-9\s.,&\-()']+$/.test(formData.businessName)) {
      newErrors.businessName = 'Invalid characters in business name';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!/^\d{9}$/.test(formData.businessNumber)) {
      newErrors.businessNumber = 'Business number must be exactly 9 digits';
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(formData.address)) {
      newErrors.address = 'Address must contain only letters and numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Form submitted:', formData);
      navigate('/step2'); // Navigate to next step
    }
  };

  return (
    <div className="signup-wrapper">
      {/* Left side image */}
      <div className="left-panel">
        <div className="image-wrapper">
          <img src={illustration} alt="Illustration" />
        </div>
      </div>

      {/* Right side form */}
      <div className="right-panel">
        <img src={stoxLogo} alt="STOX Logo" className="logo-img" />

        <div className="header-row">
          <button className="back-button">&lt;&lt; Back</button>
          <h2 className="form-title">Sign Up</h2>
          <p className="step-text">1 Step 2</p>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset className="input-fieldset">
            <legend>Business name</legend>
            <input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder={errors.businessName ? '' : 'Example business LLC'}
              className={errors.businessName ? 'error' : ''}
            />
            {errors.businessName && (
              <span className="input-error">{errors.businessName}</span>
            )}
          </fieldset>
          
          <fieldset className="input-fieldset">
            <legend>Email</legend>
            <input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={errors.email ? '' : 'business@domain.com'}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="input-error">{errors.email}</span>
            )}
          </fieldset>

          <fieldset className="input-fieldset">
            <legend>Business number</legend>
            <input
              id="businessNumber"
              name="businessNumber"
              maxLength="9"
              pattern="\d*"
              value={formData.businessNumber}
              onChange={handleChange}
              placeholder={errors.businessNumber ? '' : '123456789'}
              className={errors.businessNumber ? 'error' : ''}
            />
            {errors.businessNumber && (
              <span className="input-error">{errors.businessNumber}</span>
            )}
          </fieldset>

          <fieldset className="input-fieldset">
            <legend>Address</legend>
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={errors.address ? '' : 'Prishtina'}
              className={errors.address ? 'error' : ''}
            />
            {errors.address && (
              <span className="input-error">{errors.address}</span>
            )}
          </fieldset>

          <button type="submit">Continue</button>
        </form>

        <p className="login-text">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
