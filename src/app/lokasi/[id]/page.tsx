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

// Utility for formatting google drive links
const getDirectImageUrl = (url: string) => {
  if (!url) return '';
  const fileIdMatch = url.match(/[-\w]{25,}/);
  if (fileIdMatch && fileIdMatch[0]) {
    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[0]}`;
  }
  return url;
};

export default function LokasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { loginAsGuest } = useRole();
  
  const [id, setId] = useState<string>("");
  const [mappingData, setMappingData] = useState<any>(null);
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
    }
  }, [id]);

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
        <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center text-[#1d1d1f]">
           <Loader2 className="animate-spin mb-4 text-[#0066cc]" size={40} />
           <p className="font-medium animate-pulse text-[17px] tracking-[-0.37px]">Memuat data lokasi...</p>
        </div>
     );
  }

  if (!mappingData) {
     return (
        <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center p-6 text-center">
           <MapPin size={48} className="text-gray-400 mb-4" />
           <h2 className="text-[34px] font-semibold text-[#1d1d1f] mb-2 tracking-[-0.37px] leading-tight">Lokasi Tidak Ditemukan</h2>
           <p className="text-[17px] text-[#1d1d1f]/70 mb-8 max-w-md mx-auto leading-relaxed">QR Code mungkin tidak valid atau lokasi telah dihapus dari sistem kami.</p>
           <Link href="/dashboard" className="bg-[#0066cc] hover:bg-[#0055b3] text-white px-6 py-3 rounded-full font-medium transition-all active:scale-95 text-[17px]">
              Kembali ke Beranda
           </Link>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-[#0066cc] selection:text-white pb-32">
      {/* Global Nav (Apple style: Black surface) */}
      <header className="bg-black text-white h-[44px] flex items-center sticky top-0 z-50">
        <div className="w-full max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <Box size={18} />
            <span className="font-semibold text-sm tracking-wide">Tonasa</span>
          </Link>
          <Link href="/dashboard" className="text-xs font-medium text-white/80 hover:text-white transition-colors">
             Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 text-center">
        <p className="text-[#bf4800] text-[12px] font-semibold tracking-widest uppercase mb-4">Lokasi Anda Saat Ini</p>
        <h1 className="text-[56px] md:text-[64px] font-semibold tracking-[-1px] leading-[1.05] text-[#1d1d1f] mb-4">
          {mappingData.gedung}
        </h1>
      </section>

      <main className="max-w-3xl mx-auto px-4 space-y-8">
        
        {/* Info Card */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8 md:p-10 transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
             <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#f5f5f7] px-4 py-1.5 rounded-full text-[14px] font-medium text-[#1d1d1f]/80 mb-2">
                   <Info size={16} className="text-[#0066cc]" />
                   Informasi Gedung
                </div>
                <p className="text-[17px] leading-[1.47] tracking-[-0.022em] text-[#1d1d1f] font-normal">
                   {mappingData.deskripsi}
                </p>
             </div>
             <div className="md:w-auto flex flex-col justify-center items-center gap-3">
                <button 
                   onClick={() => isPlaying ? stopTTS() : playTTS(mappingData.deskripsi)}
                   className={`w-16 h-16 flex items-center justify-center rounded-full transition-all active:scale-95 ${isPlaying ? 'bg-[#ff3b30]/10 text-[#ff3b30]' : 'bg-[#0066cc]/10 text-[#0066cc] hover:bg-[#0066cc]/20'}`}
                   aria-label="Toggle Narasi"
                >
                   {isPlaying ? <VolumeX size={28} /> : <Volume2 size={28} />}
                </button>
                <span className="text-[12px] font-medium text-[#1d1d1f]/60">{isPlaying ? "Berhenti" : "Dengarkan"}</span>
             </div>
          </div>
        </div>

        {/* Map Card */}
        {mappingData.map_url && (
          <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8 md:p-10 overflow-hidden">
             <h3 className="text-[24px] font-semibold tracking-[-0.37px] mb-6">Peta Lokasi</h3>
             <div className="rounded-[16px] overflow-hidden bg-[#f5f5f7] border border-black/5 aspect-video md:aspect-[21/9] relative cursor-zoom-in group" onClick={() => setIsZoomed(true)}>
                <img 
                   src={getDirectImageUrl(mappingData.map_url)} 
                   alt={`Peta ${mappingData.gedung}`} 
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                   onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                   }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                   <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm text-[14px] font-medium text-[#1d1d1f] opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      Klik untuk memperbesar
                   </div>
                </div>
             </div>
          </div>
        )}

      </main>

      {/* Floating Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-8 pt-4 bg-gradient-to-t from-[#f5f5f7] via-[#f5f5f7]/90 to-transparent pointer-events-none flex justify-center">
         <div className="bg-white/80 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/5 p-2 pr-6 pl-2 rounded-[32px] flex items-center gap-4 pointer-events-auto transform transition-transform hover:-translate-y-1">
            <div className="bg-[#f5f5f7] w-12 h-12 rounded-full flex items-center justify-center text-[#1d1d1f] flex-shrink-0">
               <MapPin size={24} />
            </div>
            <div className="flex flex-col mr-4 flex-1">
               <span className="text-[12px] font-medium text-[#1d1d1f]/60 uppercase tracking-wider">Akses Publik</span>
               <span className="text-[17px] font-semibold text-[#1d1d1f] leading-tight truncate max-w-[120px] sm:max-w-[200px]">{mappingData.gedung}</span>
            </div>
            <button 
               onClick={() => {
                  if (mappingData?.gedung) {
                     loginAsGuest(mappingData.gedung);
                     router.push('/dashboard');
                  }
               }}
               className="bg-[#0066cc] hover:bg-[#0055b3] text-white px-5 sm:px-6 py-3 rounded-full font-medium transition-all active:scale-95 flex items-center gap-2 text-[15px] whitespace-nowrap flex-shrink-0"
            >
               Telusuri Arsip <ArrowRight size={18} />
            </button>
         </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomed && mappingData.map_url && (
         <div 
            className="fixed inset-0 z-[100] bg-[#f5f5f7]/95 backdrop-blur-xl flex flex-col cursor-zoom-out animate-in fade-in duration-300"
            onClick={() => setIsZoomed(false)}
         >
            <div className="w-full flex justify-end p-6">
               <button 
                  className="bg-black/5 hover:bg-black/10 text-[#1d1d1f] rounded-full p-3 transition-colors active:scale-95"
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
