import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET method: Untuk menarik data (bisa digunakan frontend atau ESP untuk cek data terakhir)
export async function GET() {
  try {
    // Mengambil 100 data monitoring terakhir dari database
    const { data, error } = await supabase
      .from('sensor_monitoring')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      // Jika tabel belum ada, kembalikan array kosong (bukan error 500)
      console.warn('Sensor monitoring query warning:', error.message);
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

// POST method: Untuk ESP mengirim (push) data suhu dan kelembaban ke server
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { suhu, kelembaban, keterangan } = body;

    if (suhu === undefined || kelembaban === undefined) {
      return NextResponse.json(
        { success: false, message: 'Data suhu dan kelembaban harus diisi' },
        { status: 400 }
      );
    }

    // Simpan data ke tabel sensor_monitoring di Supabase
    const { data, error } = await supabase
      .from('sensor_monitoring')
      .insert([
        { 
          suhu: parseFloat(suhu), 
          kelembaban: parseFloat(kelembaban), 
          keterangan: keterangan || 'Data dari ESP'
        }
      ])
      .select();

    if (error) {
      console.error('Error inserting sensor data:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Data monitoring berhasil disimpan', data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in monitoring POST route:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error atau format JSON tidak valid' }, { status: 500 });
  }
}
