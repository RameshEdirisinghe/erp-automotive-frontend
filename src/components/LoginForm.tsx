import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState<{email?: string, password?: string}>({});
  const navigate = useNavigate();

  const { login, isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFieldErrors({});

    const errors: {email?: string, password?: string} = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await login({ 
        email: formData.email.trim(),
        password: formData.password.trim()
      });
      
      navigate('/dashboard');
      
    } catch (err: any) {
      console.log("Login error occurred", err);
      const errorMessage = err.message || 'Invalid email or password. Please try again.';
      setFieldErrors({
        email: errorMessage, 
        password: errorMessage
      });
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass = "form-input";
    return fieldErrors[fieldName as keyof typeof fieldErrors] 
      ? `${baseClass} form-input-error` 
      : baseClass;
  };

  return (
    <div className="login-form-wrapper relative">
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="login-header">
        {/* <img src={logo} alt="Company Logo" className="login-logo" /> */}
        <h1 className="login-title">Login</h1>
      </div>
      
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            E-mail
          </label>
          {fieldErrors.email && (
            <div className="field-error-message">
              {fieldErrors.email}
            </div>
          )}
          <input
            type="email" 
            id="email"
            name="email" 
            className={getInputClassName('email')}
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your e-mail"
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          {fieldErrors.password && (
            <div className="field-error-message">
              {fieldErrors.password}
            </div>
          )}
          <input
            type="password"
            id="password"
            name="password"
            className={getInputClassName('password')}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
