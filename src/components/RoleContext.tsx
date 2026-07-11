"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Role = 'pic_gedung' | 'admin_dept' | 'user';

interface UserProfile {
  email: string;
  role: Role;
  name: string;
}

interface RoleContextType {
  user: UserProfile | null;
  role: Role;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  login: (email: string, role: Role) => Promise<boolean>;
  logout: () => void;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRoleState] = useState<Role>('pic_gedung');
  const [activeMenu, setActiveMenu] = useState<string>("Daftar Arsip");
  const router = useRouter();

  // Load session from localStorage on client mount
  useEffect(() => {
    const savedUser = localStorage.getItem("arsip_session");
    if (savedUser) {
       const parsedUser = JSON.parse(savedUser) as UserProfile;
       setUser(parsedUser);
       setRoleState(parsedUser.role);
    }
  }, []);

  const login = async (email: string, selectedRole: Role): Promise<boolean> => {
     const mockUser: UserProfile = {
        email: email,
        role: selectedRole,
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)
     };

     localStorage.setItem("arsip_session", JSON.stringify(mockUser));
     setUser(mockUser);
     setRoleState(mockUser.role);
     
     // Set default active menu based on role
     if (mockUser.role === 'user') {
        setActiveMenu("Daftar Arsip");
     } else {
        setActiveMenu("Dashboard");
     }
     return true;
  };

  const logout = () => {
     localStorage.removeItem("arsip_session");
     setUser(null);
     router.push("/login");
  };

  const setRole = (newRole: Role) => {
     setRoleState(newRole);
     if (user) {
        const updatedUser = { ...user, role: newRole };
        localStorage.setItem("arsip_session", JSON.stringify(updatedUser));
        setUser(updatedUser);
     }
     // Redirect menu if role changes to user
     if (newRole === 'user') {
        setActiveMenu("Daftar Arsip");
     } else {
        setActiveMenu("Dashboard");
     }
  };

  return (
    <RoleContext.Provider value={{ user, role, activeMenu, setActiveMenu, login, logout, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
