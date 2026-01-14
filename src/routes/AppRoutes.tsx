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
import AdminRoute from "./AdminRoute";
import InvoiceView from "../pages/InvoiceView";
import QuotationView from "../pages/QuotationView";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/inventory" element={
        <ProtectedRoute>
          <Inventory />
        </ProtectedRoute>
      } />

      <Route path="/quotations" element={
        <ProtectedRoute>
          <AdminRoute>
            <Quotations />
          </AdminRoute>
        </ProtectedRoute>
      } />

      <Route path="/finance" element={
        <ProtectedRoute>
          <AdminRoute>
            <Finance />
          </AdminRoute>
        </ProtectedRoute>
      } />

      <Route path="/invoice" element={
        <ProtectedRoute>
          <AdminRoute>
            <Invoice />
          </AdminRoute>
        </ProtectedRoute>
      } />

      <Route path="/user-management" element={
        <ProtectedRoute>
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        </ProtectedRoute>
      } />

      <Route path="/invoice/view/:id" element={<InvoiceView />} />
      <Route path="/quotation/view/:id" element={<QuotationView />} /> 

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;