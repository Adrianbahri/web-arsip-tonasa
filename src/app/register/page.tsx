"use client";
import { useState } from "react";
import { useRole } from "@/components/RoleContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, Check } from "lucide-react";

export default function Register() {
  const { signUp } = useRole();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
     setError("");
     setSuccess(false);

     try {
        const res = await signUp(email, password, name);
        if (res.success) {
           setSuccess(true);
           setName("");
           setEmail("");
           setPassword("");
           // Redirect to login page after 3 seconds
           setTimeout(() => {
              router.push("/login");
           }, 3000);
        } else {
           setError(res.error || "Gagal melakukan registrasi.");
        }
     } catch (err: any) {
        setError("Terjadi kesalahan sistem: " + (err.message || ""));
     } finally {
        setIsLoading(false);
     }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4 font-sans selection:bg-primary-soft selection:text-white">
      {/* Flat card on mobile, bordered on PC */}
      <div className="w-full max-w-[420px] bg-canvas md:border md:border-hairline rounded-xs py-8 px-4 md:p-8 space-y-6">
         
         {/* Logo / Header */}
         <div className="text-center space-y-2">
            <img src="/logo-tonasa.png" alt="Logo Semen Tonasa" className="w-12 h-12 object-contain mx-auto mb-2" />
            <h1 className="text-display-lg text-ink text-[28px] leading-tight tracking-tight mt-2">
               Web Arsip<br/>
               <span className="text-primary font-bold">PT Semen Tonasa</span>
            </h1>
            <p className="text-ink-mute text-[14px]">
               Daftar Akun Baru Kearsipan
            </p>
         </div>

         {error && (
            <div className="bg-red-50 border border-red-200 text-primary text-[13px] rounded-xs p-3">
               {error}
            </div>
         )}

         {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-xs p-3 flex items-center gap-3">
               <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={12} strokeWidth={3} />
               </div>
               <div>
                  <p className="font-semibold">Registrasi Berhasil!</p>
                  <p className="text-[11px] text-emerald-700 leading-normal">Akun Anda telah terdaftar dan sedang menunggu persetujuan (ACC) dari Admin PIC Gedung Arsip sebelum dapat digunakan. Mengarahkan ke login...</p>
               </div>
            </div>
         )}

         {/* Form */}
         <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Nama Lengkap */}
            <div className="space-y-1.5">
               <label className="block text-[13px] font-medium text-ink">Nama Lengkap</label>
               <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input 
                     type="text" 
                     required
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="Nama Lengkap"
                     className="w-full bg-canvas border border-hairline text-[14px] rounded-xs pl-9 pr-3 py-2.5 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                  />
               </div>
            </div>

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
                     minLength={6}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="Minimal 6 karakter"
                     className="w-full bg-canvas border border-hairline text-[14px] rounded-xs pl-9 pr-3 py-2.5 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                  />
               </div>
</div>

             {/* Public registration is always a standard "user" account; pic_gedung is granted via ACC */}
             <div className="space-y-1 bg-canvas-soft border border-hairline p-3 rounded-xs">
               <p className="text-[12px] text-ink-mute">
                  Akun dibuat sebagai <b>User Biasa (Staff)</b> dan menunggu persetujuan (ACC) Admin PIC Gedung Arsip sebelum dapat digunakan.
               </p>
            </div>

            {/* Register Button */}
            <button 
               type="submit" 
               disabled={isLoading || success}
               className="w-full bg-primary hover:bg-primary-deep text-on-primary py-2.5 rounded-xs text-[14px] font-semibold transition-colors mt-4 disabled:opacity-50"
            >
               {isLoading ? "Mendaftarkan..." : "Daftar Akun"}
            </button>
         </form>

         {/* Link to Login */}
         <div className="text-center pt-2">
            <p className="text-[12px] text-ink-mute">
               Sudah memiliki akun?{" "}
               <Link href="/login" className="text-primary hover:underline font-semibold">
                  Masuk Disini
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
