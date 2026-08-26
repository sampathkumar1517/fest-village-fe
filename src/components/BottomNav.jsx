import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const baseTabs = [
  { path: "/", match: ["/", "/festival"], label: "Festivals", icon: "⭐" },
  { path: "/collection", match: ["/collection"], label: "Collect", icon: "₹" },
  { path: "/expenses", match: ["/expenses"], label: "Expenses", icon: "🛍️" },
  { path: "/analytics", match: ["/analytics"], label: "Analytics", icon: "📊" },
  { path: "/review", match: ["/review"], label: "Review", icon: "💬" },
];

const usersTab = {
  path: "/users",
  match: ["/users"],
  label: "Users",
  icon: "👥",
};

export default function BottomNav() {
  const location = useLocation();
  const { isOrganizer } = useAuth();
  const tabs = isOrganizer ? [...baseTabs, usersTab] : baseTabs;

  const isActive = (match) => match.includes(location.pathname);

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-[#e8d4ba] flex items-center justify-around shadow-[0_-2px_8px_rgba(0,0,0,0.08)]"
      style={{
        paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
        height: "calc(70px + env(safe-area-inset-bottom))",
      }}
      aria-label="Mobile navigation"
    >
      {tabs.map((tab) => {
        const active = isActive(tab.match);
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-center no-underline transition-colors relative ${
              active ? "text-[#d35400]" : "text-[#999]"
            }`}
          >
            {active && (
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#d35400]" />
            )}
            <span className="text-[18px] mb-0.5">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
