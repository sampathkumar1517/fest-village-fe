import { NavLink } from "react-router-dom";
import {
  Star,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  MessageSquare,
  Users,
} from "lucide-react";

export default function NavTabs() {
  const tabs = [
    { name: "Festivals", path: "/", icon: Star },
    { name: "Collections", path: "/collection", icon: IndianRupee },
    { name: "Expenses", path: "/expenses", icon: ShoppingBag },
    { name: "Analytics", path: "/analytics", icon: TrendingUp },
    { name: "Review", path: "/review", icon: MessageSquare },
    { name: "Users", path: "/users", icon: Users },
  ];

  return (
    <div className="hidden sm:block border-b border-[#e8d4ba] bg-white/95">
      <div className="max-w-5xl mx-auto px-4">
        <nav className="flex gap-1 py-1.5 overflow-x-auto" aria-label="Main navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.name}
                to={tab.path}
                end={tab.path === "/"}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-[#d35400] text-white shadow-sm"
                      : "text-[#666] hover:bg-[#f5f5f5] hover:text-[#333]"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
