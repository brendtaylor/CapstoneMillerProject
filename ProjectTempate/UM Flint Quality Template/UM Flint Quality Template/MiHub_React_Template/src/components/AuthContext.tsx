import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";

interface AuthContextType {
  userId: number | null;
  username: string | null;
  displayName: string | null;
  userRole: string | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const userId = 1001; // Assuming user 'NROACH' for now
  const username = "username";
  const displayName = "displayName";
  const userRole = "admin";


  return (
    <AuthContext.Provider value={{ userId, username, displayName, userRole}}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
