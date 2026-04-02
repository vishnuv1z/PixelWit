import React, { createContext, useState } from "react";
import API from "../api/api";

export const AuthContext = createContext();

const STORAGE_KEY = "pixelwit_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const persist = (u) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else    localStorage.removeItem(STORAGE_KEY);
    setUser(u);
  };

  const signup = async (form) => {
    const res = await API.post("/users/signup", form);
    // Backend returns { message, user } — store only the user object
    persist(res.data.user);
    return res.data.user;
  };

  const login = async (form) => {
    const res = await API.post("/users/login", form);
    // Backend returns { message, user } — store only the user object
    persist(res.data.user);
    return res.data.user;
  };

  const updateUser = (updatedUser) => {
    persist(updatedUser);
  };

  const logout = () => {
    persist(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
