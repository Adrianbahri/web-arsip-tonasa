"use client";
import React, { useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useRole } from "./RoleContext";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  LogOut, 
  ShieldAlert,
  ClipboardCheck,
  Key,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  Settings,
  ChevronDown
} from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { role, setRole, user, logout, activeMenu, setActiveMenu } = useRole();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPengaturanExpanded, setIsPengaturanExpanded] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState<string | null>(null);

  const pathname = usePathname();

  // Exclude login page, register page, landing page (/), and public pages (/lokasi, /cari) from sidebar & dashboard layout wrapper
  if (
     pathname === "/login" || 
     pathname === "/" || 
     pathname === "/register" ||
     pathname.startsWith("/lokasi") ||
     pathname.startsWith("/cari")
  ) {
     return <div className="min-h-screen bg-canvas">{children}</div>;
  }

  // Simplified Menu items with new Layanan Arsip (peminjaman & kunjungan) accessible to all roles
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, roles: ["superadmin", "pic_gedung", "admin_dept", "user"] },
    { name: "Persetujuan (ACC)", icon: ClipboardCheck, roles: ["superadmin", "pic_gedung"] },
    { name: "Daftar Arsip", icon: FolderOpen, roles: ["superadmin", "pic_gedung", "admin_dept", "user", "guest"] },
    { name: "Layanan Arsip", icon: Calendar, roles: ["superadmin", "pic_gedung", "admin_dept", "user"] },
    { name: "Manajemen User", icon: Users, roles: ["superadmin"] },
    { 
      name: "Pengaturan", 
      icon: Settings, 
      roles: ["superadmin"],
      subMenus: [
         { name: "Data Master", id: "Pengaturan - Data Master" },
         { name: "Jadwal Retensi (JRA)", id: "Pengaturan - Jadwal Retensi" },
         { name: "Tampilan Website", id: "Pengaturan - Tampilan Website" },
         { name: "Digital Mapping", id: "Pengaturan - Digital Mapping" }
      ]
    },
    { name: "Riwayat Log", icon: History, roles: ["superadmin"] },
  ];

  const allowedMenuItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col md:flex-row font-sans selection:bg-primary-soft selection:text-white">
      
      {/* DESKTOP SIDEBAR - HIDDEN ON MOBILE */}
      <aside className={`hidden md:flex flex-col ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-canvas border-r border-hairline fixed inset-y-0 z-20 transition-all duration-300`}>
         {/* Force tailwind to compile these margin classes: md:ml-20 md:ml-64 */}
        <div className={`px-4 py-6 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : ''} gap-2.5 relative`}>
           <div className={`flex items-center gap-2.5 ${isSidebarCollapsed ? 'justify-center' : ''} w-full`}>
              <img src="/logo-tonasa.png" alt="Logo Semen Tonasa" className="w-8 h-8 object-contain" />
              {!isSidebarCollapsed && (
                 <h1 className="text-[20px] font-bold tracking-tight text-ink">Arsip<span className="text-primary ml-1">Tonasa</span></h1>
              )}
           </div>
           
           <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute -right-3.5 top-8 p-1 text-ink-mute bg-canvas border border-hairline hover:text-ink hover:bg-canvas-soft rounded-full transition-colors z-30"
           >
              {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
           </button>
        </div>
        
        <nav className="flex-1 px-3 py-2 space-y-1 z-10">
          {!isSidebarCollapsed && <p className="px-3 text-[11px] font-medium text-ink-mute-2 uppercase tracking-wider mb-4 mt-2">Menu Utama</p>}
          {allowedMenuItems.map(item => {
             const Icon = item.icon;
             const isActive = item.subMenus ? activeMenu.startsWith(item.name) : activeMenu === item.name;
             
             return (
                 <div key={item.name} className="w-full relative group">
                   <button
                      onClick={() => {
                         if (item.subMenus) {
                            if (!isSidebarCollapsed) {
                               setIsPengaturanExpanded(!isPengaturanExpanded);
                            }
                            if (!activeMenu.startsWith(item.name)) {
                               setActiveMenu(item.subMenus[0].id);
                            }
                         } else {
                            setActiveMenu(item.name);
                         }
                      }}
                      className={`w-full flex items-center justify-between ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-sm transition-all text-[14px] text-left ${
                         isActive 
                         ? 'bg-primary text-on-primary font-medium' 
                         : 'text-ink-mute hover:bg-canvas-soft hover:text-ink'
                      }`}
                      title={isSidebarCollapsed ? item.name : undefined}
                   >
                      <div className="flex items-center gap-3">
                         <Icon size={18} />
                         {!isSidebarCollapsed && <span>{item.name}</span>}
                      </div>
                      {!isSidebarCollapsed && item.subMenus && (
                         <ChevronDown size={14} className={`transition-transform duration-200 ${isPengaturanExpanded ? 'rotate-180' : ''}`} />
                      )}
                   </button>
                   
                   {/* DESKTOP EXPANDED SUBMENU */}
                   {!isSidebarCollapsed && item.subMenus && (
                      <div 
                         className={`overflow-hidden transition-all duration-300 ease-in-out ${isPengaturanExpanded ? 'max-h-60 mt-1 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                         <div className="pl-9 pr-2 space-y-1 py-1">
                            {item.subMenus.map(sub => (
                               <button
                                  key={sub.id}
                                  onClick={() => setActiveMenu(sub.id)}
                                  className={`w-full text-left py-2 px-3 rounded-sm text-[12.5px] transition-colors ${
                                     activeMenu === sub.id 
                                     ? 'text-primary font-medium bg-primary-soft/10' 
                                     : 'text-ink-mute hover:text-ink hover:bg-canvas-soft'
                                  }`}
                               >
                                  {sub.name}
                               </button>
                            ))}
                         </div>
                      </div>
                   )}

                   {/* DESKTOP MINIMAL HOVER SUBMENU */}
                   {isSidebarCollapsed && item.subMenus && (
                      <div className="absolute left-full top-0 ml-2 hidden group-hover:block bg-canvas border border-hairline shadow-lg rounded-md py-2 w-48 z-50">
                         {item.subMenus.map(sub => (
                            <button
                               key={sub.id}
                               onClick={() => setActiveMenu(sub.id)}
                               className={`w-full text-left py-2 px-4 text-[13px] transition-colors ${
                                  activeMenu === sub.id 
                                  ? 'text-primary font-medium bg-primary-soft/10' 
                                  : 'text-ink-mute hover:text-ink hover:bg-canvas-soft'
                               }`}
                            >
                               {sub.name}
                            </button>
                         ))}
                      </div>
                   )}
                </div>
             );
          })}
        </nav>
        


        {/* Profile / User Info (Bawah Sidebar) */}
        <div className={`p-4 border-t border-hairline flex items-center ${isSidebarCollapsed ? 'flex-col justify-center' : ''} gap-3`}>
           <div className="w-10 h-10 rounded-full border border-hairline overflow-hidden flex-shrink-0">
              <img 
                 src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Syukur"}`} 
                 alt="Avatar" 
                 className="w-full h-full object-cover"
              />
           </div>
           {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                 <p className="text-[14px] font-semibold text-ink truncate leading-tight">{user?.name || "Syukur"}</p>
                 <p className="text-[12px] text-ink-mute leading-tight capitalize">
                    {role === 'superadmin' ? 'Superadmin' : role === 'pic_gedung' ? 'Admin PIC Gedung' : role === 'admin_dept' ? 'Admin Departemen' : 'User Biasa'}
                 </p>
              </div>
           )}
           {/* Profile Actions: ThemeSwitcher, Ganti Password (Key) & Keluar (LogOut) */}
           <div className={`flex items-center gap-1 flex-shrink-0 ${isSidebarCollapsed ? 'flex-col mt-2' : ''}`}>
              <ThemeSwitcher />
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
      <main className={`flex-1 flex flex-col pb-16 md:pb-0 h-screen overflow-hidden transition-all duration-300 w-full ${isSidebarCollapsed ? 'md:ml-[80px]' : 'md:ml-[256px]'}`}>
        
        {/* MOBILE HEADER */}
        <header className="md:hidden bg-canvas border-b border-hairline px-5 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
             <img src="/logo-tonasa.png" alt="Logo Semen Tonasa" className="w-7 h-7 object-contain" />
             <h1 className="text-lg font-bold text-ink tracking-tight">Arsip<span className="text-primary ml-1">Tonasa</span></h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
             <ThemeSwitcher />
             {/* Quick Role Toggle on Mobile Header Removed */}
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

        <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden flex flex-col">
          {children}
        </div>
      </main>

      {/* MOBILE SUBMENU POPUP (SHOWN ABOVE BOTTOM NAV) */}
      {mobileSubMenuOpen && (
         <div className="md:hidden fixed bottom-16 inset-x-0 z-20 bg-canvas border-t border-hairline p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex gap-2 overflow-x-auto hide-scrollbar">
            {allowedMenuItems.find(m => m.name === mobileSubMenuOpen)?.subMenus?.map(sub => (
               <button
                  key={sub.id}
                  onClick={() => {
                     setActiveMenu(sub.id);
                     setMobileSubMenuOpen(null);
                  }}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-[13px] transition-colors ${
                     activeMenu === sub.id 
                     ? 'bg-primary text-on-primary font-medium' 
                     : 'bg-canvas-soft text-ink hover:bg-canvas-mute'
                  }`}
               >
                  {sub.name}
               </button>
            ))}
         </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-canvas border-t border-hairline flex items-center h-16 px-2 z-30 overflow-x-auto hide-scrollbar gap-2">
         {allowedMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = item.subMenus ? activeMenu.startsWith(item.name) : activeMenu === item.name;
            return (
               <button 
                  key={item.name}
                  onClick={() => {
                     if (item.subMenus) {
                        if (mobileSubMenuOpen === item.name) {
                           setMobileSubMenuOpen(null);
                        } else {
                           setMobileSubMenuOpen(item.name);
                           if (!activeMenu.startsWith(item.name)) {
                              setActiveMenu(item.subMenus[0].id);
                           }
                        }
                     } else {
                        setActiveMenu(item.name);
                        setMobileSubMenuOpen(null);
                     }
                  }}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[72px] gap-1 p-2 transition-colors ${isActive ? 'text-primary' : 'text-ink-mute hover:text-ink'}`}
               >
                  <Icon size={20} />
                  <span className="text-[9px] font-medium mt-0.5 whitespace-nowrap">{item.name}</span>
               </button>
            );
         })}
      </nav>

    </div>
  );
}
