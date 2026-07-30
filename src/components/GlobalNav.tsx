"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Menu, X, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export default function GlobalNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // If we are on the landing page and click a hash link, it should scroll.
  // Otherwise, if we are on /lokasi/[id], clicking Prosedur should go to /#prosedur
  const getProsedurHref = () => {
    return pathname === "/" ? "#prosedur" : "/#prosedur";
  };

  return (
    <>
      <header className="bg-canvas/90 backdrop-blur-md border-b border-hairline text-ink h-[60px] flex items-center sticky top-0 z-50 transition-colors">
        <div className="w-full max-w-[1024px] mx-auto px-4 flex items-center justify-between">
          
          {/* Mobile Menu Toggle */}
          <button 
             className="md:hidden opacity-80 hover:opacity-100 transition-opacity"
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

          {/* Actions */}
          <div className="flex items-center gap-4">
             {mounted && (
               <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center p-1 rounded-full"
                  aria-label="Toggle Theme"
               >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
               </button>
             )}

             <Link 
               href="/login" 
               className="flex items-center gap-1.5 text-xs font-medium opacity-80 hover:opacity-100 transition-opacity"
             >
               <User size={14} />
               <span className="hidden sm:inline">Login</span>
             </Link>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
         <div className="md:hidden fixed top-[60px] left-0 right-0 bg-canvas border-t border-hairline z-40 px-6 py-6 flex flex-col gap-6 shadow-2xl h-[calc(100vh-60px)] animate-in slide-in-from-top-2 duration-300">
            <Link 
               href="/" 
               onClick={() => setIsMobileMenuOpen(false)} 
               className="text-ink/90 text-2xl font-semibold border-b border-hairline pb-4"
            >
               Beranda
            </Link>
            <Link 
               href={getProsedurHref()} 
               onClick={() => setIsMobileMenuOpen(false)} 
               className="text-ink/90 text-2xl font-semibold border-b border-hairline pb-4"
            >
               Prosedur
            </Link>
            <Link 
               href="/login" 
               onClick={() => setIsMobileMenuOpen(false)} 
               className="text-ink/90 text-2xl font-semibold border-b border-hairline pb-4 flex items-center gap-2"
            >
               <User size={24} />
               Login
            </Link>
         </div>
      )}
    </>
  );
}
