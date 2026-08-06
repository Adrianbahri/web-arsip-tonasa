import sys

with open("src/components/MainLayout.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state for isPengaturanExpanded
state_search = "  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);"
state_replace = "  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);\n  const [isPengaturanExpanded, setIsPengaturanExpanded] = useState(false);\n"
content = content.replace(state_search, state_replace)

# 2. Add ChevronDown icon
icon_search = "  History,\n  Settings\n} from \"lucide-react\";"
icon_replace = "  History,\n  Settings,\n  ChevronDown\n} from \"lucide-react\";"
content = content.replace(icon_search, icon_replace)

# 3. Update menuItems
menu_search = """    { name: "Manajemen User", icon: Users, roles: ["superadmin"] },
    { name: "Pengaturan", icon: Settings, roles: ["superadmin"] },
    { name: "Riwayat Log", icon: History, roles: ["superadmin"] },"""
menu_replace = """    { name: "Manajemen User", icon: Users, roles: ["superadmin"] },
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
    { name: "Riwayat Log", icon: History, roles: ["superadmin"] },"""
content = content.replace(menu_search, menu_replace)

# 4. Update desktop sidebar rendering
sidebar_search = """          {allowedMenuItems.map(item => {
             const Icon = item.icon;
             const isActive = activeMenu === item.name;
             return (
                <button
                   key={item.name}
                   onClick={() => setActiveMenu(item.name)}
                   className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-sm transition-all text-[14px] text-left ${
                      isActive 
                      ? 'bg-primary text-on-primary font-medium' 
                      : 'text-ink-mute hover:bg-canvas-soft hover:text-ink'
                   }`}
                   title={isSidebarCollapsed ? item.name : undefined}
                >
                   <Icon size={18} />
                   {!isSidebarCollapsed && item.name}
                </button>
             );
          })}"""

sidebar_replace = """          {allowedMenuItems.map(item => {
             const Icon = item.icon;
             const isActive = item.subMenus ? activeMenu.startsWith(item.name) : activeMenu === item.name;
             
             return (
                <div key={item.name} className="w-full">
                   <button
                      onClick={() => {
                         if (item.subMenus) {
                            if (isSidebarCollapsed) setIsSidebarCollapsed(false);
                            setIsPengaturanExpanded(!isPengaturanExpanded);
                            if (!isPengaturanExpanded && !activeMenu.startsWith(item.name)) {
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
                </div>
             );
          })}"""
content = content.replace(sidebar_search, sidebar_replace)

# 5. Mobile rendering
mobile_search = """         {allowedMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;
            return (
               <button 
                  key={item.name}
                  onClick={() => setActiveMenu(item.name)}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[72px] gap-1 p-2 ${isActive ? 'text-primary' : 'text-ink-mute hover:text-ink'}`}
               >
                  <Icon size={20} />
                  <span className="text-[9px] font-medium mt-0.5 whitespace-nowrap">{item.name}</span>
               </button>
            );
         })}"""

mobile_replace = """         {allowedMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = item.subMenus ? activeMenu.startsWith(item.name) : activeMenu === item.name;
            return (
               <button 
                  key={item.name}
                  onClick={() => {
                     if (item.subMenus) {
                        if (!activeMenu.startsWith(item.name)) {
                           setActiveMenu(item.subMenus[0].id);
                        } else {
                           // cycle through submenus on mobile
                           const currentIndex = item.subMenus.findIndex(s => s.id === activeMenu);
                           const nextIndex = (currentIndex + 1) % item.subMenus.length;
                           setActiveMenu(item.subMenus[nextIndex].id);
                        }
                     } else {
                        setActiveMenu(item.name);
                     }
                  }}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[72px] gap-1 p-2 ${isActive ? 'text-primary' : 'text-ink-mute hover:text-ink'}`}
               >
                  <Icon size={20} />
                  <span className="text-[9px] font-medium mt-0.5 whitespace-nowrap">{item.name}</span>
               </button>
            );
         })}"""
content = content.replace(mobile_search, mobile_replace)

with open("src/components/MainLayout.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("MainLayout.tsx updated")
