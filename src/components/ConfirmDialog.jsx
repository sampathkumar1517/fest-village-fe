import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ConfirmContext = createContext(null);

const defaultOptions = {
  title: "Are you sure?",
  message: "This action cannot be undone.",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  variant: "danger", // danger | primary
};

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback((result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState(null);
  }, []);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      // If a dialog is already open, resolve previous as false
      if (resolverRef.current) {
        resolverRef.current(false);
      }
      resolverRef.current = resolve;
      setState({ ...defaultOptions, ...options });
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const isDanger = state?.variant !== "primary";

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          onClick={() => close(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-[#faf6f0] border border-[#e8d4ba] shadow-xl animate-[slideUp_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#e8d4ba]/60">
              <h2
                id="confirm-dialog-title"
                className="text-lg font-bold font-serif text-gray-900"
              >
                {state.title}
              </h2>
              {state.message && (
                <p className="mt-2 text-sm text-gray-600 font-sans leading-relaxed">
                  {state.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4">
              <button
                type="button"
                onClick={() => close(false)}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors font-sans"
              >
                {state.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium shadow-sm transition-colors font-sans ${
                  isDanger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#d35400] hover:bg-[#e67e22]"
                }`}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return ctx.confirm;
}
