import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import Quotations from "../pages/Quotation";
import Finance from "../pages/Finance";
import Invoice from "../pages/Invoice";
import UserManagement from "../pages/UserManagement";
import ProtectedRoute from "./ProtectedRoute";
import InvoiceView from "../pages/InvoiceView";
import QuotationView from "../pages/QuotationView";
import RoleRoute from "./RoleRoute";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Public routes */}
      <Route path="/invoice/view/:id" element={<InvoiceView />} />
      <Route path="/quotation/view/:id" element={<QuotationView />} />
      
      {/* ADMIN ONLY */}
      <Route path="/" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <Dashboard />
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <Dashboard />
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* ADMIN + INVENTORY MANAGER */}
      <Route path="/inventory" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin', 'inventory_manager']}>
            <Inventory />
          </RoleRoute>
        </ProtectedRoute>
      } />

      {/* ADMIN ONLY */}
      <Route path="/quotations" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <Quotations />
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/finance" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <Finance />
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/invoice" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <Invoice />
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="/user-management" element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <UserManagement />
          </RoleRoute>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;