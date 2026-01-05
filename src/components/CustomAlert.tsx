import React, { useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

interface CustomAlertProps {
  message: string;
  type?: AlertType;
  onClose: () => void;
  duration?: number;
}

const typeStyles: Record<
  AlertType,
  { bg: string; iconBg: string; icon: React.ReactNode }
> = {
  success: { bg: "bg-green-600", iconBg: "bg-green-700", icon: <CheckCircle size={24} /> },
  error: { bg: "bg-red-600", iconBg: "bg-red-700", icon: <AlertCircle size={24} /> },
  warning: { bg: "bg-yellow-500", iconBg: "bg-yellow-600", icon: <AlertTriangle size={24} /> },
  info: { bg: "bg-blue-600", iconBg: "bg-blue-700", icon: <Info size={24} /> },
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  message,
  type = "info",
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg text-white animate-slide-in ${typeStyles[type].bg}`}
      style={{ minWidth: "250px" }}
    >
      <div className={`flex-shrink-0 ${typeStyles[type].iconBg} p-2 rounded-full`}>
        {typeStyles[type].icon}
      </div>
      <div className="flex-1 text-sm">{message}</div>
      <button onClick={onClose} className="text-white hover:opacity-80">
        <X size={18} />
      </button>
    </div>
  );
};

export default CustomAlert;
