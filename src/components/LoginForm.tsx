import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Patrol_Masters_Logo.png";
import { useAuth } from "../contexts/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: { email?: string; password?: string } = {};
    if (!formData.email.trim()) errors.email = "Email is required";
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim()))
        errors.email = "Please enter a valid email";
    }
    if (!formData.password.trim()) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password.trim(),
      });
      navigate("/dashboard");
    } catch (err: any) {
      const msg =
        err.message || "Invalid email or password. Please try again.";
      setFieldErrors({ email: msg, password: msg });
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Preloader */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Glassmorphism Card */}
      <div className="bg-white/20 backdrop-blur-xl shadow-xl rounded-2xl border border-white/30 p-8">
        <div className="text-center mb-6">
          <img
            src={logo}
            alt="Company Logo"
            className="w-24 mx-auto mb-3 drop-shadow-lg"
          />
          <h1 className="text-2xl font-bold text-white drop-shadow">
            Patrol Masters Automotive ERP
          </h1>
          <p className="text-white/80 mt-1">Login</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div>
            {fieldErrors.email && (
              <p className="text-red-300 text-sm mb-1">{fieldErrors.email}</p>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              disabled={isLoading}
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl bg-white/40 placeholder-gray-700 outline-none focus:ring-2 focus:ring-blue-600 ${fieldErrors.email ? "ring-2 ring-red-500" : ""
                }`}
            />
          </div>

          {/* PASSWORD WITH SHOW/HIDE */}
          <div className="relative">
            {fieldErrors.password && (
              <p className="text-red-300 text-sm mb-1">{fieldErrors.password}</p>
            )}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                disabled={isLoading}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 pr-12 py-3 rounded-xl bg-white/40 placeholder-gray-700 outline-none focus:ring-2 focus:ring-blue-600 ${fieldErrors.password ? "ring-2 ring-red-500" : ""
                  }`}
              />

              {/* Eye Icon Inside Input */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:bg-blue-400"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
