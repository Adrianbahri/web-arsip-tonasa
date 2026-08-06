import sys
import re

with open("src/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. State changes
state_search = """  // Modal Detail States
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);"""

state_replace = """  // User Delete Modal State
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Modal Detail States
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);"""

content = content.replace(state_search, state_replace)

# 2. handleRejectUser
reject_search = """  // Reject / Delete user registration request (PIC Gedung ONLY)
  const handleRejectUser = async (userId: string) => {
     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase
              .from('profiles')
              .delete()
              .eq('id', userId);
           
           if (!error) {
              supabaseSuccess = true;
           }
        }
     } catch (err) {
        console.error(err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Pendaftaran pengguna ditolak & dihapus!");
        fetchUsers();
     } else {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        setSuccessMessage("Pendaftaran ditolak (Simulasi)!");
     }
     setTimeout(() => setSuccessMessage(""), 1500);
  };"""

reject_replace = """  // Reject / Delete user registration request (PIC Gedung ONLY)
  const handleRejectUser = async (userId: string) => {
     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase.rpc('delete_user_and_reassign', { user_to_delete: userId });
           
           if (!error) {
              supabaseSuccess = true;
           } else {
              console.error("RPC Error (reject user):", error);
           }
        }
     } catch (err) {
        console.error(err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Pendaftaran pengguna ditolak & dihapus!");
        fetchUsers();
     } else {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        setSuccessMessage("Pendaftaran ditolak (Simulasi)!");
     }
     setTimeout(() => setSuccessMessage(""), 1500);
  };

  // Delete active user completely and reassign their data to superadmin
  const submitDeleteUser = async () => {
     if (!userToDelete || deleteConfirmationText !== "hapus") return;
     
     setIsDeletingUser(true);
     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase.rpc('delete_user_and_reassign', { user_to_delete: userToDelete.id });
           
           if (!error) supabaseSuccess = true;
           else console.error("RPC Error (delete active user):", error);
        }
     } catch (err) {
        console.error(err);
     } finally {
        setIsDeletingUser(false);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Pengguna berhasil dihapus & datanya dialihkan ke Superadmin!");
        fetchUsers();
     } else {
        setUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
        setSuccessMessage("Pengguna dihapus (Simulasi)!");
     }
     setDeleteUserModalOpen(false);
     setUserToDelete(null);
     setDeleteConfirmationText("");
     setTimeout(() => setSuccessMessage(""), 2000);
  };"""

content = content.replace(reject_search, reject_replace)

# 3. Trash icon for desktop
trash_search_desktop = """                                         <button 
                                            onClick={(e) => {
                                               e.stopPropagation();
                                               if (confirm(`Apakah Anda yakin ingin MENCABUT AKSES (Blokir) pengguna ${item.name}?`)) {
                                                  handleBlockUser(item.id);
                                               }
                                            }}
                                            className="p-1 text-ink-mute hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-sm transition-colors"
                                            title="Cabut Akses Pengguna"
                                         >
                                            <Trash2 size={14} className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300" />
                                         </button>"""

trash_replace_desktop = """                                         <button 
                                            onClick={(e) => {
                                               e.stopPropagation();
                                               setUserToDelete(item);
                                               setDeleteConfirmationText("");
                                               setDeleteUserModalOpen(true);
                                            }}
                                            className="p-1 text-ink-mute hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-sm transition-colors"
                                            title="Hapus Permanen Pengguna"
                                         >
                                            <Trash2 size={14} className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300" />
                                         </button>"""

content = content.replace(trash_search_desktop, trash_replace_desktop)

# 4. Trash icon for mobile
trash_search_mobile = """                                 <button 
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       if (confirm(`Apakah Anda yakin ingin MENCABUT AKSES (Blokir) pengguna ${item.name}?`)) {
                                          handleBlockUser(item.id);
                                       }
                                    }}
                                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold py-2 rounded-sm text-[11px] flex items-center justify-center gap-1 transition-colors"
                                 >
                                    <Trash2 size={14} /> Cabut Akses
                                 </button>"""

trash_replace_mobile = """                                 <button 
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       setUserToDelete(item);
                                       setDeleteConfirmationText("");
                                       setDeleteUserModalOpen(true);
                                    }}
                                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold py-2 rounded-sm text-[11px] flex items-center justify-center gap-1 transition-colors"
                                 >
                                    <Trash2 size={14} /> Hapus
                                 </button>"""

content = content.replace(trash_search_mobile, trash_replace_mobile)

# 5. Adding the delete modal UI
modal_ui = """  {/* DELETE USER CONFIRMATION MODAL */}
  const renderDeleteUserModal = () => {
    if (!deleteUserModalOpen || !userToDelete) return null;
    return (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-all duration-300">
          <div 
             className="bg-canvas border border-hairline rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300"
             onClick={(e) => e.stopPropagation()}
          >
             <div className="p-6">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                   <AlertTriangle size={32} strokeWidth={2} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Hapus Pengguna?</h3>
                <p className="text-gray-500 mb-4 text-center text-sm">
                   Apakah Anda yakin ingin menghapus akun <b>{userToDelete.name}</b>? Segala data atau arsip yang terikat pada pengguna ini akan dialihkan ke Superadmin.
                </p>
                
                <div className="mb-6">
                   <p className="text-xs text-center text-rose-600 font-medium mb-2">
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
                   </button>
                </div>
             </div>
          </div>
       </div>
    );
  };
"""

content = content.replace("  {/* REJECT CONFIRMATION MODAL */}", modal_ui + "\n  {/* REJECT CONFIRMATION MODAL */}")

# 6. Render the modal inside the component
content = content.replace("               {renderRejectModal()}", "               {renderRejectModal()}\n               {renderDeleteUserModal()}")
content = content.replace("            {renderRejectModal()}", "            {renderRejectModal()}\n            {renderDeleteUserModal()}")
content = content.replace("           {renderRejectModal()}", "           {renderRejectModal()}\n           {renderDeleteUserModal()}")
content = content.replace("      {renderRejectModal()}", "      {renderRejectModal()}\n      {renderDeleteUserModal()}")


with open("src/app/dashboard/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("done")
