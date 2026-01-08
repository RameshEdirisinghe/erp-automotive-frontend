import React, { useState, useRef, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface UserProfile {
  fullName: string;
  email: string;
  role: string;
}

const UserProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setUserProfile({
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#0f172a] border border-[#334155] p-2 rounded-full cursor-pointer hover:bg-[#1e293b] transition flex items-center justify-center"
        aria-label="User profile menu"
      >
        <User className="text-gray-200 w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && userProfile && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1e293b] border border-[#334155] rounded-lg shadow-xl z-[9999]">
          {/* User Info Section */}
          <div className="p-4 border-b border-[#334155]">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-3">
                <User className="text-white w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {userProfile.fullName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {userProfile.email}
                </p>
              </div>
            </div>
          </div>

          {/* Role Section */}
          <div className="px-4 py-3 border-b border-[#334155]">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              Role
            </p>
            <div className="inline-block bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
              {userProfile.role}
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#0f172a] rounded transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
