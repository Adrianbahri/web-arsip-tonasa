"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Loader2, 
  MapPin, 
  Box,
  ArrowRight,
  Info,
  Volume2,
  VolumeX,
  X
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/components/RoleContext";
import GlobalNav from "@/components/GlobalNav";

// Utility for formatting google drive links
const getDirectImageUrl = (url: string) => {
  if (!url) return '';
  const fileIdMatch = url.match(/[-\w]{25,}/);
  if (fileIdMatch && fileIdMatch[0]) {
    // Gunakan endpoint lh3.googleusercontent.com yang lebih stabil untuk embed gambar
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[0]}`;
  }
  return url;
};

export default function LokasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { loginAsGuest } = useRole();
  
  const [id, setId] = useState<string>("");
  const [mappingData, setMappingData] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  useEffect(() => {
    if (params && params.id) {
      setId(params.id as string);
    }
  }, [params]);

  useEffect(() => {
    if (id) {
      fetchMapping();
      fetchConfig();
    }
  }, [id]);

  const fetchConfig = async () => {
    const { data } = await supabase.from("landing_page_config").select("hero_image_url").eq("id", "homepage").single();
    if (data) setConfig(data);
  };

  const fetchMapping = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("master_digital_mapping")
      .select("*")
      .eq("id", id)
      .single();
      
    if (data && !error) {
      setMappingData(data);
      setTimeout(() => {
         playTTS(data.deskripsi);
      }, 1000);
    }
    setLoading(false);
  };

  const playTTS = (text: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 1.1;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopTTS = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  if (loading) {
     return (
        <div className="min-h-screen bg-canvas-soft flex flex-col items-center justify-center text-ink">
           <Loader2 className="animate-spin mb-4 text-primary" size={40} />
           <p className="font-medium animate-pulse text-[17px] tracking-[-0.37px]">Memuat data lokasi...</p>
        </div>
     );
  }

  if (!mappingData) {
     return (
        <div className="min-h-screen bg-canvas-soft flex flex-col items-center justify-center p-6 text-center">
           <MapPin size={48} className="text-ink-mute mb-4" />
           <h2 className="text-[34px] font-semibold text-ink mb-2 tracking-[-0.37px] leading-tight">Lokasi Tidak Ditemukan</h2>
           <p className="text-[17px] text-ink/70 mb-8 max-w-md mx-auto leading-relaxed">QR Code mungkin tidak valid atau lokasi telah dihapus dari sistem kami.</p>
           <Link href="/dashboard" className="bg-primary hover:bg-primary-deep text-white px-6 py-3 rounded-full font-medium transition-all active:scale-95 text-[17px]">
              Kembali ke Beranda
           </Link>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-canvas-soft text-ink font-sans selection:bg-primary selection:text-white pb-32">
      {/* Global Nav */}
      <GlobalNav />

      {/* Hero Section with Faded Background */}
      <section className="relative pt-24 pb-16 px-4 text-center overflow-hidden">
         <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.15]"
            style={{ 
               backgroundImage: `url('${getDirectImageUrl(config?.hero_image_url || '/hero-image.jpg')}')` 
            }}
         />
         <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-canvas-soft/50 to-canvas-soft" />
         
         <div className="relative z-10">
           <p className="text-[#bf4800] text-[12px] font-semibold tracking-widest uppercase mb-4 shadow-sm inline-block px-3 py-1 bg-canvas/50 backdrop-blur-sm rounded-full border border-hairline">Lokasi Anda Saat Ini</p>
           <h1 className="text-[56px] md:text-[64px] font-semibold tracking-[-1px] leading-[1.05] text-ink mb-4 drop-shadow-sm">
             {mappingData.gedung}
           </h1>
         </div>
      </section>

      <main className="max-w-[1200px] mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Map Card */}
        {mappingData.map_url && (
          <div className="w-full lg:w-2/3 bg-canvas rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8 md:p-10 overflow-hidden border border-hairline">
             <h3 className="text-[24px] font-semibold tracking-[-0.37px] mb-6">Peta Lokasi</h3>
             <div className="rounded-[16px] overflow-hidden bg-canvas border border-hairline aspect-square md:aspect-video relative cursor-zoom-in group" onClick={() => setIsZoomed(true)}>
                <img 
                   src={getDirectImageUrl(mappingData.map_url)} 
                   alt={`Peta ${mappingData.gedung}`} 
                   className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                   onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                   }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
                   <div className="bg-canvas/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm text-[14px] font-medium text-ink opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 border border-hairline">
                      Klik untuk memperbesar
                   </div>
                </div>
             </div>
          </div>
        )}
        
        {/* Info Card */}
        <div className={`w-full ${mappingData.map_url ? 'lg:w-1/3' : 'max-w-3xl'} bg-canvas rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8 transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-hairline flex flex-col gap-8`}>
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-canvas-soft px-4 py-1.5 rounded-full text-[14px] font-medium text-ink/80 mb-2 border border-hairline">
                 <Info size={16} className="text-primary" />
                 Informasi Gedung
              </div>
              <p className="text-[17px] leading-[1.47] tracking-[-0.022em] text-ink font-normal">
                 {mappingData.deskripsi}
              </p>
           </div>
           
           <div className="bg-canvas-soft p-4 rounded-[16px] flex flex-col items-center justify-center gap-2 border border-hairline mt-auto">
              <button 
                 onClick={() => isPlaying ? stopTTS() : playTTS(mappingData.deskripsi)}
                 className={`w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95 ${isPlaying ? 'bg-[#ff3b30]/10 text-[#ff3b30]' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                 aria-label="Toggle Narasi"
              >
                 {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <span className="text-[12px] font-medium text-ink-mute">{isPlaying ? "Berhenti" : "Dengarkan Narasi"}</span>
           </div>
        </div>
        
        </div>
      </main>

      {/* Floating Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-8 pt-4 bg-gradient-to-t from-canvas-soft via-canvas-soft/90 to-transparent pointer-events-none flex justify-center">
         <div className="bg-canvas/80 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-hairline p-1.5 pr-2 pl-1.5 sm:p-2 sm:pr-6 sm:pl-2 rounded-[32px] flex items-center gap-3 sm:gap-4 pointer-events-auto transform transition-transform hover:-translate-y-1 w-full max-w-max">
            <div className="bg-canvas-soft w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-ink flex-shrink-0">
               <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col mr-1 sm:mr-4 flex-1 min-w-0">
               <span className="text-[10px] sm:text-[12px] font-medium text-ink/60 uppercase tracking-wider hidden sm:block">Akses Publik</span>
               <span className="text-[14px] sm:text-[17px] font-semibold text-ink leading-tight truncate">{mappingData.gedung}</span>
            </div>
            <button 
               onClick={() => {
                  if (mappingData?.gedung) {
                     loginAsGuest(mappingData.gedung);
                     router.push('/dashboard');
                  }
               }}
               className="bg-primary hover:bg-primary-deep text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full font-medium transition-all active:scale-95 flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-[15px] whitespace-nowrap flex-shrink-0 shadow-[0_4px_12px_rgba(227,24,55,0.2)]"
            >
               Telusuri <span className="hidden sm:inline">Arsip</span> <ArrowRight className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
         </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomed && mappingData.map_url && (
         <div 
            className="fixed inset-0 z-[100] bg-canvas-soft/95 backdrop-blur-xl flex flex-col cursor-zoom-out animate-in fade-in duration-300"
            onClick={() => setIsZoomed(false)}
         >
            <div className="w-full flex justify-end p-6">
               <button 
                  className="bg-hairline hover:bg-hairline-strong text-ink rounded-full p-3 transition-colors active:scale-95"
                  onClick={() => setIsZoomed(false)}
               >
                  <X size={24} />
               </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-hidden">
               <img 
                  src={getDirectImageUrl(mappingData.map_url)} 
                  alt={`Zoomed Peta ${mappingData.gedung}`} 
                  className="max-w-full max-h-full object-contain shadow-[0_30px_100px_rgba(0,0,0,0.15)] rounded-lg"
                  onClick={(e) => e.stopPropagation()} 
               />
            </div>
         </div>
      )}

    </div>
  );
}
