"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isPremium: boolean;
  weeklyQuota?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in by validating the cookie
    validateSession();
  }, [pathname, router]);

  const validateSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include', // Inclure les cookies
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Explicitement définir le mode CORS
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Session validée:', data);
        setUser(data.user);
        
        // Stocker les données utilisateur dans localStorage (sans le token)
        localStorage.setItem("user_data", JSON.stringify(data.user));
      } else {
        // Session invalide
        localStorage.removeItem("user_data");
        setUser(null);
        if (!pathname.includes("/login") && !pathname.includes("/signup")) {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error('Error validating session:', error);
      // En cas d'erreur réseau, vérifier s'il y a des données utilisateur stockées
      const storedUser = localStorage.getItem("user_data");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (parseError) {
          localStorage.removeItem("user_data");
          setUser(null);
        }
      } else {
        setUser(null);
        if (!pathname.includes("/login") && !pathname.includes("/signup")) {
          router.push("/login");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email, password });
      console.log('API_BASE_URL:', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include', // Inclure les cookies
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Explicitement définir le mode CORS
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const { user } = data;
        
        // Vérifier si l'utilisateur est admin
        if (user.role !== 'ADMIN') {
          return { 
            success: false, 
            message: 'Accès refusé - Seuls les administrateurs peuvent accéder au dashboard' 
          };
        }
        
        setUser(user);
        
        // Stocker les données utilisateur dans localStorage (sans le token)
        localStorage.setItem("user_data", JSON.stringify(user));
        
        router.push("/dashboard");
        
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Gestion spécifique des erreurs réseau
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        return { 
          success: false, 
          message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet ou que le serveur backend est démarré.' 
        };
      }
      
      return { success: false, message: 'Erreur de connexion' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Inclure les cookies
        mode: 'cors', // Explicitement définir le mode CORS
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Même en cas d'erreur réseau, on nettoie localement
    } finally {
      localStorage.removeItem("user_data");
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
