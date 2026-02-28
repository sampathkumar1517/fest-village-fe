import { Link, useLocation } from "react-router-dom";
import "./BottomNav.css";

const BottomNav = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/festival" || path === "/") {
      return location.pathname === "/festival" || location.pathname === "/";
    }
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav">
      <Link 
        to="/festival" 
        className={`bottom-nav-item ${isActive("/festival") || isActive("/") ? "active" : ""}`}
      >
        <span className="bottom-nav-icon">⭐</span>
        <span className="bottom-nav-label">Festivals</span>
      </Link>
      <Link 
        to="/collection" 
        className={`bottom-nav-item ${isActive("/collection") ? "active" : ""}`}
      >
        <span className="bottom-nav-icon">₹</span>
        <span className="bottom-nav-label">Collect</span>
      </Link>
      <Link 
        to="/expenses" 
        className={`bottom-nav-item ${isActive("/expenses") ? "active" : ""}`}
      >
        <span className="bottom-nav-icon">🛍️</span>
        <span className="bottom-nav-label">Expenses</span>
      </Link>
      <Link 
        to="/analytics" 
        className={`bottom-nav-item ${isActive("/analytics") ? "active" : ""}`}
      >
        <span className="bottom-nav-icon">📊</span>
        <span className="bottom-nav-label">Analytics</span>
      </Link>
      <Link 
        to="/review" 
        className={`bottom-nav-item ${isActive("/review") ? "active" : ""}`}
      >
        <span className="bottom-nav-icon">📋</span>
        <span className="bottom-nav-label">Review</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
