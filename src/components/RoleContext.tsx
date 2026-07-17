"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Role = 'pic_gedung' | 'admin_dept' | 'user';

interface UserProfile {
  id?: string;
  email: string;
  role: Role;
  name: string;
  approved: boolean;
}

interface RoleContextType {
  user: UserProfile | null;
  role: Role;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  login: (email: string, selectedRole: Role, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, selectedRole: Role) => Promise<{ success: boolean; error?: string }>;
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

  const login = async (email: string, selectedRole: Role, password?: string): Promise<{ success: boolean; error?: string }> => {
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co") || !process.env.NEXT_PUBLIC_SUPABASE_URL;
        
        if (!isMockUrl) {
           const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
              email,
              password: password || "12345678"
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

              if (profile) {
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
           }
        }
     } catch (e: any) {
        console.error("Supabase Auth connection error:", e);
        
        // JIKA FETCH ERROR (Gagal Terhubung / Offline), AKTIFKAN FALLBACK SIMULASI LOKAL AGAR WEB TIDAK CRASH
        const errString = e.toString() || "";
        if (errString.includes("Failed to fetch") || errString.includes("TypeError")) {
           // Jika email demo admin, otomatis approved, lainnya butuh acc
           const isApproved = email.includes("admin") || email.includes("pic") || email.includes("syukur");
           
           if (!isApproved && selectedRole === 'user') {
              return {
                 success: false,
                 error: "Mode Simulasi: Akun staf biasa ini belum disetujui (ACC) oleh PIC Gedung. Silakan login menggunakan email admin/pic untuk melakukan ACC."
              };
           }

           const mockUser: UserProfile = {
              id: 'mock-id-' + Math.random().toString(36).substring(7),
              email: email,
              role: selectedRole,
              name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
              approved: true
           };
           localStorage.setItem("arsip_session", JSON.stringify(mockUser));
           setUser(mockUser);
           setRoleState(mockUser.role);
           setActiveMenu(mockUser.role === 'user' ? "Daftar Arsip" : "Dashboard");
           return { 
              success: true, 
              error: "Mode Simulasi: Gagal menghubungi server Supabase (Failed to fetch). Sistem otomatis beralih menggunakan simulasi offline." 
           };
        }
        return { success: false, error: e.message || "Gagal menghubungi server database Supabase." };
     }

     // FALLBACK SIMULASI MURNI JIKA URL MOCK
     const isApproved = email.includes("admin") || email.includes("pic") || email.includes("syukur");
     if (!isApproved && selectedRole === 'user') {
        return {
           success: false,
           error: "Mode Simulasi: Akun staf biasa ini belum disetujui (ACC) oleh PIC Gedung. Silakan login menggunakan email admin/pic untuk melakukan ACC."
        };
     }

     const mockUser: UserProfile = {
        id: 'mock-id-' + Math.random().toString(36).substring(7),
        email: email,
        role: selectedRole,
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        approved: true
     };

     localStorage.setItem("arsip_session", JSON.stringify(mockUser));
     setUser(mockUser);
     setRoleState(mockUser.role);
     
     if (mockUser.role === 'user') {
        setActiveMenu("Daftar Arsip");
     } else {
        setActiveMenu("Dashboard");
     }
     return { success: true };
  };

  const signUp = async (email: string, password: string, name: string, selectedRole: Role): Promise<{ success: boolean; error?: string }> => {
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co") || !process.env.NEXT_PUBLIC_SUPABASE_URL;
        
        if (isMockUrl) {
           return { 
              success: false, 
              error: "Supabase belum terkonfigurasi. Mohon isi variabel env terlebih dahulu." 
           };
        }

        // SignUp ke Supabase Auth dengan metadata nama, role, dan default approved = false
        // PIC Gedung diset otomatis approved = true agar bisa menyetujui user lain
        const isPic = selectedRole === 'pic_gedung';
        
        const { data, error } = await supabase.auth.signUp({
           email,
           password,
           options: {
              data: {
                 name,
                 role: selectedRole,
                 approved: isPic ? true : false
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
    <RoleContext.Provider value={{ user, role, activeMenu, setActiveMenu, login, signUp, logout, setRole }}>
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
