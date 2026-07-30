"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Search, Box, Info, Navigation, ArrowRight, LayoutDashboard, Volume2, VolumeX, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRole } from "@/components/RoleContext";

// Helper to convert standard Google Drive links to direct image links
const getDirectImageUrl = (url: string) => {
  if (!url) return url;
  const match = url.match(/drive\.google\.com\/file\/d\/([^\/?]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url;
};

export default function LokasiPage() {
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
      // Auto play TTS with slight delay for better UX
      setTimeout(() => {
         playTTS(data.deskripsi);
      }, 1000);
    }
    setLoading(false);
  };

  const playTTS = (text: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID"; // Indonesian
    utterance.rate = 1.1; // Increased pace slightly based on feedback
    
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500">
           <Loader2 className="animate-spin mb-4" size={40} />
           <p className="font-medium animate-pulse">Memuat data lokasi...</p>
        </div>
     );
  }

  if (!mappingData) {
     return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
           <MapPin size={48} className="text-gray-300 mb-4" />
           <h2 className="text-xl font-bold text-gray-700 mb-2">Lokasi Tidak Ditemukan</h2>
           <p className="text-gray-500 mb-6">QR Code mungkin tidak valid atau lokasi telah dihapus.</p>
           <Link href="/cari" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Buka Pencarian Arsip
           </Link>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Box size={20} />
            </div>
            <h1 className="font-bold text-xl text-gray-900 tracking-tight">E-Arsip Tonasa</h1>
          </div>
          <Link href="/dashboard" className="text-gray-500 flex items-center gap-1 hover:text-blue-600 transition-colors text-sm font-medium">
             Login <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-8 space-y-6">
        {/* Location Banner */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden transform transition-all hover:scale-[1.01]">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
             <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-10"></div>
             
             <MapPin className="mx-auto mb-3 text-blue-200" size={40} />
             <p className="text-blue-100 text-sm font-medium mb-1 tracking-wide uppercase">Lokasi Anda Saat Ini</p>
             <h2 className="text-3xl font-extrabold tracking-tight">{mappingData.gedung}</h2>
          </div>
          
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 bg-blue-50 text-blue-900 p-4 rounded-xl mb-4">
              <div className="flex items-start gap-3">
                 <Info className="shrink-0 mt-0.5 text-blue-600" size={20} />
                 <p className="text-sm leading-relaxed pr-2">
                   {mappingData.deskripsi}
                 </p>
              </div>
              <button 
                 onClick={() => isPlaying ? stopTTS() : playTTS(mappingData.deskripsi)}
                 className={`shrink-0 p-2 rounded-full transition-colors ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-blue-200 text-blue-700 hover:bg-blue-300'}`}
                 title="Putar / Hentikan Suara"
              >
                 {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            {mappingData.map_url && (
              <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex flex-col items-center justify-center p-2 mt-4">
                 <p className="w-full text-left text-xs font-semibold text-gray-500 mb-2 pl-2">Peta Lokasi:</p>
                 <img 
                    src={getDirectImageUrl(mappingData.map_url)} 
                    alt={`Peta ${mappingData.gedung}`} 
                    className="w-full rounded-lg object-contain cursor-zoom-in hover:opacity-90 transition-opacity bg-white"
                    onClick={() => setIsZoomed(true)}
                    onError={(e) => {
                       (e.target as HTMLImageElement).style.display = 'none';
                    }}
                 />
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Zoom Modal */}
        {isZoomed && mappingData.map_url && (
           <div 
              className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm"
              onClick={() => setIsZoomed(false)}
           >
              <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
                 <button 
                    className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-colors"
                    onClick={() => setIsZoomed(false)}
                 >
                    <VolumeX size={24} className="hidden" /> {/* Just to maintain import if needed, actually we'll use a standard X or text */}
                    <span className="font-bold text-xl px-2">&times;</span>
                 </button>
                 <img 
                    src={getDirectImageUrl(mappingData.map_url)} 
                    alt={`Zoomed Peta ${mappingData.gedung}`} 
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()} 
                 />
              </div>
           </div>
        )}

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-5">
          <div className="flex flex-col items-center">
             <button 
                onClick={() => {
                   if (mappingData?.gedung) {
                      loginAsGuest(mappingData.gedung);
                      router.push('/dashboard');
                   }
                }}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-full transition-colors"
             >
                Telusuri Arsip Gedung {mappingData.gedung} <ArrowRight size={16} />
             </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-4 text-center">Anda akan masuk sebagai Tamu Publik.</p>
        </div>

      </main>
    </div>
  );
}
