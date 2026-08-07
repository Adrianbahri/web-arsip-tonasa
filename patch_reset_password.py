import re

file_path = "src/app/dashboard/page.tsx"

with open(file_path, "r") as f:
    content = f.read()

# 1. Add states for admin reset
state_code = """
  const [showAdminResetModal, setShowAdminResetModal] = useState(false);
  const [adminResetUser, setAdminResetUser] = useState<{name: string, email: string} | null>(null);
  const [adminResetPassword, setAdminResetPassword] = useState("");
  const [adminResetConfirm, setAdminResetConfirm] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [adminResetError, setAdminResetError] = useState("");
"""
content = re.sub(
    r"  // Users List State for Manajemen User \(PIC Gedung ONLY\)\n  const \[usersList, setUsersList\] = useState<any\[\]>\(\[\]\);",
    "  // Users List State for Manajemen User (PIC Gedung ONLY)\n  const [usersList, setUsersList] = useState<any[]>([]);\n" + state_code,
    content
)


# 2. Modify handleResetUserPassword
old_reset_func = """  // Reset User Password via Email
  const handleResetUserPassword = async (name: string, email: string) => {
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           await supabase.auth.resetPasswordForEmail(email);
        }
     } catch (err) {
        console.error(err);
     }
     setSuccessMessage(`Email berisi tautan reset sandi telah dikirimkan ke ${email}. Silakan infokan ke pengguna untuk mengecek kotak masuk/spam mereka.`);
     setTimeout(() => setSuccessMessage(""), 5000);
  };"""

new_reset_func = """  // Reset User Password via Admin Modal
  const handleResetUserPassword = (name: string, email: string) => {
     setAdminResetUser({ name, email });
     setAdminResetPassword("");
     setAdminResetConfirm("");
     setAdminResetError("");
     setShowAdminResetModal(true);
  };

  const submitAdminResetPassword = async (e: React.FormEvent) => {
     e.preventDefault();
     if (adminResetPassword !== adminResetConfirm) {
        setAdminResetError("Konfirmasi kata sandi tidak cocok.");
        return;
     }
     if (adminResetPassword.length < 6) {
        setAdminResetError("Kata sandi minimal 6 karakter.");
        return;
     }
     
     setIsResetting(true);
     setAdminResetError("");
     
     try {
         const { error } = await supabase.rpc('admin_reset_password', {
            user_email: adminResetUser?.email,
            new_password: adminResetPassword
         });
         
         if (error) {
            console.error(error);
            setAdminResetError(error.message || "Gagal mengubah kata sandi.");
         } else {
            setSuccessMessage(`Kata sandi untuk ${adminResetUser?.name} berhasil diubah!`);
            setShowAdminResetModal(false);
            setTimeout(() => setSuccessMessage(""), 4000);
         }
     } catch (err: any) {
         setAdminResetError(err.message || "Gagal mengubah kata sandi.");
     } finally {
         setIsResetting(false);
     }
  };"""

content = content.replace(old_reset_func, new_reset_func)

# 3. Add the modal JSX near the other modals (e.g., Delete Confirmation Modal)
modal_jsx = """
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

# Find a good place to insert the modal, for example, just before the end of the Manajemen User block.
# We can look for the closing div of the "Manajemen User" return block.
# There is `{/* DELETE CONFIRMATION MODAL */}`. We can put it right before it.
content = content.replace("{/* DELETE CONFIRMATION MODAL */}", modal_jsx + "\n         {/* DELETE CONFIRMATION MODAL */}")


with open(file_path, "w") as f:
    f.write(content)

print("Patched successfully")
