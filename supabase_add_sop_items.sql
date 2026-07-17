ALTER TABLE public.landing_page_config 
ADD COLUMN IF NOT EXISTS sop_items jsonb DEFAULT '[
  { "title": "Pemilahan & Retensi", "desc": "Departemen melakukan verifikasi masa retensi dokumen. Arsip yang sudah memasuki masa *Inaktif* dipisahkan dari arsip aktif harian." },
  { "title": "Registrasi & Upload Link", "desc": "Admin Departemen menginput metadata berkas ke sistem ini dan menyertakan URL link file scan digital (Google Drive/Sharepoint)." },
  { "title": "Verifikasi & ACC PIC", "desc": "PIC Gedung memeriksa kelayakan dokumen di menu Persetujuan. Fisik berkas diserahkan ke gedung arsip untuk divalidasi." },
  { "title": "Penataan Rak Fisik", "desc": "PIC menempatkan berkas fisik di lokasi rak/lorong spesifik sesuai peta zonasi dan mengkonfirmasi status berkas menjadi Aktif." }
]'::jsonb;
