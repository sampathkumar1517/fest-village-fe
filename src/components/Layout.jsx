import { Outlet } from "react-router-dom";
import Header from "./Header";
import NavTabs from "./NavTabs";
import BottomNav from "./BottomNav";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="layout-container">
      <div className="layout-content">
        {/* Main Content Area */}
        <div className="content-wrapper">
          <Header />
          <NavTabs />

          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Footer - Hidden on mobile */}
      <footer className="layout-footer">
        <p>© 2026. Built with <span className="heart">❤</span> using caffeine.ai</p>
      </footer>

      {/* Bottom Navigation - Shows on mobile only */}
      <BottomNav />
    </div>
  );
}