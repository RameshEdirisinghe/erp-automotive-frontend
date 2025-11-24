import React from 'react';
import LoginForm from '../components/LoginForm';
import '../styles/Login.css';

const Login: React.FC = () => {
  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-form-container">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;