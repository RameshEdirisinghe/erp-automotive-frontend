import React, { useState } from 'react';
import '../styles/Login.css';
import logo from '../assets/logo.png';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Login attempt:', formData);
  };

  return (
    <div className="login-form-wrapper">
      <div className="login-header">
        <img src={logo} alt="Company Logo" className="login-logo" />
        <h1 className="login-title">Login</h1>
      </div>
      
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="username"
            name="username"
            className="form-input"
            value={formData.username}
            onChange={handleChange}
            placeholder="stevec"
            required
          />
          <label htmlFor="username" className="form-label">
            Username
          </label>
        </div>
        
        <div className="form-group">
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <label htmlFor="password" className="form-label">
            Password
          </label>
        </div>
        
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;