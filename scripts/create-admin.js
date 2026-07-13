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

      const email = "admin@sementonasa.co.id";
      const password = "AdminTonasa2026!";
      const name = "Admin Utama";
      const role = "pic_gedung";

      console.log("========================================");
      console.log("Pendaftaran Akun Admin Utama Supabase");
      console.log("========================================");
      console.log(`Menghubungkan ke: ${supabaseUrl}`);
      console.log(`Mendaftarkan email: ${email}`);

      const { data, error } = await supabase.auth.signUp({
         email,
         password,
         options: {
            data: {
               name,
               role,
               approved: true
            }
         }
      });

      console.log("\nData response:", JSON.stringify(data, null, 2));

      if (error) {
         console.error("\n❌ GAGAL membuat user admin:");
         console.error("Message:", error.message);
         console.error("Status:", error.status);
         console.error("Full error:", JSON.stringify(error, null, 2));
         process.exit(1);
      }

      console.log("\n----------------------------------------");
      console.log("✅ SUKSES: Akun Admin Utama Berhasil Dibuat!");
      console.log("----------------------------------------");
      console.log(`Email    : ${email}`);
      console.log(`Password : ${password}`);
      console.log(`Role     : PIC Gedung (pic_gedung)`);
      console.log(`Status   : Approved (Aktif otomatis)`);
      console.log("----------------------------------------");
      console.log("Catatan: Anda sekarang dapat langsung login menggunakan akun ini.");
      console.log("Admin Utama ini dapat menyetujui (ACC) user lain yang mendaftar.");
      console.log("----------------------------------------");

   } catch (err) {
      console.error("\n❌ Terjadi kesalahan sistem:", err.message);
   }
}

main();
