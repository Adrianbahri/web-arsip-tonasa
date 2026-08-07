"use client";
import { useState } from "react";
import { useRole } from "@/components/RoleContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ShieldAlert } from "lucide-react";

export default function Login() {
  const { login } = useRole();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
     setError("");
     setInfoMessage("");

     try {
        const res = await login(email, 'user', password);
        if (res.success) {
           if (res.error) {
              setInfoMessage(res.error);
              setTimeout(() => {
                 router.push("/dashboard");
              }, 4000);
           } else {
              router.push("/dashboard");
           }
        } else {
           setError(res.error || "Email atau password salah.");
        }
     } catch (err: any) {
        setError("Terjadi kesalahan sistem: " + (err.message || ""));
     } finally {
        setIsLoading(false);
     }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4 font-sans selection:bg-primary-soft selection:text-white">
      <div className="w-full max-w-[420px] bg-canvas md:border md:border-hairline rounded-xs py-8 px-4 md:p-8 space-y-6">
         
         {/* Logo / Header */}
         <div className="text-center space-y-2">
            <img src="/logo-tonasa.png" alt="Logo Semen Tonasa" className="w-12 h-12 object-contain mx-auto mb-2" />
            <h1 className="text-display-lg text-ink text-[28px] leading-tight tracking-tight mt-2">
               Web Arsip<br/>
               <span className="text-primary font-bold">PT Semen Tonasa</span>
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

         {infoMessage && (
            <div className="bg-amber-50 border border-amber-200 text-amber-950 text-[12px] rounded-xs p-3 leading-relaxed">
               {infoMessage}
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
               {/* Lupa Kata Sandi Redirect to WhatsApp */}
               <a 
                  href="https://wa.me/628123456789?text=Halo%20Admin%20Web%20Arsip%20PT%20Semen%20Tonasa,%20saya%20ingin%20mengajukan%20permohonan%20reset%20password%20untuk%20akun%20saya." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[11px] text-primary hover:underline block text-right mt-1 font-semibold"
               >
                  Lupa kata sandi? Hubungi Admin
               </a>
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

         {/* Link to Register */}
         <div className="text-center pt-2">
            <p className="text-[12px] text-ink-mute">
               Belum memiliki akun?{" "}
               <Link href="/register" className="text-primary hover:underline font-semibold">
                  Daftar Sekarang
               </Link>
            </p>
         </div>

         {/* Footer metadata */}
         <div className="text-center text-[11px] text-ink-mute-2 pt-2">
            Hak Cipta © {new Date().getFullYear()} PT Semen Tonasa.
         </div>

      </div>
    </div>
  );
}
