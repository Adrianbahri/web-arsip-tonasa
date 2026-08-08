"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Role = 'superadmin' | 'pic_gedung' | 'admin_dept' | 'user' | 'guest';

interface UserProfile {
  id?: string;
  email: string;
  role: Role;
  name: string;
  approved: boolean;
  guestGedung?: string;
}

interface RoleContextType {
  user: UserProfile | null;
  role: Role;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: (gedung: string) => void;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRoleState] = useState<Role>('pic_gedung');
  const [activeMenu, setActiveMenu] = useState<string>("Daftar Arsip");
  const router = useRouter();

  // Load session from localStorage on client mount, but always re-validate
  // against real Supabase session + DB profile. localStorage role is forgeable.
  useEffect(() => {
    let savedUser: UserProfile | null = null;
    try {
      savedUser = JSON.parse(localStorage.getItem("arsip_session") || "null");
    } catch {
      localStorage.removeItem("arsip_session");
    }
    if (!savedUser) return;

    if (savedUser.role === 'guest') {
      setUser(savedUser);
      setRoleState('guest');
      return;
    }

    (async () => {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        localStorage.removeItem("arsip_session");
        setUser(null);
        return;
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, name, approved')
        .eq('id', authData.session.user.id)
        .single();
      if (error || !profile || !profile.approved) {
        localStorage.removeItem("arsip_session");
        setUser(null);
        return;
      }
      const realUser: UserProfile = {
        email: authData.session.user.email || savedUser.email,
        role: profile.role as Role,
        name: profile.name || authData.session.user.email?.split('@')[0] || savedUser.name,
        approved: profile.approved,
      };
      localStorage.setItem("arsip_session", JSON.stringify(realUser));
      setUser(realUser);
      setRoleState(realUser.role);
    })();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
     try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
           email,
           password
        });

        if (authError) {
           return { success: false, error: authError.message };
        }

        if (authData.user) {
           // Ambil profile role & approved status dari tabel profiles
           const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role, name, approved')
              .eq('id', authData.user.id)
              .single();

           if (profileError) {
              return { 
                 success: false, 
                 error: "Login berhasil di Auth, tetapi gagal memuat profil dari database. Pastikan skema tabel profiles dan approved sudah dijalankan di Supabase SQL Editor." 
              };
           }

           // BLOKIR LOGIN JIKA USER BELUM DI-ACC OLEH PIC
           if (!profile.approved) {
              await supabase.auth.signOut();
              return {
                 success: false,
                 error: "Akun Anda belum disetujui (ACC) oleh Admin PIC Gedung Arsip. Hubungi PIC untuk melakukan aktivasi akun."
              };
           }

           const realUser: UserProfile = {
              email: authData.user.email || email,
              role: profile.role as Role,
              name: profile.name || email.split("@")[0],
              approved: profile.approved
           };
           localStorage.setItem("arsip_session", JSON.stringify(realUser));
           setUser(realUser);
           setRoleState(realUser.role);
           setActiveMenu(realUser.role === 'user' ? "Daftar Arsip" : "Dashboard");
           return { success: true };
        }

        return { success: false, error: "Akun tidak ditemukan." };
     } catch (e: any) {
        console.error("Supabase Auth connection error:", e);
        return { success: false, error: e?.message || "Gagal menghubungi server database Supabase." };
     }
};

   const loginAsGuest = (gedung: string) => {
     const guestUser: UserProfile = {
        id: 'guest-' + Math.random().toString(36).substring(7),
        email: 'tamu@public',
        role: 'guest',
        name: 'Tamu Gedung ' + gedung,
        approved: true,
        guestGedung: gedung
     };
     
     localStorage.setItem("arsip_session", JSON.stringify(guestUser));
     setUser(guestUser);
     setRoleState('guest');
     setActiveMenu("Daftar Arsip");
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
     try {
        // Public registration only creates a standard user account.
        // Admin roles (pic_gedung/admin_dept) are granted by PIC, never via self-registration.
        const { data, error } = await supabase.auth.signUp({
           email,
           password,
           options: {
              data: {
                 name,
                 role: 'user',
                 approved: false
              }
           }
        });

        if (error) {
           return { success: false, error: error.message };
        }

        return { success: true };
     } catch (e: any) {
        console.error("Supabase Register connection error:", e);
        return { success: false, error: e.message || "Gagal menghubungi server database Supabase." };
     }
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
    <RoleContext.Provider value={{ user, role, activeMenu, setActiveMenu, login, loginAsGuest, signUp, logout, setRole }}>
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
