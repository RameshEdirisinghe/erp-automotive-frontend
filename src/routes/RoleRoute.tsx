import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../types/roles";

interface Props {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function RoleRoute({ allowedRoles, children }: Props) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    // inventory_manager should always land on inventory
    return <Navigate to="/inventory" replace />;
  }

  return children;
}
