import React from 'react';
import Carousel from '../components/Carousel';
import LoginForm from '../components/LoginForm';
import '../styles/Login.css';

const Login: React.FC = () => {
  return (
    <div className="login-container">
      <Carousel />
      <div className="login-form-container">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;