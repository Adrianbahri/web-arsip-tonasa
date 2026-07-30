"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import GlobalNav from "@/components/GlobalNav";

const getDirectImageUrl = (url: string) => {
  if (!url) return '';
  const fileIdMatch = url.match(/[-\w]{25,}/);
  if (fileIdMatch && fileIdMatch[0]) {
    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[0]}`;
  }
  return url;
};

export default function LandingPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_page_config")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (data && !error) {
        setConfig(data);
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
        <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center text-[#1d1d1f]">
           <Loader2 className="animate-spin mb-4 text-[#0066cc]" size={40} />
           <p className="font-medium animate-pulse text-[17px] tracking-[-0.37px]">Memuat halaman...</p>
        </div>
     );
  }

  if (!config) {
     return (
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]">
           <p className="font-medium text-[17px]">Konfigurasi landing page tidak ditemukan.</p>
        </div>
     );
  }

  return (
    <div className="bg-[#f5f5f7] min-h-screen flex flex-col font-sans selection:bg-[#0066cc] selection:text-white">
      
      <GlobalNav />

      {/* HERO SECTION */}
      <section 
         className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center text-center overflow-hidden"
      >
         <div 
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ 
               backgroundImage: `url('${getDirectImageUrl(config.hero_image_url || '/hero-image.jpg')}')` 
            }}
         />
         {/* Subtle dark gradient overlay to ensure text legibility */}
         <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/20 to-[#f5f5f7]" />
         
         <div className="relative z-20 max-w-[800px] space-y-6 px-4 mt-[-10vh]">
            <h2 className="text-[48px] md:text-[72px] font-semibold text-white leading-[1.05] tracking-[-1.5px]">
               {config.hero_title}
            </h2>
            <p className="text-white/90 text-[19px] md:text-[21px] max-w-[600px] mx-auto tracking-[-0.022em] font-medium">
               {config.hero_subtitle}
            </p>
            <div className="pt-8">
               <Link href="/login" className="bg-[#0066cc] hover:bg-[#0055b3] text-white px-8 py-4 rounded-full font-medium transition-all active:scale-95 text-[17px] shadow-[0_8px_24px_rgba(0,102,204,0.3)]">
                  Mulai Gunakan Arsip
               </Link>
            </div>
         </div>
      </section>

      {/* SAMBUTAN SECTION */}
      <section className="py-24 px-6 max-w-[1024px] mx-auto w-full z-20 -mt-16">
         <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
               <div className="md:col-span-4 flex flex-col items-center space-y-4">
                  <div className="w-[180px] md:w-full max-w-[240px] aspect-[4/5] bg-[#f5f5f7] rounded-[16px] flex items-center justify-center text-[#1d1d1f]/20 relative overflow-hidden shadow-sm">
                     {config.sambutan_photo_url ? (
                        <img src={getDirectImageUrl(config.sambutan_photo_url)} alt="Sambutan" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                     ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-24 h-24">
                           <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                           <circle cx="12" cy="7" r="4" />
                        </svg>
                     )}
                  </div>
                  <p className="font-semibold text-[#1d1d1f] text-[14px] uppercase tracking-wider">Kepala Unit Kearsipan</p>
               </div>
               <div className="md:col-span-8 space-y-6">
                  <h3 className="text-[34px] md:text-[40px] font-semibold text-[#1d1d1f] tracking-[-0.022em] leading-tight">
                     {config.sambutan_title}
                  </h3>
                  <div className="w-12 h-1 bg-[#1d1d1f] rounded-full"></div>
                  <p className="text-[#1d1d1f]/80 text-[17px] leading-[1.47] text-justify whitespace-pre-wrap">
                     {config.sambutan_text}
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* PROSEDUR PENYERAHAN & PENGELOLAAN ARSIP */}
      <section id="prosedur" className="py-24 px-6 bg-[#f5f5f7]">
         <div className="max-w-[1024px] mx-auto space-y-12">
            <div className="text-center max-w-[700px] mx-auto space-y-4">
               <span className="font-semibold text-[#bf4800] text-[12px] tracking-widest uppercase">SOP Resmi</span>
               <h3 className="text-[40px] md:text-[48px] font-semibold text-[#1d1d1f] tracking-[-1px] leading-tight">
                  {config.sop_title}
               </h3>
               <p className="text-[#1d1d1f]/70 text-[17px] leading-[1.47] max-w-[500px] mx-auto">
                  {config.sop_text}
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
               {config.sop_items && config.sop_items.length > 0 ? (
                  config.sop_items.map((item: any, idx: number) => (
                     <div key={idx} className="bg-white p-8 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-4 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow">
                        <div className="text-[#0066cc] font-bold text-[24px] tracking-tight">{String(idx + 1).padStart(2, '0')}</div>
                        <h4 className="font-semibold text-[19px] text-[#1d1d1f] tracking-[-0.022em] leading-snug">{item.title}</h4>
                        <p className="text-[#1d1d1f]/70 text-[15px] leading-[1.47]">
                           {item.desc}
                        </p>
                     </div>
                  ))
               ) : (
                  <div className="col-span-full text-center py-12 text-[#1d1d1f]/50 text-[17px]">
                     Belum ada tahapan prosedur yang ditambahkan.
                  </div>
               )}
            </div>
         </div>
      </section>

      {/* PIC GEDUNG ARSIP SECTION (Dark Mode Apple) */}
      <section className="bg-[#1d1d1f] text-[#f5f5f7] py-24 px-6">
         <div className="max-w-[1024px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-4 flex flex-col items-center space-y-5">
               <div className="w-[200px] md:w-full max-w-[260px] aspect-[4/5] bg-black border border-white/10 rounded-[16px] flex items-center justify-center text-white/20 relative overflow-hidden">
                  {config.pic_photo_url ? (
                     <img src={getDirectImageUrl(config.pic_photo_url)} alt="PIC" className="w-full h-full object-cover" />
                  ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-24 h-24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                     </svg>
                  )}
               </div>
               <p className="font-semibold text-white/60 text-[14px] uppercase tracking-widest">
                  {config.pic_title.split('-')[1]?.trim() || "PIC Gedung"}
               </p>
            </div>
            <div className="md:col-span-8 space-y-8">
               <h3 className="text-[40px] md:text-[48px] font-semibold tracking-[-1px] leading-tight text-white">
                  {config.pic_title}
               </h3>
               <p className="text-white/70 text-[17px] leading-[1.47] max-w-2xl whitespace-pre-wrap">
                  {config.pic_text}
               </p>
               <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {config.pic_whatsapp && (
                     <a 
                        href={config.pic_whatsapp} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center gap-2 bg-[#f5f5f7] hover:bg-white text-[#1d1d1f] px-6 py-4 rounded-full font-medium text-[17px] transition-all active:scale-95"
                     >
                        <MessageSquare size={18} className="text-[#34c759] fill-[#34c759]" />
                        Hubungi Whatsapp
                     </a>
                  )}
                  {config.pic_email && (
                     <a 
                        href={config.pic_email} 
                        className="flex items-center justify-center gap-2 bg-[#333336] hover:bg-[#424245] text-white px-6 py-4 rounded-full font-medium text-[17px] transition-all active:scale-95"
                     >
                        <Mail size={18} className="text-[#0066cc]" />
                        Kirim Email
                     </a>
                  )}
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#f5f5f7] text-[#1d1d1f]/60 py-12 px-6 text-center text-[12px] border-t border-black/5 mt-auto">
         <p>PT Semen Tonasa &copy; {new Date().getFullYear()}. Seluruh hak cipta dilindungi.</p>
      </footer>

    </div>
  );
}
