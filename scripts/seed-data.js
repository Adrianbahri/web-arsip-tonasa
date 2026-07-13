const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
   try {
      const envPath = path.join(__dirname, '../.env.local');
      if (!fs.existsSync(envPath)) {
         console.error("Error: File .env.local tidak ditemukan!");
         process.exit(1);
      }

      const envContent = fs.readFileSync(envPath, 'utf8');
      const getEnvVar = (name) => {
         const match = envContent.match(new RegExp(`${name}=(.*)`));
         return match ? match[1].trim() : null;
      };

      const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
      const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

      if (!supabaseUrl || !supabaseAnonKey) {
         console.error("Error: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan di .env.local");
         process.exit(1);
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Dummy archives data
      const dummyArchives = [
         {
            kode_klasifikasi: "PL.01.01.04",
            jenis_berkas: "MATERIAL DAN PERALATAN PABRIK",
            judul_berkas: "PENGADAAN DALAM NEGRI ( OP )",
            departemen: "PERLENGKAPAN",
            tahun: "2018",
            tanggal_terima: "2018-03-01",
            jangka_waktu: "5 tahun",
            gedung: "A",
            lorong: "20",
            rak: "RAK F BARIS 2",
            status: "Aktif",
            link_berkas: "https://drive.google.com/file/d/1_demo_perlengkapan/view"
         },
         {
            kode_klasifikasi: "PR (PAYMENT REGISTER)",
            jenis_berkas: "BUKTI-BUKTI / DOKUMEN TRANSAKSI",
            judul_berkas: "EXISTING (332)",
            departemen: "KEUANGAN",
            tahun: "2018",
            tanggal_terima: "2018-04-23",
            jangka_waktu: "2th lpr disyahkan RKAP",
            gedung: "A",
            lorong: "22",
            rak: "RAK G BARIS 1",
            status: "Aktif",
            link_berkas: "https://drive.google.com/file/d/1_demo_keuangan332/view"
         },
         {
            kode_klasifikasi: "PR (PAYMENT REGISTER)",
            jenis_berkas: "BUKTI-BUKTI / DOKUMEN TRANSAKSI",
            judul_berkas: "EXISTING (333)",
            departemen: "KEUANGAN",
            tahun: "2018",
            tanggal_terima: "2018-04-23",
            jangka_waktu: "2th lpr disyahkan RKAP",
            gedung: "A",
            lorong: "22",
            rak: "RAK G BARIS 1",
            status: "Aktif",
            link_berkas: "https://drive.google.com/file/d/1_demo_keuangan333/view"
         },
         {
            kode_klasifikasi: "PR (PAYMENT REGISTER)",
            jenis_berkas: "BUKTI-BUKTI / DOKUMEN TRANSAKSI",
            judul_berkas: "EXISTING (334)",
            departemen: "KEUANGAN",
            tahun: "2018",
            tanggal_terima: "2018-04-23",
            jangka_waktu: "2th lpr disyahkan RKAP",
            gedung: "A",
            lorong: "22",
            rak: "RAK G BARIS 1",
            status: "Inaktif",
            link_berkas: "https://drive.google.com/file/d/1_demo_keuangan334/view"
         },
         {
            kode_klasifikasi: "PR (PAYMENT REGISTER)",
            jenis_berkas: "BUKTI-BUKTI / DOKUMEN TRANSAKSI",
            judul_berkas: "EXISTING (335)",
            departemen: "KEUANGAN",
            tahun: "2018",
            tanggal_terima: "2018-04-23",
            jangka_waktu: "2th lpr disyahkan RKAP",
            gedung: "A",
            lorong: "22",
            rak: "RAK G BARIS 1",
            status: "Inaktif",
            link_berkas: "https://drive.google.com/file/d/1_demo_keuangan335/view"
         },
         {
            kode_klasifikasi: "PR (PAYMENT REGISTER)",
            jenis_berkas: "BUKTI-BUKTI / DOKUMEN TRANSAKSI",
            judul_berkas: "EXISTING (336)",
            departemen: "KEUANGAN",
            tahun: "2018",
            tanggal_terima: "2018-04-23",
            jangka_waktu: "2th lpr disyahkan RKAP",
            gedung: "A",
            lorong: "22",
            rak: "RAK G BARIS 1",
            status: "Permanen",
            link_berkas: "https://drive.google.com/file/d/1_demo_keuangan336/view"
         },
         {
            kode_klasifikasi: "PR (PAYMENT REGISTER)",
            jenis_berkas: "BUKTI-BUKTI / DOKUMEN TRANSAKSI",
            judul_berkas: "EXISTING (337)",
            departemen: "KEUANGAN",
            tahun: "2018",
            tanggal_terima: "2018-04-23",
            jangka_waktu: "2th lpr disyahkan RKAP",
            gedung: "A",
            lorong: "22",
            rak: "RAK G BARIS 1",
            status: "Dinilai Kembali",
            link_berkas: "https://drive.google.com/file/d/1_demo_keuangan337/view"
         },
         {
            kode_klasifikasi: "PL.02.04.11",
            jenis_berkas: "SOP OPERASIONAL SHIFT",
            judul_berkas: "SOP KARYAWAN SHIFT PABRIK UNIT 4",
            departemen: "HRD",
            tahun: "2026",
            tanggal_terima: "2026-07-10",
            jangka_waktu: "3 tahun",
            gedung: "",
            lorong: "",
            rak: "",
            status: "Menunggu ACC",
            link_berkas: "https://drive.google.com/file/d/1_demo_hrd08/view"
         },
         {
            kode_klasifikasi: "LGL.01.12.01",
            jenis_berkas: "PENGESAHAN DOKUMEN LAHAN",
            judul_berkas: "PENGESAHAN LAHAN BARU TONASA B",
            departemen: "LEGAL",
            tahun: "2026",
            tanggal_terima: "2026-07-11",
            jangka_waktu: "10 tahun",
            gedung: "",
            lorong: "",
            rak: "",
            status: "Menunggu ACC",
            link_berkas: "https://drive.google.com/file/d/1_demo_legal09/view"
         }
      ];

      console.log("========================================");
      console.log("Seeding Dummy Data Berkas ke Supabase...");
      console.log("========================================");

      // Clean existing archives to avoid duplication if running multiple times (optional, but let's just insert them)
      const { data, error } = await supabase
         .from('archives')
         .insert(dummyArchives)
         .select();

      if (error) {
         console.error("\n❌ GAGAL memasukkan data dummy:", error.message);
         process.exit(1);
      }

      console.log(`\n✅ SUKSES: Berhasil memasukkan ${data.length} baris berkas dummy ke Supabase!`);
      console.log("----------------------------------------");

   } catch (err) {
      console.error("\n❌ Terjadi kesalahan sistem:", err.message);
   }
}

main();
