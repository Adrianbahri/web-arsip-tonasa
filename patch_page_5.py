import sys
import re

with open("src/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state for delete countdown
state_search = "  const [isDeletingUser, setIsDeletingUser] = useState(false);"
state_replace = "  const [isDeletingUser, setIsDeletingUser] = useState(false);\n  const [deleteCountdown, setDeleteCountdown] = useState(0);\n\n  useEffect(() => {\n    if (deleteCountdown > 0) {\n      const timer = setTimeout(() => setDeleteCountdown(deleteCountdown - 1), 1000);\n      return () => clearTimeout(timer);\n    }\n  }, [deleteCountdown]);"
content = content.replace(state_search, state_replace)

# 2. Set countdown to 5 when setting user to delete in the desktop table
desktop_search = """                                               setUserToDelete(item);
                                               setDeleteConfirmationText("");
                                               setDeleteUserModalOpen(true);"""
desktop_replace = """                                               setUserToDelete(item);
                                               setDeleteConfirmationText("");
                                               setDeleteCountdown(5);
                                               setDeleteUserModalOpen(true);"""
content = content.replace(desktop_search, desktop_replace)

# 3. Set countdown to 5 when setting user to delete in the mobile view
mobile_search = """                                       setUserToDelete(item);
                                       setDeleteConfirmationText("");
                                       setDeleteUserModalOpen(true);"""
mobile_replace = """                                       setUserToDelete(item);
                                       setDeleteConfirmationText("");
                                       setDeleteCountdown(5);
                                       setDeleteUserModalOpen(true);"""
content = content.replace(mobile_search, mobile_replace)

# 4. Modify submitDeleteUser
submit_search = """  const submitDeleteUser = async () => {
     if (!userToDelete || deleteConfirmationText !== "hapus") return;"""
submit_replace = """  const submitDeleteUser = async () => {
     if (!userToDelete || deleteConfirmationText !== "HAPUS") return;"""
content = content.replace(submit_search, submit_replace)

# 5. Modify the delete confirmation text in the UI
ui_search = """                   <p className="text-xs text-center text-rose-600 font-medium mb-2">
                      Ketik "<b>hapus</b>" pada kolom di bawah untuk mengonfirmasi.
                   </p>
                   <input 
                      type="text"
                      value={deleteConfirmationText}
                      onChange={(e) => setDeleteConfirmationText(e.target.value)}
                      placeholder="hapus"
                      className="w-full border border-hairline rounded-xl px-3 py-2.5 text-center font-mono text-sm text-ink focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-canvas-soft"
                      autoFocus
                   />
                </div>
                
                <div className="flex gap-3 w-full">
                   <button
                      onClick={() => {
                         setDeleteUserModalOpen(false);
                         setUserToDelete(null);
                         setDeleteConfirmationText("");
                      }}
                      disabled={isDeletingUser}
                      className="flex-1 px-4 py-2.5 bg-canvas-soft text-ink font-medium rounded-xl hover:bg-hairline transition-colors disabled:opacity-50"
                   >
                      Batal
                   </button>
                   <button
                      onClick={submitDeleteUser}
                      disabled={deleteConfirmationText !== "hapus" || isDeletingUser}
                      className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                   >
                      {isDeletingUser ? <RefreshCw size={16} className="animate-spin" /> : null}
                      Hapus
                   </button>"""

ui_replace = """                   <p className="text-xs text-center text-rose-600 font-medium mb-2">
                      Ketik "<b>HAPUS</b>" pada kolom di bawah untuk mengonfirmasi.
                   </p>
                   <input 
                      type="text"
                      value={deleteConfirmationText}
                      onChange={(e) => setDeleteConfirmationText(e.target.value)}
                      placeholder="HAPUS"
                      className="w-full border border-hairline rounded-xl px-3 py-2.5 text-center font-mono text-sm text-ink focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-canvas-soft"
                      autoFocus
                   />
                </div>
                
                <div className="flex gap-3 w-full">
                   <button
                      onClick={() => {
                         setDeleteUserModalOpen(false);
                         setUserToDelete(null);
                         setDeleteConfirmationText("");
                      }}
                      disabled={isDeletingUser}
                      className="flex-1 px-4 py-2.5 bg-canvas-soft text-ink font-medium rounded-xl hover:bg-hairline transition-colors disabled:opacity-50"
                   >
                      Batal
                   </button>
                   <button
                      onClick={submitDeleteUser}
                      disabled={deleteConfirmationText !== "HAPUS" || isDeletingUser || deleteCountdown > 0}
                      className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                   >
                      {isDeletingUser ? <RefreshCw size={16} className="animate-spin" /> : null}
                      {deleteCountdown > 0 ? `Hapus (${deleteCountdown})` : 'Hapus'}
                   </button>"""
content = content.replace(ui_search, ui_replace)

with open("src/app/dashboard/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("page.tsx updated with HAPUS and countdown")
