import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { JSX } from "react/jsx-dev-runtime";

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
