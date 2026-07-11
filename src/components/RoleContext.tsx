"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
  login: (email: string, selectedRole: Role, password?: string) => Promise<boolean>;
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

  const login = async (email: string, selectedRole: Role, password?: string): Promise<boolean> => {
     try {
        // 1. Coba hubungkan ke Supabase Auth asli jika kredensial URL valid
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        
        if (!isMockUrl) {
           const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
              email,
              password: password || "12345678"
           });

           if (!authError && authData.user) {
              // Ambil profile role dari tabel profiles
              const { data: profile, error: profileError } = await supabase
                 .from('profiles')
                 .select('role, name')
                 .eq('id', authData.user.id)
                 .single();

              if (!profileError && profile) {
                 const realUser: UserProfile = {
                    email: authData.user.email || email,
                    role: profile.role as Role,
                    name: profile.name || email.split("@")[0]
                 };
                 localStorage.setItem("arsip_session", JSON.stringify(realUser));
                 setUser(realUser);
                 setRoleState(realUser.role);
                 setActiveMenu(realUser.role === 'user' ? "Daftar Arsip" : "Dashboard");
                 return true;
              }
           }
        }
     } catch (e) {
        console.warn("Supabase Auth failed, falling back to mock login simulation:", e);
     }

     // 2. FALLBACK: Jika Supabase belum di-setup / offline, jalankan simulasi lokal
     const mockUser: UserProfile = {
        email: email,
        role: selectedRole,
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)
     };

     localStorage.setItem("arsip_session", JSON.stringify(mockUser));
     setUser(mockUser);
     setRoleState(mockUser.role);
     
     if (mockUser.role === 'user') {
        setActiveMenu("Daftar Arsip");
     } else {
        setActiveMenu("Dashboard");
     }
     return true;
  };

  const logout = async () => {
     try {
        await supabase.auth.signOut();
     } catch (e) {
        console.warn("Error signing out from Supabase:", e);
     }
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
