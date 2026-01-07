import {
  Menu,
  LogOut,
  Bell,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";
import { APP_CONFIG } from "@/constants/constants";

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const userRole = user?.role || 'User';
  const userName = user ? `${user.first_name} ${user.last_name}` : 'User';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth/login');
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format role display
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "checker":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "maker":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };


  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-sm supports-backdrop-filter:bg-white/80 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Side - Logo & Page Title */}
        <div className="flex items-center space-x-4">
          {/* Mobile Sidebar Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="md:hidden h-8 w-8 p-0 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>

          {/* App Logo & Title - visible only on large screens and above */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="h-8 w-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">ERD</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                {APP_CONFIG.name}
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                {APP_CONFIG.fullname}
              </p>
            </div>
          </div>
        </div>

        {/* Center - Navigation Bar (hidden on small screens, single line) */}
        <nav className="hidden md:flex items-center space-x-6 whitespace-nowrap">
          <a
            href=""
            className="text-gray-600 hover:text-gray-900 font-medium text-sm hover:underline hover:underline-offset-4 hover:decoration-2 hover:decoration-gray-600"
          >
            Dashboard
          </a>
          <a
            href=""
            className="text-gray-600 hover:text-gray-900 font-medium text-sm hover:underline hover:underline-offset-4 hover:decoration-2 hover:decoration-gray-600"
          >
            Level Reports
          </a>
          <a
            href=""
            className="text-gray-600 hover:text-gray-900 font-medium text-sm hover:underline hover:underline-offset-4 hover:decoration-2 hover:decoration-gray-600"
          >
            Users
          </a>
          <a
            href=""
            className="text-gray-600 hover:text-gray-900 font-medium text-sm hover:underline hover:underline-offset-4 hover:decoration-2 hover:decoration-gray-600"
          >
            Add Data
          </a>
         
        </nav>



        

        {/* Right Side - Actions & User */}
        <div className="flex items-center space-x-3">
          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4 text-gray-600" />
            </Button>

            {/* Theme Toggle */}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={cycleTheme}
              aria-label="Toggle theme"
              className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              {getThemeIcon()}
            </Button> */}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-gray-200"></div>

          {/* User Section */}
          <div className="flex items-center space-x-3">
            {/* User Info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {userName}
              </p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getRoleColor(
                  userRole
                )}`}
              >
                {formatRole(userRole)}
              </span>
            </div>

            {/* User Avatar */}
            <div className="relative">
              <div className="h-9 w-9 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm ring-2 ring-white">
                {getUserInitials(userName)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden px-6 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
          />
        </div>
      </div>
    </header>
  );
}
