import React from "react";
import LoginForm from "../components/LoginForm";
import bgImage from "../assets/Patrol_Masters_Image.jpg";

const Login: React.FC = () => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <LoginForm />
    </div>
  );
};

export default Login;
