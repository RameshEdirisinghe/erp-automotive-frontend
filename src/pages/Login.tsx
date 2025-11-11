import React from "react";
import "../styles/Login.css";
import LoginForm from "../components/LoginForm";
import Carousel from "../components/Carousel";

import loginImage1 from "../assets/Login Image - 1.jpg";
import loginImage2 from "../assets/Login Image - 2.jpg";
import loginImage3 from "../assets/Login Image - 3.jpg";
import loginImage4 from "../assets/Login Image - 4.jpg";

const carouselImages = [loginImage1, loginImage2, loginImage3, loginImage4];

const Login = () => {
  const handleLoginSubmit = (data: { username: string; password: string; server: string }) => {
    console.log("Login data:", data);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form-section">
          <LoginForm onSubmit={handleLoginSubmit} />
        </div>

        <div className="login-carousel-section">
          <Carousel images={carouselImages} autoPlayInterval={5000} />
        </div>
      </div>
    </div>
  );
};

export default Login;