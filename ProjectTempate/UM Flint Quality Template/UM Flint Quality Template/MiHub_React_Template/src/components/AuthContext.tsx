// ProjectTempate/.../src/components/AuthContext.tsx (CORRECTED GOLDEN COPY)

import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
// Assuming 'jwt-decode' is installed
import { jwtDecode } from "jwt-decode"; 

// Helper function to extract user data from the JWT
// NOTE: This assumes the JWT payload contains 'id' (number), 'name' (string), and 'role' (string)
const decodeToken = (t: string | null) => {
    if (!t) return { id: null, role: null, name: null };
    try {
        // We use 'any' here for simplicity, but a proper interface should be defined for the decoded JWT
        const decoded: any = jwtDecode(t);
        return { 
            id: decoded.id || null, 
            role: decoded.role || null, // e.g., 'Admin', 'Editor', 'Viewer'
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
  userRole: string | null; // "Admin", "Editor", "Viewer"
  token: string | null;
  // --- FIX: loginAs now correctly accepts a number (userId) ---
  loginAs: (userId: number) => Promise<void>; 
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  
  // Initialize state by checking localStorage
  const initialToken = localStorage.getItem("token");
  const [token, setToken] = useState<string | null>(initialToken);
  
  // Initialize user details from the stored token on load
  const [user, setUser] = useState(decodeToken(initialToken));

  // --- UPDATED LOGIN FUNCTION: Accepts userId ---
  const loginAs = async (targetUserId: number) => {
    try {
        // Call the new dev login route with the specific userId
        const res = await fetch('http://localhost:3000/api/dev/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: targetUserId }) 
        });
        const data = await res.json();
        
        if (data.token) {
            const decodedUser = decodeToken(data.token);
            setToken(data.token);
            setUser(decodedUser); // Set the new user details from the token
            localStorage.setItem("token", data.token);
            
            // Reload to ensure all components and route guards pick up the new token
            window.location.reload(); 
        }
    } catch (err) {
        console.error("Failed to login:", err);
    }
  };

  // --- Computed values updated to use state derived from token ---
  const userId = user.id; 
  // Generate a simple username (e.g., "owen_sartele")
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