"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Mail, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import GlobalNav from "@/components/GlobalNav";

const getDirectImageUrl = (url: string) => {
  if (!url) return '';
  // Jika URL dari Supabase atau sudah direct URL, langsung return
  if (url.includes('supabase.co') || url.includes('supabase.in') || url.includes('imgur.com')) {
     return url;
  }
  
  // Jika URL Google Drive, konversi ke direct link
  const fileIdMatch = url.match(/[-\w]{25,}/);
  if (url.includes('google.com') && fileIdMatch && fileIdMatch[0]) {
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
         className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center text-center overflow-hidden pb-16 md:pb-32"
      >
         <div 
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ 
               backgroundImage: `url('${getDirectImageUrl(config.hero_image_url || '/hero-image.jpg')}')` 
            }}
         />
         {/* Subtle dark gradient overlay to ensure text legibility and fade smoothly to page background */}
         <div className="absolute inset-0 z-10 bg-gradient-to-t from-canvas-soft via-black/40 to-black/40" />
         
         <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-20 max-w-[800px] space-y-5 md:space-y-6 px-4"
         >
            <h2 className="text-[42px] sm:text-[48px] md:text-[72px] font-semibold text-white leading-[1.05] tracking-[-1.5px]">
               {config.hero_title}
            </h2>
            <p className="text-white/90 text-[17px] sm:text-[19px] md:text-[21px] max-w-[600px] mx-auto tracking-[-0.022em] font-medium">
               {config.hero_subtitle}
            </p>
            <div className="pt-6 md:pt-8">
               <Link href="/login" className="bg-primary hover:bg-primary-deep text-white px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-medium transition-all active:scale-95 text-[16px] sm:text-[17px] shadow-[0_8px_24px_rgba(227,24,55,0.3)] inline-block">
                  Telusuri Arsip
               </Link>
            </div>
         </motion.div>
      </section>

      {/* SAMBUTAN SECTION */}
      <section className="px-4 sm:px-6 max-w-[1024px] mx-auto w-full relative z-20 -mt-12 md:-mt-20 mb-12">
         <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-canvas rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-hairline p-6 sm:p-8 md:p-12"
         >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
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
                  <div className="text-center mt-2">
                     <p className="font-bold text-ink text-[15px]">{config.sambutan_pejabat || 'M. DAHLAN, SE.'}</p>
                     <p className="font-semibold text-ink-mute text-[13px] uppercase tracking-wider mt-0.5">{config.sambutan_jabatan || 'Kepala Unit Kearsipan'}</p>
                  </div>
               </div>
               <div className="md:col-span-8 space-y-5 md:space-y-6">
                  <h3 className="text-[28px] sm:text-[34px] md:text-[40px] font-semibold text-ink tracking-[-0.022em] leading-tight">
                     {config.sambutan_title}
                  </h3>
                  <div className="w-12 h-1 bg-ink rounded-full"></div>
                  <p className="text-ink-mute text-[15px] sm:text-[17px] leading-[1.47] text-justify whitespace-pre-wrap">
                     {config.sambutan_text}
                  </p>
               </div>
            </div>
         </motion.div>
      </section>

      {/* PROSEDUR PENYERAHAN & PENGELOLAAN ARSIP */}
      <section id="prosedur" className="py-12 px-4 sm:px-6 bg-canvas-soft">
         <div className="max-w-[1024px] mx-auto space-y-10 md:space-y-12">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.6 }}
               className="text-center max-w-[700px] mx-auto space-y-3 md:space-y-4"
            >
               <span className="font-semibold text-[#bf4800] text-[12px] tracking-widest uppercase">SOP Resmi</span>
               <h3 className="text-[32px] sm:text-[40px] md:text-[48px] font-semibold text-ink tracking-[-1px] leading-tight">
                  {config.sop_title}
               </h3>
               <p className="text-ink-mute text-[15px] sm:text-[17px] leading-[1.47] max-w-[500px] mx-auto">
                  {config.sop_text}
               </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6 md:pt-8">
               {config.sop_items && config.sop_items.length > 0 ? (
                  config.sop_items.map((item: any, idx: number) => (
                     <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="bg-canvas border border-hairline p-6 sm:p-8 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-3 sm:space-y-4 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow"
                     >
                        <div className="text-primary font-bold text-[24px] tracking-tight">{String(idx + 1).padStart(2, '0')}</div>
                        <h4 className="font-semibold text-[17px] sm:text-[19px] text-ink tracking-[-0.022em] leading-snug">{item.title}</h4>
                        <p className="text-ink-mute text-[14px] sm:text-[15px] leading-[1.47]">
                           {item.desc}
                        </p>
                     </motion.div>
                  ))
               ) : (
                  <div className="col-span-full text-center py-12 text-ink-mute text-[17px]">
                     Belum ada tahapan prosedur yang ditambahkan.
                  </div>
               )}
            </div>
         </div>
      </section>

      {/* PIC GEDUNG ARSIP SECTION */}
      <section className="bg-canvas border-t border-hairline py-16 md:py-24 px-4 sm:px-6 transition-colors overflow-hidden">
         <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-[1024px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center"
         >
               <div className="md:col-span-4 flex flex-col items-center space-y-4">
                  <div className="w-[180px] md:w-full max-w-[240px] aspect-[4/5] bg-canvas-soft rounded-[16px] flex items-center justify-center text-ink/20 relative overflow-hidden shadow-sm">
                  {config.pic_photo_url ? (
                     <img src={getDirectImageUrl(config.pic_photo_url)} alt="PIC" className="w-full h-full object-cover" />
                  ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-24 h-24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                     </svg>
                  )}
                  </div>
                  <p className="font-semibold text-ink text-[14px] uppercase tracking-wider">
                     {config.pic_title.split('-')[1]?.trim() || "PIC Gedung"}
                  </p>
               </div>
               <div className="md:col-span-8 space-y-5 md:space-y-6">
                  <h3 className="text-[28px] sm:text-[34px] md:text-[40px] font-semibold text-ink tracking-[-0.022em] leading-tight">
                     {config.pic_title}
                  </h3>
                  <div className="w-12 h-1 bg-ink rounded-full"></div>
                  <p className="text-ink-mute text-[15px] sm:text-[17px] leading-[1.47] text-justify whitespace-pre-wrap">
                     {config.pic_text}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                     {config.pic_whatsapp && (
                        <a 
                           href={config.pic_whatsapp} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="flex items-center justify-center gap-2 bg-[#f5f5f7] dark:bg-primary/10 hover:bg-white dark:hover:bg-primary/20 text-[#1d1d1f] dark:text-primary px-5 py-3.5 sm:px-6 sm:py-4 rounded-full font-medium text-[15px] sm:text-[17px] transition-all active:scale-95 border border-hairline"
                        >
                           <MessageSquare size={18} className="text-[#34c759] dark:text-primary fill-[#34c759] dark:fill-primary" />
                           Hubungi Whatsapp
                        </a>
                     )}
                     {config.pic_email && (
                        <a 
                           href={config.pic_email} 
                           className="flex items-center justify-center gap-2 bg-canvas-soft hover:bg-hairline text-ink px-5 py-3.5 sm:px-6 sm:py-4 rounded-full font-medium text-[15px] sm:text-[17px] transition-all active:scale-95 border border-hairline"
                        >
                           <Mail size={18} className="text-primary" />
                           Kirim Email
                        </a>
                     )}
                  </div>
               </div>
         </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-primary text-white/90 py-12 px-6 text-center text-[13px] mt-auto relative z-10 shadow-[0_-10px_40px_rgba(227,24,55,0.15)]">
         <p>PT Semen Tonasa &copy; {new Date().getFullYear()}. Seluruh hak cipta dilindungi.</p>
      </footer>

    </div>
  );
}
