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
    // Gunakan endpoint lh3.googleusercontent.com yang lebih stabil untuk embed gambar
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[0]}`;
  }
  return url;
};

export default function LandingPage() {
  const [config, setConfig] = useState<any>({
    hero_title: 'Sistem Informasi Manajemen Arsip',
    hero_subtitle: 'Platform digitalisasi dan pengelolaan arsip terpadu PT Semen Tonasa.',
    sop_title: 'Prosedur Penyerahan & Pengelolaan Arsip Inaktif',
    sop_text: 'Tahapan standar tata kelola pemindahan berkas dari unit kerja departemen ke unit kearsipan gedung.',
    sop_items: [
       { title: 'Persiapan Berkas', desc: 'Pastikan berkas telah diberkaskan berdasarkan masa kurun waktu dan jenisnya.' },
       { title: 'Pengisian Form', desc: 'Isi form serah terima arsip dari unit asal (Departemen Anda).' },
       { title: 'Verifikasi', desc: 'Tim Kearsipan akan melakukan verifikasi fisik dan kesesuaian data.' },
       { title: 'Digitalisasi & Simpan', desc: 'Arsip fisik disimpan di rak, dan versi digital diunggah ke sistem.' }
    ],
    pic_title: 'PIC Gedung Kearsipan',
    pic_text: 'Untuk kebutuhan penelusuran fisik atau peminjaman, silakan hubungi PIC Gedung Kearsipan pada jam kerja operasional (Senin-Jumat, 08:00 - 16:00 WITA).',
    pic_whatsapp: 'https://wa.me/628114156156',
    pic_email: 'mailto:arsip@sementonasa.co.id'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_page_config")
        .select("*")
        .eq("id", "homepage")
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
        <div className="min-h-screen bg-canvas-soft flex flex-col items-center justify-center text-ink">
           <Loader2 className="animate-spin mb-4 text-primary" size={40} />
           <p className="font-medium animate-pulse text-[17px] tracking-[-0.37px]">Memuat halaman...</p>
        </div>
     );
  }

  if (!config) {
     return (
        <div className="min-h-screen bg-canvas-soft flex items-center justify-center text-ink">
           <p className="font-medium text-[17px]">Konfigurasi landing page tidak ditemukan.</p>
        </div>
     );
  }

  return (
    <div className="bg-canvas-soft min-h-screen flex flex-col font-sans selection:bg-primary selection:text-white">
      
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
         {/* Subtle dark gradient overlay to ensure text legibility and fade smoothly to page background */}
         <div className="absolute inset-0 z-10 bg-gradient-to-t from-canvas-soft via-black/40 to-black/40" />
         
         <div className="relative z-20 max-w-[800px] space-y-6 px-4 mt-[-10vh]">
            <h2 className="text-[48px] md:text-[72px] font-semibold text-white leading-[1.05] tracking-[-1.5px]">
               {config.hero_title}
            </h2>
            <p className="text-white/90 text-[19px] md:text-[21px] max-w-[600px] mx-auto tracking-[-0.022em] font-medium">
               {config.hero_subtitle}
            </p>
            <div className="pt-8">
               <Link href="/login" className="bg-primary hover:bg-primary-deep text-white px-8 py-4 rounded-full font-medium transition-all active:scale-95 text-[17px] shadow-[0_8px_24px_rgba(227,24,55,0.3)]">
                  Telusuri Arsip
               </Link>
            </div>
         </div>
      </section>

      {/* SAMBUTAN SECTION */}
      <section className="px-6 max-w-[1024px] mx-auto w-full relative z-20 -mt-24 md:-mt-32 mb-12">
         <div className="bg-canvas rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-hairline p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
               <div className="md:col-span-4 flex flex-col items-center space-y-4">
                  <div className="w-[180px] md:w-full max-w-[240px] aspect-[4/5] bg-canvas-soft rounded-[16px] flex items-center justify-center text-ink/20 relative overflow-hidden shadow-sm">
                     {config.sambutan_photo_url ? (
                        <img src={getDirectImageUrl(config.sambutan_photo_url)} alt="Sambutan" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                     ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-24 h-24">
                           <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                           <circle cx="12" cy="7" r="4" />
                        </svg>
                     )}
                  </div>
                  <p className="font-semibold text-ink text-[14px] uppercase tracking-wider">Kepala Unit Kearsipan</p>
               </div>
               <div className="md:col-span-8 space-y-6">
                  <h3 className="text-[34px] md:text-[40px] font-semibold text-ink tracking-[-0.022em] leading-tight">
                     {config.sambutan_title}
                  </h3>
                  <div className="w-12 h-1 bg-ink rounded-full"></div>
                  <p className="text-ink-mute text-[17px] leading-[1.47] text-justify whitespace-pre-wrap">
                     {config.sambutan_text}
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* PROSEDUR PENYERAHAN & PENGELOLAAN ARSIP */}
      <section id="prosedur" className="py-12 px-6 bg-canvas-soft">
         <div className="max-w-[1024px] mx-auto space-y-12">
            <div className="text-center max-w-[700px] mx-auto space-y-4">
               <span className="font-semibold text-[#bf4800] text-[12px] tracking-widest uppercase">SOP Resmi</span>
               <h3 className="text-[40px] md:text-[48px] font-semibold text-ink tracking-[-1px] leading-tight">
                  {config.sop_title}
               </h3>
               <p className="text-ink-mute text-[17px] leading-[1.47] max-w-[500px] mx-auto">
                  {config.sop_text}
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
               {config.sop_items && config.sop_items.length > 0 ? (
                  config.sop_items.map((item: any, idx: number) => (
                     <div key={idx} className="bg-canvas border border-hairline p-8 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-4 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow">
                        <div className="text-primary font-bold text-[24px] tracking-tight">{String(idx + 1).padStart(2, '0')}</div>
                        <h4 className="font-semibold text-[19px] text-ink tracking-[-0.022em] leading-snug">{item.title}</h4>
                        <p className="text-ink-mute text-[15px] leading-[1.47]">
                           {item.desc}
                        </p>
                     </div>
                  ))
               ) : (
                  <div className="col-span-full text-center py-12 text-ink-mute text-[17px]">
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
                        <Mail size={18} className="text-[#e31837]" />
                        Kirim Email
                     </a>
                  )}
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-canvas-soft text-ink-mute py-12 px-6 text-center text-[12px] border-t border-hairline mt-auto">
         <p>PT Semen Tonasa &copy; {new Date().getFullYear()}. Seluruh hak cipta dilindungi.</p>
      </footer>

    </div>
  );
}
