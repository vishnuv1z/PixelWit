import React, { createContext, useState } from "react";
import API from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const signup = async (form) => {
    const res = await API.post("/users/signup", form);
    return res.data;
  };

  const login = async (form) => {
    const res = await API.post("/users/login", form);
    setUser(res.data.user);
    localStorage.setItem("sc_user", JSON.stringify(res.data.user));
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("sc_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}