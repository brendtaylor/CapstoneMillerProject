import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { jwtDecode } from "jwt-decode"; 
import { API_BASE_URL } from "../api";

// Map Database Role IDs to UI String Roles
const ROLE_MAP: Record<number, string> = {
    1: 'Viewer',
    2: 'Editor',
    3: 'Admin'
};

const decodeToken = (t: string | null) => {
    if (!t) return { id: null, role: null, name: null };
    try {
        const decoded: any = jwtDecode(t);
        
        // Translate ID to String if it is a number
        let roleName = decoded.role;
        if (typeof decoded.role === 'number') {
            roleName = ROLE_MAP[decoded.role] || 'Viewer';
        }

        return { 
            id: decoded.id || null, 
            role: roleName, 
            name: decoded.name || null
        };
    } catch (e) {
        console.error("Error decoding token:", e);
        return { id: null, role: null, name: null };
    }
}

interface AuthContextType {
  userId: number | null; 
  username: string | null;
  displayName: string | null;
  userRole: string | null; 
  token: string | null;
  loginAs: (userId: number) => Promise<void>; 
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  
  const initialToken = localStorage.getItem("token");
  const [token, setToken] = useState<string | null>(initialToken);
  const [user, setUser] = useState(decodeToken(initialToken));

  const loginAs = async (targetUserId: number) => {
    try {
        const res = await fetch(`${API_BASE_URL}/dev/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: targetUserId }) 
        });
        const data = await res.json();
        
        if (data.token) {
            // Decode the new token immediately to get the correct role string
            const decodedUser = decodeToken(data.token);
            setToken(data.token);
            setUser(decodedUser); 
            localStorage.setItem("token", data.token);
            window.location.reload(); 
        }
    } catch (err) {
        console.error("Failed to login:", err);
    }
  };

  const userId = user.id; 
  const username = user.name ? user.name.toLowerCase().replace(/\s/g, '_') : null;
  const displayName = user.name;
  const userRole = user.role;

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