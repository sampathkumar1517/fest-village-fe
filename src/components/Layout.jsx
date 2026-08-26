import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Header from "./Header";
import NavTabs from "./NavTabs";
import BottomNav from "./BottomNav";
import { ConfirmProvider } from "./ConfirmDialog";

const toasterProps = {
  position: "top-right",
  richColors: true,
  closeButton: true,
  duration: 4000,
  toastOptions: {
    className: "font-sans text-sm",
  },
};

export default function Layout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  if (isAuthPage) {
    return (
      <ConfirmProvider>
        <Toaster {...toasterProps} />
        <Outlet />
      </ConfirmProvider>
    );
  }

  return (
    <ConfirmProvider>
      <div className="min-h-screen flex flex-col relative pb-[70px] sm:pb-0">
        <Toaster {...toasterProps} />
        <Header />
        <NavTabs />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-24 sm:pb-6">
          <Outlet />
        </main>

        <footer className="hidden sm:block py-5 text-center text-[13px] text-[#999] border-t border-[#e8d4ba] mt-auto">
          <p>
            © 2026. Built with <span className="text-[#ff6b6b] mx-[2px]">❤</span>{" "}
            using caffeine.ai
          </p>
        </footer>

        <BottomNav />
      </div>
    </ConfirmProvider>
  );
}
