import sys

with open("src/components/SettingsView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update component signature
sig_search = "export default function SettingsView() {"
sig_replace = """export default function SettingsView({ activeTabId }: { activeTabId?: string }) {"""
content = content.replace(sig_search, sig_replace)

# 2. Add useEffect to sync activeTab
hook_search = """   const [activeTab, setActiveTab] = useState<"master" | "landing" | "retensi" | "digital_mapping">("master");"""
hook_replace = """   const [activeTab, setActiveTab] = useState<"master" | "landing" | "retensi" | "digital_mapping">("master");

   useEffect(() => {
      if (activeTabId === "Pengaturan - Data Master") setActiveTab("master");
      else if (activeTabId === "Pengaturan - Jadwal Retensi") setActiveTab("retensi");
      else if (activeTabId === "Pengaturan - Tampilan Website") setActiveTab("landing");
      else if (activeTabId === "Pengaturan - Digital Mapping") setActiveTab("digital_mapping");
   }, [activeTabId]);"""
content = content.replace(hook_search, hook_replace)

# 3. Remove Tabs Selector UI
tabs_search = """         {/* Tabs Selector */}
         <div className="flex gap-6 border-b border-hairline mb-6 overflow-x-auto hide-scrollbar">
            <button 
               onClick={() => setActiveTab("master")}
               className={`py-2 text-[14px] font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "master" ? "border-primary text-primary" : "border-transparent text-ink-mute hover:text-ink"
               }`}
            >
               <Grid size={16} /> Data Master
            </button>
            <button 
               onClick={() => setActiveTab("retensi")}
               className={`py-2 text-[14px] font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "retensi" ? "border-primary text-primary" : "border-transparent text-ink-mute hover:text-ink"
               }`}
            >
               <Clock size={16} /> Jadwal Retensi (JRA)
            </button>
            <button 
               onClick={() => setActiveTab("landing")}
               className={`py-2 text-[14px] font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "landing" ? "border-primary text-primary" : "border-transparent text-ink-mute hover:text-ink"
               }`}
            >
               <LayoutTemplate size={16} /> Tampilan Website
            </button>
            <button 
               onClick={() => setActiveTab("digital_mapping")}
               className={`py-2 text-[14px] font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "digital_mapping" ? "border-primary text-primary" : "border-transparent text-ink-mute hover:text-ink"
               }`}
            >
               <MapPin size={16} /> Digital Mapping
            </button>
         </div>"""
content = content.replace(tabs_search, "")

with open("src/components/SettingsView.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("SettingsView updated")
