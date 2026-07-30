"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function GlobalNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // If we are on the landing page and click a hash link, it should scroll.
  // Otherwise, if we are on /lokasi/[id], clicking Prosedur should go to /#prosedur
  const getProsedurHref = () => {
    return pathname === "/" ? "#prosedur" : "/#prosedur";
  };

  return (
    <>
      <header className="bg-[#1d1d1f] text-white h-[60px] flex items-center sticky top-0 z-50">
        <div className="w-full max-w-[1024px] mx-auto px-4 flex items-center justify-between">
          
          {/* Mobile Menu Toggle */}
          <button 
             className="md:hidden text-white/80 hover:text-white transition-colors"
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             aria-label="Menu"
          >
             {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 opacity-95 hover:opacity-100 transition-opacity">
            <img src="/logo-tonasa.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-[16px] tracking-wide">Arsip Tonasa</span>
          </Link>

          {/* Desktop Nav (Perfectly Centered) */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
             <Link href="/" className="text-[12px] opacity-80 hover:opacity-100 transition-opacity tracking-wide">Beranda</Link>
             <Link href={getProsedurHref()} className="text-[12px] opacity-80 hover:opacity-100 transition-opacity tracking-wide">Prosedur</Link>
          </nav>

          {/* Login Button */}
          <div className="flex items-center">
             <Link 
               href="/login" 
               className="flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors"
             >
               <User size={14} />
               <span className="hidden sm:inline">Login</span>
             </Link>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
         <div className="md:hidden fixed top-[60px] left-0 right-0 bg-[#1d1d1f] border-t border-white/10 z-40 px-6 py-6 flex flex-col gap-6 shadow-2xl h-[calc(100vh-60px)] animate-in slide-in-from-top-2 duration-300">
            <Link 
               href="/" 
               onClick={() => setIsMobileMenuOpen(false)} 
               className="text-white/90 text-2xl font-semibold border-b border-white/10 pb-4"
            >
               Beranda
            </Link>
            <Link 
               href={getProsedurHref()} 
               onClick={() => setIsMobileMenuOpen(false)} 
               className="text-white/90 text-2xl font-semibold border-b border-white/10 pb-4"
            >
               Prosedur
            </Link>
            <Link 
               href="/login" 
               onClick={() => setIsMobileMenuOpen(false)} 
               className="text-white/90 text-2xl font-semibold border-b border-white/10 pb-4 flex items-center gap-2"
            >
               <User size={24} />
               Login
            </Link>
         </div>
      )}
    </>
  );
}
