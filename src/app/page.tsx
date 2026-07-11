"use client";
import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Mail, MapPin, FileText, CheckCircle2, ChevronRight } from "lucide-react";

export default function LandingPage() {
  const [activeLayoutTab, setActiveLayoutTab] = useState<"ab" | "cd">("ab");

  return (
    <div className="bg-canvas min-h-screen flex flex-col font-sans selection:bg-primary-soft selection:text-white">
      
      {/* NAVBAR */}
      <header className="bg-canvas border-b border-hairline py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
         <div className="flex items-center gap-2.5">
            <img src="/logo-tonasa.png" alt="Logo Semen Tonasa" className="w-7 h-7 object-contain" />
            <h1 className="text-[18px] md:text-[20px] font-bold text-ink tracking-tight">Arsip<span className="text-primary ml-1">Tonasa</span></h1>
         </div>
         <nav className="flex items-center gap-6">
            <Link href="/" className="bg-primary text-on-primary text-[13px] font-semibold px-4 py-1.5 rounded-full">
               Beranda
            </Link>
            <a href="#prosedur" className="text-ink-mute hover:text-ink text-[13px] font-medium transition-colors">
               Prosedur
            </a>
            <a href="#layout" className="text-ink-mute hover:text-ink text-[13px] font-medium transition-colors">
               Layout Gedung
            </a>
            <Link href="/login" className="text-ink hover:text-primary text-[13px] font-semibold transition-colors border border-hairline px-4 py-1.5 rounded-sm bg-canvas-soft hover:bg-canvas">
               Login
            </Link>
         </nav>
      </header>

      {/* HERO SECTION */}
      <section 
         className="relative bg-cover bg-center h-[350px] md:h-[450px] flex items-center justify-center text-center px-4"
         style={{ 
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=450&q=80')" 
         }}
      >
         <div className="max-w-[800px] space-y-4">
            <h2 className="text-[28px] md:text-[42px] font-bold text-white leading-tight tracking-tight px-4">
               Selamat Datang di Website Arsip Semen Tonasa
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-[600px] mx-auto">
               Portal informasi, mekanisme pengarsipan dokumen fisik & digital PT Semen Tonasa secara terintegrasi dan aman.
            </p>
         </div>
      </section>

      {/* SAMBUTAN SECTION */}
      <section className="py-12 md:py-16 px-6 max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
         <div className="md:col-span-4 flex flex-col items-center space-y-3">
            <div className="w-full aspect-[4/5] bg-canvas-soft border border-hairline rounded-sm flex items-center justify-center text-ink-mute-2 relative overflow-hidden">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-24 h-24 text-ink-faint">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
               </svg>
            </div>
            <p className="font-semibold text-ink text-[14px]">Kepala Unit Kearsipan</p>
         </div>
         <div className="md:col-span-8 space-y-4">
            <h3 className="text-display-md text-ink text-[22px] font-bold border-b border-hairline pb-2">Sambutan</h3>
            <p className="text-ink-mute text-[14px] leading-relaxed text-justify">
               PT Semen Tonasa berkomitmen untuk mengelola seluruh dokumen penting perusahaan secara profesional dan terstruktur. Website Arsip ini hadir sebagai sarana integrasi bagi seluruh departemen untuk mengarsipkan dokumen penting secara aman, efisien, dan sesuai dengan standar tata kelola arsip nasional. Dengan digitalisasi dokumen, penemuan kembali arsip menjadi lebih cepat, aman, dan dapat diakses dengan mudah oleh unit kerja yang berwenang.
            </p>
         </div>
      </section>

      {/* PROSEDUR PENYERAHAN & PENGELOLAAN ARSIP (NEW SECTION) */}
      <section id="prosedur" className="py-12 md:py-16 bg-canvas-soft border-y border-hairline px-6">
         <div className="max-w-[1000px] mx-auto space-y-8">
            <div className="text-center max-w-[700px] mx-auto space-y-2">
               <span className="font-mono text-primary text-[12px] font-semibold tracking-wider uppercase">SOP RESMI perusahaan</span>
               <h3 className="text-[24px] md:text-[28px] font-bold text-ink tracking-tight">
                  Prosedur Penyerahan & Pengelolaan Arsip Inaktif
               </h3>
               <p className="text-ink-mute text-[14px]">
                  Tahapan standar tata kelola pemindahan berkas dari unit kerja departemen ke unit kearsipan gedung.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
               {/* Step 1 */}
               <div className="bg-canvas border border-hairline p-5 rounded-xs space-y-3 relative">
                  <div className="text-primary font-bold text-xl">01</div>
                  <h4 className="font-bold text-[15px] text-ink">Pemilahan & Retensi</h4>
                  <p className="text-ink-mute text-[12px] leading-relaxed">
                     Departemen melakukan verifikasi masa retensi dokumen. Arsip yang sudah memasuki masa *Inaktif* dipisahkan dari arsip aktif harian.
                  </p>
               </div>
               {/* Step 2 */}
               <div className="bg-canvas border border-hairline p-5 rounded-xs space-y-3 relative">
                  <div className="text-primary font-bold text-xl">02</div>
                  <h4 className="font-bold text-[15px] text-ink">Registrasi & Upload Link</h4>
                  <p className="text-ink-mute text-[12px] leading-relaxed">
                     Admin Departemen menginput metadata berkas ke sistem ini dan menyertakan URL link file scan digital (Google Drive/Sharepoint).
                  </p>
               </div>
               {/* Step 3 */}
               <div className="bg-canvas border border-hairline p-5 rounded-xs space-y-3 relative">
                  <div className="text-primary font-bold text-xl">03</div>
                  <h4 className="font-bold text-[15px] text-ink">Verifikasi & ACC PIC</h4>
                  <p className="text-ink-mute text-[12px] leading-relaxed">
                     PIC Gedung memeriksa kelayakan dokumen di menu Persetujuan. Fisik berkas diserahkan ke gedung arsip untuk divalidasi.
                  </p>
               </div>
               {/* Step 4 */}
               <div className="bg-canvas border border-hairline p-5 rounded-xs space-y-3 relative">
                  <div className="text-primary font-bold text-xl">04</div>
                  <h4 className="font-bold text-[15px] text-ink">Penataan Rak Fisik</h4>
                  <p className="text-ink-mute text-[12px] leading-relaxed">
                     PIC menempatkan berkas fisik di lokasi rak/lorong spesifik sesuai peta zonasi dan mengkonfirmasi status berkas menjadi Aktif.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* LAYOUT GEDUNG ARSIP SECTION (NEW SECTION FROM BLUEPRINT IMAGES) */}
      <section id="layout" className="py-12 md:py-16 px-6 max-w-[1000px] mx-auto space-y-8">
         <div className="text-center max-w-[700px] mx-auto space-y-2">
            <span className="font-mono text-primary text-[12px] font-semibold tracking-wider uppercase">Zonasi Penyimpanan Fisik</span>
            <h3 className="text-[24px] md:text-[28px] font-bold text-ink tracking-tight">
               Layout & Distribusi Gedung Kearsipan
            </h3>
            <p className="text-ink-mute text-[14px]">
               Pembagian alokasi ruang penyimpanan fisik dokumen departemen pada Gedung A, B, C, dan D PT Semen Tonasa.
            </p>
         </div>

         {/* Layout Tabs Selector */}
         <div className="flex justify-center border-b border-hairline max-w-xs mx-auto">
            <button 
               onClick={() => setActiveLayoutTab("ab")}
               className={`flex-1 text-center py-2 text-[14px] font-semibold border-b-2 transition-all ${
                  activeLayoutTab === "ab" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-ink-mute hover:text-ink"
               }`}
            >
               Zonasi Gedung A & B
            </button>
            <button 
               onClick={() => setActiveLayoutTab("cd")}
               className={`flex-1 text-center py-2 text-[14px] font-semibold border-b-2 transition-all ${
                  activeLayoutTab === "cd" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-ink-mute hover:text-ink"
               }`}
            >
               Zonasi Gedung C & D
            </button>
         </div>

         {/* Visual Layout Representation */}
         <div className="border border-hairline bg-canvas rounded-xs p-6 md:p-8">
            {activeLayoutTab === "ab" ? (
               <div className="space-y-6">
                  <div className="flex items-center gap-2 text-ink border-b border-hairline pb-2">
                     <MapPin size={18} className="text-primary" />
                     <h4 className="font-bold text-[16px]">Alokasi Gedung A & Gedung B</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Gedung A */}
                     <div className="space-y-4">
                        <div className="bg-canvas-soft border border-hairline p-4 rounded-xs">
                           <h5 className="font-bold text-[14px] text-ink mb-3 text-center border-b border-hairline pb-1.5">GEDUNG A</h5>
                           <ul className="space-y-2 text-[12px] text-ink">
                              <li className="flex justify-between items-center bg-canvas p-2 border border-hairline rounded-xs">
                                 <span className="font-semibold">ZONA KEUANGAN</span>
                                 <span className="font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-xs border border-emerald-100 text-[10px]">6 RAK PENYIMPANAN</span>
                              </li>
                              <li className="flex justify-between items-center bg-canvas p-2 border border-hairline rounded-xs">
                                 <span className="font-semibold">ZONA HUMAS</span>
                                 <span className="font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded-xs border border-amber-100 text-[10px]">1 RAK PENYIMPANAN</span>
                              </li>
                              <li className="flex justify-between items-center bg-canvas p-2 border border-hairline rounded-xs">
                                 <span className="font-semibold">ZONA HUKUM</span>
                                 <span className="font-mono bg-red-50 text-primary px-2 py-0.5 rounded-xs border border-red-100 text-[10px]">1 RAK PENYIMPANAN</span>
                              </li>
                           </ul>
                        </div>
                     </div>
                     {/* Gedung B */}
                     <div className="space-y-4">
                        <div className="bg-canvas-soft border border-hairline p-4 rounded-xs">
                           <h5 className="font-bold text-[14px] text-ink mb-3 text-center border-b border-hairline pb-1.5">GEDUNG B</h5>
                           <ul className="space-y-2 text-[12px] text-ink">
                              <li className="flex justify-between items-center bg-canvas p-2 border border-hairline rounded-xs">
                                 <span className="font-semibold">ZONA GAMBAR PABRIK</span>
                                 <span className="font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded-xs border border-blue-100 text-[10px]">6 RAK BESAR (CETAK)</span>
                              </li>
                              <li className="flex justify-between items-center bg-canvas p-2 border border-hairline rounded-xs">
                                 <span className="font-semibold">ZONA KEUANGAN</span>
                                 <span className="font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-xs border border-emerald-100 text-[10px]">7 RAK PENYIMPANAN</span>
                              </li>
                           </ul>
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="space-y-6">
                  <div className="flex items-center gap-2 text-ink border-b border-hairline pb-2">
                     <MapPin size={18} className="text-primary" />
                     <h4 className="font-bold text-[16px]">Alokasi Gedung C & Gedung D</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Gedung C */}
                     <div className="space-y-4">
                        <div className="bg-canvas-soft border border-hairline p-4 rounded-xs">
                           <h5 className="font-bold text-[14px] text-ink mb-3 text-center border-b border-hairline pb-1.5">GEDUNG C</h5>
                           <div className="grid grid-cols-1 gap-2 text-[11px]">
                              <div className="bg-canvas p-2 border border-hairline rounded-xs flex justify-between items-center">
                                 <span className="font-semibold">YKST / KESEHATAN</span>
                                 <span className="font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded-xs text-[10px]">3 Rak</span>
                              </div>
                              <div className="bg-canvas p-2 border border-hairline rounded-xs flex justify-between items-center">
                                 <span className="font-semibold">PENGADAAN, PABRIK & JANULI</span>
                                 <span className="font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded-xs text-[10px]">3 Rak</span>
                              </div>
                              <div className="bg-canvas p-2 border border-hairline rounded-xs flex justify-between items-center">
                                 <span className="font-semibold">DISTRIBUSI, PEMASARAN & HUKUM</span>
                                 <span className="font-mono bg-red-50 text-primary px-2 py-0.5 rounded-xs text-[10px]">3 Rak</span>
                              </div>
                              <div className="bg-canvas p-2 border border-hairline rounded-xs flex justify-between items-center">
                                 <span className="font-semibold">DPST, CSR & SDM</span>
                                 <span className="font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded-xs text-[10px]">4 Rak</span>
                              </div>
                           </div>
                        </div>
                     </div>
                     {/* Gedung D */}
                     <div className="space-y-4">
                        <div className="bg-canvas-soft border border-hairline p-4 rounded-xs">
                           <h5 className="font-bold text-[14px] text-ink mb-3 text-center border-b border-hairline pb-1.5">GEDUNG D</h5>
                           <ul className="space-y-2 text-[12px] text-ink">
                              <li className="flex justify-between items-center bg-canvas p-2 border border-hairline rounded-xs">
                                 <span className="font-semibold">ZONA PROYEK TONASA V</span>
                                 <span className="font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded-xs border border-blue-100 text-[10px]">8 RAK ARSIP BESAR</span>
                              </li>
                              <li className="flex justify-between items-center bg-canvas p-2 border border-hairline rounded-xs">
                                 <span className="font-semibold">ZONA CSR</span>
                                 <span className="font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded-xs border border-amber-100 text-[10px]">1 RAK PENYIMPANAN</span>
                              </li>
                              <li className="flex justify-between items-center bg-canvas p-2 border border-hairline rounded-xs">
                                 <span className="font-semibold">ZONA SDM</span>
                                 <span className="font-mono bg-orange-50 text-orange-800 px-2 py-0.5 rounded-xs border border-orange-100 text-[10px]">3 RAK PENYIMPANAN</span>
                              </li>
                           </ul>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </section>

      {/* PIC GEDUNG ARSIP SECTION */}
      <section className="bg-[#2d2d30] text-white py-12 md:py-16 px-6">
         <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-4 flex flex-col items-center space-y-3">
               <div className="w-full aspect-[4/5] bg-[#3e3e42] border border-[#4a4a4d] rounded-sm flex items-center justify-center text-gray-400 relative overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-24 h-24 text-gray-500">
                     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                     <circle cx="12" cy="7" r="4" />
                  </svg>
               </div>
               <p className="font-semibold text-gray-300 text-[14px]">Syukur - PIC Gedung</p>
            </div>
            <div className="md:col-span-8 space-y-5">
               <h3 className="text-[22px] font-bold border-b border-[#4a4a4d] pb-2 text-white">PIC Gedung Arsip</h3>
               <p className="text-gray-300 text-[14px] leading-relaxed">
                  Pengelolaan fisik arsip, penentuan rak, lorong, dan verifikasi dokumen masuk dikelola langsung oleh PIC Gedung Arsip. Bagi unit kerja atau departemen yang membutuhkan koordinasi serah terima dokumen fisik atau akses darurat, silakan hubungi PIC melalui kontak resmi di bawah ini:
               </p>
               <div className="space-y-3 pt-2">
                  <a 
                     href="https://wa.me/628123456789" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="flex items-center justify-center gap-3 w-full bg-white text-ink hover:bg-gray-100 py-3 rounded-xs font-semibold text-[14px] transition-colors border border-transparent shadow-sm"
                  >
                     <MessageSquare size={18} className="text-emerald-600 fill-emerald-600" />
                     Hubungi via Whatsapp
                  </a>
                  <a 
                     href="mailto:arsip@sementonasa.co.id" 
                     className="flex items-center justify-center gap-3 w-full bg-[#3e3e42] text-white hover:bg-[#4a4a4d] py-3 rounded-xs font-semibold text-[14px] transition-colors border border-[#4a4a4d]"
                  >
                     <Mail size={18} className="text-primary" />
                     Kirim Email Unit Arsip
                  </a>
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
