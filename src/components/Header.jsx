import { Link } from "react-router-dom";
import { LogIn, LogOut, Shield, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { isOrganizer, isAdmin, isLoggedIn, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#e8d4ba]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between py-3 border-b border-[#e8d4ba]/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[#d35400] to-[#e67e22] text-white text-lg shadow-sm">
              🪔
            </div>
            <div>
              <h1 className="text-base font-bold font-serif text-gray-900 leading-tight">
                Village Festival Manager
              </h1>
              <p className="text-xs text-[#666] leading-none font-sans">
                Collection & Expense Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isOrganizer && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#fff3e0] text-[#d35400] border border-[#d35400]/25">
                <Crown className="w-3 h-3" />
                Organizer
              </span>
            )}
            {isAdmin && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Shield className="w-3 h-3" />
                Festival Admin
              </span>
            )}
            {isLoggedIn ? (
              <>
                <span className="hidden md:block text-xs text-[#666] max-w-[140px] truncate">
                  {user?.name || user?.firstName || user?.phoneNumber}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/organizer/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#d35400] text-white hover:bg-[#b84400]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Organizer Login
                </Link>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[#d35400]/40 text-[#d35400] hover:bg-[#fff3e0]"
                >
                  Admin Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
