"use client";
import React from "react";
import { useRole } from "./RoleContext";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  LogOut, 
  ShieldAlert,
  ClipboardCheck,
  Key
} from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { role, setRole, user, logout, activeMenu, setActiveMenu } = useRole();
  const pathname = usePathname();

  // Exclude login page, register page, and landing page (/) from sidebar & dashboard layout wrapper
  if (pathname === "/login" || pathname === "/" || pathname === "/register") {
     return <div className="min-h-screen bg-canvas">{children}</div>;
  }

  // Simplified Menu items - Ganti Password is removed from main menu list
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, roles: ["pic_gedung", "admin_dept"] },
    { name: "Persetujuan (ACC)", icon: ClipboardCheck, roles: ["pic_gedung"] },
    { name: "Daftar Arsip", icon: FolderOpen, roles: ["pic_gedung", "admin_dept", "user"] },
    { name: "Manajemen User", icon: Users, roles: ["pic_gedung"] },
  ];

  const allowedMenuItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col md:flex-row font-sans selection:bg-primary-soft selection:text-white">
      
      {/* DESKTOP SIDEBAR - HIDDEN ON MOBILE */}
      <aside className="hidden md:flex flex-col w-64 bg-canvas border-r border-hairline fixed inset-y-0 z-20">
        <div className="px-6 py-6 flex items-center gap-2.5">
           <img src="/logo-tonasa.png" alt="Logo Semen Tonasa" className="w-8 h-8 object-contain" />
           <h1 className="text-[20px] font-bold tracking-tight text-ink">Arsip<span className="text-primary ml-1">Tonasa</span></h1>
        </div>
        
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-medium text-ink-mute-2 uppercase tracking-wider mb-4 mt-2">Menu Utama</p>
          {allowedMenuItems.map(item => {
             const Icon = item.icon;
             const isActive = activeMenu === item.name;
             return (
                <button
                   key={item.name}
                   onClick={() => setActiveMenu(item.name)}
                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all text-[14px] text-left ${
                      isActive 
                      ? 'bg-primary text-on-primary font-medium' 
                      : 'text-ink-mute hover:bg-canvas-soft hover:text-ink'
                   }`}
                >
                   <Icon size={18} />
                   {item.name}
                </button>
             );
          })}
        </nav>
        
        {/* Role Simulator inside Sidebar (Desktop) */}
        <div className="p-3 mx-3 mb-2 border border-hairline bg-canvas-soft rounded-xs space-y-2">
           <div className="flex items-center gap-1.5 text-ink-mute">
              <ShieldAlert size={14} />
              <span className="text-[11px] font-medium">Role Simulator</span>
           </div>
           <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2 py-1 outline-none font-medium text-ink focus:border-ink"
           >
              <option value="pic_gedung">PIC Gedung</option>
              <option value="admin_dept">Admin Dept</option>
              <option value="user">User Biasa</option>
           </select>
        </div>

        {/* Profile / User Info (Bawah Sidebar) */}
        <div className="p-4 border-t border-hairline flex items-center gap-3">
           <div className="w-10 h-10 rounded-full border border-hairline overflow-hidden flex-shrink-0">
              <img 
                 src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || "Syukur"}`} 
                 alt="Avatar" 
                 className="w-full h-full object-cover"
              />
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-ink truncate leading-tight">{user?.name || "Syukur"}</p>
              <p className="text-[12px] text-ink-mute leading-tight capitalize">
                 {role === 'pic_gedung' ? 'Admin PIC Gedung' : role === 'admin_dept' ? 'Admin Departemen' : 'User Biasa'}
              </p>
           </div>
           {/* Profile Actions: Ganti Password (Key) & Keluar (LogOut) */}
           <div className="flex items-center gap-1 flex-shrink-0">
              <button 
                 onClick={() => setActiveMenu("Ganti Password")}
                 className={`p-1.5 transition-colors rounded-xs ${
                    activeMenu === "Ganti Password" 
                    ? 'text-primary bg-primary-soft/10 font-bold' 
                    : 'text-ink-mute hover:text-primary'
                 }`}
                 title="Ganti Password"
              >
                 <Key size={15} />
              </button>
              <button 
                 onClick={logout} 
                 className="text-ink-mute hover:text-primary transition-colors p-1.5 rounded-xs" 
                 title="Keluar"
              >
                 <LogOut size={15} />
              </button>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 flex flex-col pb-16 md:pb-0 min-h-screen">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden bg-canvas border-b border-hairline px-5 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
             <img src="/logo-tonasa.png" alt="Logo Semen Tonasa" className="w-7 h-7 object-contain" />
             <h1 className="text-lg font-bold text-ink tracking-tight">Arsip<span className="text-primary ml-1">Tonasa</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Quick Role Toggle on Mobile Header */}
             <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as any)}
                className="bg-canvas border border-hairline text-[11px] rounded-xs px-1.5 py-1 outline-none font-medium text-ink focus:border-ink"
             >
                <option value="pic_gedung">PIC Gedung</option>
                <option value="admin_dept">Admin Dept</option>
                <option value="user">User Biasa</option>
             </select>
             
             {/* Ganti Password on Mobile Header */}
             <button 
                onClick={() => setActiveMenu("Ganti Password")}
                className={`p-1.5 rounded-xs transition-colors ${
                   activeMenu === "Ganti Password" 
                   ? 'text-primary bg-primary-soft/10' 
                   : 'text-ink-mute'
                }`}
                title="Ganti Password"
             >
                <Key size={15} />
             </button>
             
             {/* Keluar on Mobile Header */}
             <button 
                onClick={logout}
                className="p-1.5 text-ink-mute hover:text-primary transition-colors rounded-xs"
                title="Keluar"
             >
                <LogOut size={15} />
             </button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-canvas border-t border-hairline flex justify-around items-center h-16 px-2 z-30">
         {allowedMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;
            return (
               <button 
                  key={item.name}
                  onClick={() => setActiveMenu(item.name)}
                  className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-ink-mute hover:text-ink'}`}
               >
                  <Icon size={20} />
                  <span className="text-[9px] font-medium mt-0.5">{item.name}</span>
               </button>
            );
         })}
      </nav>

    </div>
  );
}
