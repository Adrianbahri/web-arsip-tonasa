"use client";
import { useState } from "react";
import { useRole } from "@/components/RoleContext";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldAlert } from "lucide-react";

export default function Login() {
  const { login } = useRole();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<'pic_gedung' | 'admin_dept' | 'user'>('pic_gedung');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
     setError("");

     try {
        const success = await login(email, selectedRole);
        if (success) {
           router.push("/dashboard");
        } else {
           setError("Email atau password salah.");
        }
     } catch (err) {
        setError("Terjadi kesalahan sistem.");
     } finally {
        setIsLoading(false);
     }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4 font-sans selection:bg-primary-soft selection:text-white">
      <div className="w-full max-w-[420px] bg-canvas md:border md:border-hairline rounded-xs py-8 px-4 md:p-8 space-y-6">
         
         {/* Logo / Header with circular logo image */}
         <div className="text-center space-y-2">
            <img src="/logo-tonasa.png" alt="Logo Semen Tonasa" className="w-12 h-12 object-contain mx-auto mb-2" />
            <h1 className="text-display-lg text-ink text-[28px] tracking-tight">
               Arsip<span className="text-primary font-bold ml-1">Tonasa</span>
            </h1>
            <p className="text-ink-mute text-[14px]">
               Sistem Informasi Manajemen Arsip
            </p>
         </div>

         {error && (
            <div className="bg-red-50 border border-red-200 text-primary text-[13px] rounded-xs p-3">
               {error}
            </div>
         )}

         {/* Form */}
         <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
               <label className="block text-[13px] font-medium text-ink">Email Perusahaan</label>
               <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input 
                     type="email" 
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="contoh@sementonasa.co.id"
                     className="w-full bg-canvas border border-hairline text-[14px] rounded-xs pl-9 pr-3 py-2.5 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                  />
               </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
               <label className="block text-[13px] font-medium text-ink">Kata Sandi</label>
               <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input 
                     type="password" 
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••"
                     className="w-full bg-canvas border border-hairline text-[14px] rounded-xs pl-9 pr-3 py-2.5 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                  />
               </div>
            </div>

            {/* Role Simulation Dropdown */}
            <div className="space-y-1.5 bg-canvas-soft border border-hairline p-3 rounded-xs">
               <div className="flex items-center gap-1.5 text-ink-mute mb-2">
                  <ShieldAlert size={14} />
                  <label className="text-[12px] font-medium">Masuk Sebagai (Simulasi Role)</label>
               </div>
               <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-2.5 py-1.5 outline-none font-medium text-ink focus:border-ink"
               >
                  <option value="pic_gedung">PIC Gedung Arsip</option>
                  <option value="admin_dept">Admin Departemen (HRD)</option>
                  <option value="user">User Biasa (Staff)</option>
               </select>
            </div>

            {/* Submit Button */}
            <button 
               type="submit" 
               disabled={isLoading}
               className="w-full bg-primary hover:bg-primary-deep text-on-primary py-2.5 rounded-xs text-[14px] font-semibold transition-colors mt-4 disabled:opacity-50"
            >
               {isLoading ? "Menghubungkan..." : "Masuk"}
            </button>
         </form>

         {/* Footer metadata */}
         <div className="text-center text-[11px] text-ink-mute-2 pt-2">
            Hak Cipta © {new Date().getFullYear()} PT Semen Tonasa.
         </div>

      </div>
    </div>
  );
}
