"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Box, ArrowRight, FileText, MapPin, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams ? searchParams.get("q") || "" : "";
  const initialGedung = searchParams ? searchParams.get("gedung") || "" : "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery || initialGedung) {
      performSearch(initialQuery, initialGedung);
    }
  }, [initialQuery, initialGedung]);

  const performSearch = async (query: string, gedung: string = "") => {
    if (!query.trim() && !gedung.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    let queryBuilder = supabase
      .from("archives")
      .select("id, judul_berkas, jenis_berkas, departemen, tahun, gedung, lorong, rak, status")
      .order("created_at", { ascending: false })
      .limit(50);
      
    if (query.trim()) {
      const term = `%${query}%`;
      queryBuilder = queryBuilder.or(`judul_berkas.ilike.${term},jenis_berkas.ilike.${term},kode_klasifikasi.ilike.${term}`);
    }
    
    if (gedung.trim()) {
      queryBuilder = queryBuilder.eq("gedung", gedung);
    }

    const { data, error } = await queryBuilder;
      
    if (data && !error) {
      setResults(data);
    } else {
      setResults([]);
    }
    
    setLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cari?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Box size={20} />
            </div>
            <h1 className="font-bold text-xl text-gray-900 tracking-tight">Web Arsip PT Semen Tonasa</h1>
          </Link>
          <Link href="/dashboard" className="text-gray-500 flex items-center gap-1 hover:text-blue-600 transition-colors text-sm font-medium">
             Login <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
          <h2 className="font-bold text-2xl text-gray-800 mb-2">Pencarian Arsip Publik</h2>
          <p className="text-gray-500 text-sm mb-6">Temukan lokasi fisik dokumen Anda tanpa perlu login ke sistem.</p>
          
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Masukkan judul, jenis berkas, atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-base rounded-xl focus:ring-blue-500 focus:border-blue-500 block pl-4 pr-14 py-4 transition-all outline-none shadow-inner"
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 transition-colors flex items-center justify-center shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {hasSearched && (
           <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Hasil Pencarian: {results.length} arsip ditemukan</h3>
              
              {results.length > 0 ? (
                 <div className="grid grid-cols-1 gap-4">
                    {results.map((item) => (
                       <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-blue-200 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                             <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                   <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {item.status || 'Menunggu'}
                                   </span>
                                   <span className="text-xs text-gray-500 font-medium">{item.departemen} &bull; {item.tahun}</span>
                                </div>
                                <h4 className="font-bold text-gray-800 text-lg mb-1">{item.judul_berkas}</h4>
                                <p className="text-sm text-gray-500 mb-3">{item.jenis_berkas}</p>
                                
                                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                   <MapPin size={16} />
                                   {item.gedung ? (
                                      <span>Gedung {item.gedung} - Lorong {item.lorong} - Rak {item.rak}</span>
                                   ) : (
                                      <span className="text-gray-500">Lokasi fisik belum ditentukan</span>
                                   )}
                                </div>
                             </div>
                             <div className="hidden md:flex bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <FileText size={32} className="text-gray-400" />
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 !loading && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                       <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
                       <h4 className="font-bold text-gray-700 mb-2">Arsip Tidak Ditemukan</h4>
                       <p className="text-gray-500 text-sm">Coba gunakan kata kunci lain atau pastikan ejaan sudah benar.</p>
                    </div>
                 )
              )}
           </div>
        )}
      </main>
    </div>
  );
}

export default function PublicSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500">
         <Loader2 className="animate-spin mb-4" size={40} />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
