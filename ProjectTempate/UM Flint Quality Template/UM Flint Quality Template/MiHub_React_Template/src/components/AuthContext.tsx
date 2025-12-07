import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";

interface AuthContextType {
  userId: number; 
  username: string | null;
  displayName: string | null;
  userRole: string | null; // "Admin", "Editor", "Viewer"
  token: string | null;
  loginAs: (role: string) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 1. STATE MUST BE INSIDE THE COMPONENT
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [userRole, setUserRole] = useState<string | null>(null);

  // 2. THE LOGIN FUNCTION
  const loginAs = async (role: string) => {
    try {
        // Ensure you are hitting the correct URL (check your port!)
        const res = await fetch('http://localhost:3000/api/dev/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: role, userId: 1003, name: "Dev User" })
        });
        const data = await res.json();
        
        if (data.token) {
            setToken(data.token);
            setUserRole(role);
            localStorage.setItem("token", data.token);
            // Reload to ensure all components pick up the new token
            window.location.reload(); 
        }
    } catch (err) {
        console.error("Failed to login:", err);
    }
  };

  const userId = 1003; 
  const username = "dev_user";
  const displayName = `Dev ${userRole || 'User'}`;

  return (
    <AuthContext.Provider value={{ userId, username, displayName, userRole, token, loginAs }}>
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