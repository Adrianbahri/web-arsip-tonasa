"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Mail, MapPin, FileText, CheckCircle2, ChevronRight, Menu, X, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

// Helper to convert standard Google Drive links to direct image links
const getDirectImageUrl = (url: string) => {
  if (!url) return url;
  // Match standard share link format: https://drive.google.com/file/d/FILE_ID/view...
  const match = url.match(/drive\.google\.com\/file\/d\/([^\/?]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
};

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState<any>({
    hero_title: 'Selamat Datang di Website Arsip Semen Tonasa',
    hero_subtitle: 'Portal informasi, mekanisme pengarsipan dokumen fisik & digital PT Semen Tonasa secara terintegrasi dan aman.',
    hero_image_url: '/hero-image.jpg',
    sambutan_title: 'Sambutan',
    sambutan_text: 'PT Semen Tonasa berkomitmen untuk mengelola seluruh dokumen penting perusahaan secara profesional dan terstruktur. Website Arsip ini hadir sebagai sarana integrasi bagi seluruh departemen untuk mengarsipkan dokumen penting secara aman, efisien, dan sesuai dengan standar tata kelola arsip nasional. Dengan digitalisasi dokumen, penemuan kembali arsip menjadi lebih cepat, aman, dan dapat diakses dengan mudah oleh unit kerja yang berwenang.',
    sambutan_photo_url: '',
    sop_title: 'Prosedur Penyerahan & Pengelolaan Arsip Inaktif',
    sop_text: 'Tahapan standar tata kelola pemindahan berkas dari unit kerja departemen ke unit kearsipan gedung.',
    pic_title: 'PIC Gedung Arsip',
    pic_text: 'Pengelolaan fisik arsip, penentuan rak, lorong, dan verifikasi dokumen masuk dikelola langsung oleh PIC Gedung Arsip. Bagi unit kerja atau departemen yang membutuhkan koordinasi serah terima dokumen fisik atau akses darurat, silakan hubungi PIC melalui kontak resmi di bawah ini:',
    pic_photo_url: '',
    pic_whatsapp: '#',
    pic_email: 'mailto:arsip@sementonasa.co.id'
  });

  useEffect(() => {
     const fetchConfig = async () => {
        const { data, error } = await supabase.from('landing_page_config').select('*').eq('id', 'homepage').single();
        if (data) setConfig(data);
     };
     fetchConfig();
  }, []);

  return (
    <div className="bg-canvas min-h-screen flex flex-col font-sans selection:bg-primary-soft selection:text-white">
      
      <header className="bg-canvas border-b border-hairline py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
         <div className="flex items-center gap-2.5">
            <img src="/logo-tonasa.png" alt="Logo Semen Tonasa" className="w-7 h-7 object-contain" />
            <h1 className="text-[18px] md:text-[20px] font-bold text-ink tracking-tight">Arsip<span className="text-primary ml-1">Tonasa</span></h1>
         </div>
         
         {/* Desktop Nav */}
         <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="bg-primary text-on-primary text-[13px] font-semibold px-4 py-1.5 rounded-full">
               Beranda
            </Link>
            <a href="#prosedur" className="text-ink-mute hover:text-ink text-[13px] font-medium transition-colors">
               Prosedur
            </a>
            <ThemeSwitcher />
            <Link href="/login" className="flex items-center gap-2 bg-primary hover:bg-primary-deep text-white text-[13px] font-semibold transition-colors px-4 py-1.5 rounded-full shadow-sm">
               <User size={16} />
               <span>Login</span>
            </Link>
         </nav>

         {/* Mobile Header Actions */}
         <div className="flex items-center gap-3 md:hidden">
            <ThemeSwitcher />
            <Link href="/login" className="flex items-center justify-center bg-primary text-white p-2 rounded-full shadow-sm">
               <User size={18} />
            </Link>
            <button 
               className="text-ink p-1"
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
         </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
         <div className="md:hidden fixed top-[65px] left-0 right-0 bg-canvas border-b border-hairline z-40 px-6 py-4 flex flex-col gap-4 shadow-md">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-ink text-[14px] font-medium">
               Beranda
            </Link>
            <a href="#prosedur" onClick={() => setIsMobileMenuOpen(false)} className="text-ink text-[14px] font-medium">
               Prosedur
            </a>

            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-primary text-on-primary text-center text-[14px] font-semibold px-4 py-2 rounded-full mt-2 shadow-sm">
               <User size={16} />
               <span>Login</span>
            </Link>
         </div>
      )}

      {/* HERO SECTION */}
      <section 
         className="relative bg-cover bg-center w-full aspect-video max-h-[600px] flex items-center justify-center text-center px-4"
         style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('${getDirectImageUrl(config.hero_image_url || '/hero-image.jpg')}')` 
         }}
      >
         <div className="max-w-[800px] space-y-4">
            <h2 className="text-[28px] md:text-[42px] font-bold text-white leading-tight tracking-tight px-4">
               {config.hero_title}
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-[600px] mx-auto">
               {config.hero_subtitle}
            </p>
         </div>
      </section>

      {/* SAMBUTAN SECTION */}
      <section className="py-12 md:py-16 px-6 max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
         <div className="md:col-span-4 flex flex-col items-center space-y-3">
            <div className="w-[200px] md:w-full aspect-[4/5] bg-canvas-soft border border-hairline rounded-sm flex items-center justify-center text-ink-mute-2 relative overflow-hidden">
               {config.sambutan_photo_url ? (
                  <img src={getDirectImageUrl(config.sambutan_photo_url)} alt="Sambutan" className="w-full h-full object-cover" />
               ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-24 h-24 text-ink-faint">
                     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                     <circle cx="12" cy="7" r="4" />
                  </svg>
               )}
            </div>
            <p className="font-semibold text-ink text-[14px]">Kepala Unit Kearsipan</p>
         </div>
         <div className="md:col-span-8 space-y-4">
            <h3 className="text-display-md text-ink text-[22px] font-bold border-b border-hairline pb-2">{config.sambutan_title}</h3>
            <p className="text-ink-mute text-[14px] leading-relaxed text-justify whitespace-pre-wrap">
               {config.sambutan_text}
            </p>
         </div>
      </section>

      {/* PROSEDUR PENYERAHAN & PENGELOLAAN ARSIP (NEW SECTION) */}
      <section id="prosedur" className="py-12 md:py-16 bg-canvas-soft border-y border-hairline px-6">
         <div className="max-w-[1000px] mx-auto space-y-8">
            <div className="text-center max-w-[700px] mx-auto space-y-2">
               <span className="font-mono text-primary text-[12px] font-semibold tracking-wider uppercase">SOP RESMI perusahaan</span>
               <h3 className="text-[24px] md:text-[28px] font-bold text-ink tracking-tight">
                  {config.sop_title}
               </h3>
               <p className="text-ink-mute text-[14px]">
                  {config.sop_text}
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
               {config.sop_items && config.sop_items.length > 0 ? (
                  config.sop_items.map((item: any, idx: number) => (
                     <div key={idx} className="bg-canvas border border-hairline p-5 rounded-xs space-y-3 relative">
                        <div className="text-primary font-bold text-xl">{String(idx + 1).padStart(2, '0')}</div>
                        <h4 className="font-bold text-[15px] text-ink">{item.title}</h4>
                        <p className="text-ink-mute text-[12px] leading-relaxed">
                           {item.desc}
                        </p>
                     </div>
                  ))
               ) : (
                  <div className="col-span-4 text-center py-8 text-ink-mute text-[14px]">
                     Belum ada tahapan prosedur yang ditambahkan.
                  </div>
               )}
            </div>
         </div>
      </section>

      {/* PIC GEDUNG ARSIP SECTION */}
      <section className="bg-[#2d2d30] text-white py-12 md:py-16 px-6">
         <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-4 flex flex-col items-center space-y-3">
               <div className="w-[200px] md:w-full aspect-[4/5] bg-[#3e3e42] border border-[#4a4a4d] rounded-sm flex items-center justify-center text-gray-400 relative overflow-hidden">
                  {config.pic_photo_url ? (
                     <img src={getDirectImageUrl(config.pic_photo_url)} alt="PIC" className="w-full h-full object-cover" />
                  ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-24 h-24 text-gray-500">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                     </svg>
                  )}
               </div>
               <p className="font-semibold text-gray-300 text-[14px]">
                  {config.pic_title.split('-')[1]?.trim() || "PIC Gedung"}
               </p>
            </div>
            <div className="md:col-span-8 space-y-5">
               <h3 className="text-[22px] font-bold border-b border-[#4a4a4d] pb-2 text-white">{config.pic_title}</h3>
               <p className="text-gray-300 text-[14px] leading-relaxed whitespace-pre-wrap">
                  {config.pic_text}
               </p>
               <div className="space-y-3 pt-2">
                  {config.pic_whatsapp && (
                     <a 
                        href={config.pic_whatsapp} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 hover:bg-gray-100 py-3 rounded-xs font-semibold text-[14px] transition-colors border border-transparent shadow-sm"
                     >
                        <MessageSquare size={18} className="text-emerald-600 fill-emerald-600" />
                        Hubungi via Whatsapp
                     </a>
                  )}
                  {config.pic_email && (
                     <a 
                        href={config.pic_email} 
                        className="flex items-center justify-center gap-3 w-full bg-[#3e3e42] text-white hover:bg-[#4a4a4d] py-3 rounded-xs font-semibold text-[14px] transition-colors border border-[#4a4a4d]"
                     >
                        <Mail size={18} className="text-primary" />
                        Kirim Email Unit Arsip
                     </a>
                  )}
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1c1c1c] text-gray-500 py-6 px-6 text-center text-[12px] border-t border-[#2d2d30] mt-auto">
         <p>PT Semen Tonasa © Copyright {new Date().getFullYear()}. All Rights Reserved.</p>
      </footer>

    </div>
  );
}
