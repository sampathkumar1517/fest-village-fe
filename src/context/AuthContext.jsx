import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getManageableFestivals } from "../utils/api";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [festivalIds, setFestivalIds] = useState(
    () => readStoredUser()?.festivalIds || []
  );

  const refresh = useCallback(async () => {
    const nextUser = readStoredUser();
    const nextToken = localStorage.getItem("access_token");
    setUser(nextUser);
    setToken(nextToken);

    if (!nextToken || !nextUser) {
      setFestivalIds([]);
      return;
    }

    if (
      nextUser.role !== "organizer" &&
      nextUser.type !== "organizer" &&
      nextUser.role !== "admin"
    ) {
      setFestivalIds([]);
      return;
    }

    try {
      const res = await getManageableFestivals();
      const ids = Array.isArray(res?.festivalIds)
        ? res.festivalIds
        : Array.isArray(res?.data)
          ? res.data.map((f) => f.id)
          : nextUser.festivalIds || [];
      setFestivalIds(ids);
      const updated = { ...nextUser, festivalIds: ids };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
    } catch {
      setFestivalIds(nextUser.festivalIds || []);
    }
  }, []);

  useEffect(() => {
    if (
      token &&
      user &&
      (user.role === "organizer" ||
        user.type === "organizer" ||
        user.role === "admin")
    ) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setFestivalIds([]);
  }, []);

  const isOrganizer =
    user?.type === "organizer" && Boolean(token);
  const isAdmin =
    user?.type !== "organizer" &&
    user?.role === "admin" &&
    Boolean(token);
  const isStaff = isOrganizer || isAdmin;

  const canManageFestival = useCallback(
    (festivalId) => {
      if (!isStaff || festivalId == null || festivalId === "") return false;
      return festivalIds.map(String).includes(String(festivalId));
    },
    [isStaff, festivalIds]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      festivalIds,
      isOrganizer,
      isAdmin,
      isStaff,
      isLoggedIn: Boolean(token && user),
      canManageFestival,
      refresh,
      logout,
    }),
    [
      user,
      token,
      festivalIds,
      isOrganizer,
      isAdmin,
      isStaff,
      canManageFestival,
      refresh,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
