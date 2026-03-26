import { NavLink } from "react-router-dom";
import { Star, IndianRupee, FileText, LineChart, MessageSquare } from "lucide-react";
import "./NavTabs.css";

export default function NavTabs() {
    const tabs = [
        { name: "Festivals", path: "/", icon: Star },
        { name: "Collections", path: "/collection", icon: IndianRupee },
        { name: "Expenses", path: "/expenses", icon: FileText },
        { name: "Analytics", path: "/analytics", icon: LineChart },
        { name: "Review", path: "/review", icon: MessageSquare },
    ];

    return (
        <nav className="nav-tabs-container">
            {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                    <NavLink
                        key={tab.name}
                        to={tab.path}
                        className={({ isActive }) =>
                            `nav-tab-link ${isActive ? "active" : ""}`
                        }
                    >
                        <IconComponent className="nav-tab-icon" />
                        {tab.name}
                    </NavLink>
                );
            })}
        </nav>
    );
}
