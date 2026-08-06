import sys

with open("src/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

search = """  if (activeMenu === "Pengaturan" && role === 'superadmin') {
     return <SettingsView />;
  }"""
replace = """  if (activeMenu.startsWith("Pengaturan") && role === 'superadmin') {
     return <SettingsView activeTabId={activeMenu} />;
  }"""

content = content.replace(search, replace)

with open("src/app/dashboard/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("page.tsx updated")
