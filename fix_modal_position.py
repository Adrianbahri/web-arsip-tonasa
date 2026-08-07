import re

file_path = "src/app/dashboard/page.tsx"

with open(file_path, "r") as f:
    content = f.read()

modal_code = """
         {/* ADMIN RESET PASSWORD MODAL */}
         {showAdminResetModal && (
            <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-canvas w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-5 border-b border-hairline flex justify-between items-center bg-canvas-soft">
                     <h3 className="font-semibold text-ink text-[16px]">Ganti Kata Sandi</h3>
                     <button onClick={() => setShowAdminResetModal(false)} className="text-ink-mute hover:text-ink transition-colors">
                        <X size={18} />
                     </button>
                  </div>
                  <div className="p-5">
                     <p className="text-ink-mute text-sm mb-4">
                        Perbarui kata sandi keamanan akun untuk <span className="font-semibold text-ink">{adminResetUser?.name}</span> secara mandiri.
                     </p>
                     
                     {adminResetError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-md text-sm mb-4 flex items-start gap-2">
                           <AlertCircle size={16} className="mt-0.5 shrink-0" />
                           <p>{adminResetError}</p>
                        </div>
                     )}
                     
                     <form onSubmit={submitAdminResetPassword} className="space-y-4">
                        <div className="space-y-1.5">
                           <label className="block text-sm font-medium text-ink">Kata Sandi Baru</label>
                           <input 
                              type="password" 
                              required
                              value={adminResetPassword}
                              onChange={e => setAdminResetPassword(e.target.value)}
                              className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                              placeholder="Minimal 6 karakter"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="block text-sm font-medium text-ink">Konfirmasi Kata Sandi Baru</label>
                           <input 
                              type="password" 
                              required
                              value={adminResetConfirm}
                              onChange={e => setAdminResetConfirm(e.target.value)}
                              className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                              placeholder="Ketik ulang kata sandi baru"
                           />
                        </div>
                        <div className="pt-2">
                           <button 
                              type="submit" 
                              disabled={isResetting}
                              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-70 text-white font-medium py-2.5 rounded-md text-sm transition-colors"
                           >
                              {isResetting ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
                           </button>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
         )}
"""

if modal_code in content:
    content = content.replace(modal_code, "")
    
    new_modal_code = "  const renderAdminResetModal = () => {\n" + modal_code.replace("         {showAdminResetModal && (", "     if(!showAdminResetModal) return null;\n     return (").replace("         )}", "     );\n  };")
    
    content = content.replace("  const renderDeleteModal = () => {", new_modal_code + "\n\n  const renderDeleteModal = () => {")

    if "{showChangeRoleModal && (" in content:
        content = content.replace("{showChangeRoleModal && (", "{renderAdminResetModal()}\n\n           {showChangeRoleModal && (")
    
    with open(file_path, "w") as f:
        f.write(content)
    
    print("Fixed modal successfully")
else:
    print("Modal code not found exactly as specified.")
