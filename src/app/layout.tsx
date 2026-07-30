import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/components/RoleContext";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web Arsip Tonasa",
  description: "Sistem Informasi Manajemen Arsip Korporasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} antialiased h-full`} suppressHydrationWarning>
      <body className="h-full bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <RoleProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
