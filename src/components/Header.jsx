export default function Header() {
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
          <div className="text-right hidden sm:block">
            <div className="text-xs text-[#666] font-serif">Manage your</div>
            <div className="text-xs font-medium text-[#d35400] font-serif">
              Festival Finances
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
