import React from "react";

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
    </Routes>
  );
};



export default AppRoutes;
