import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { subscription, userEmail } = await request.json();

    if (!subscription || !userEmail) {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    
    // Simpan ke Supabase
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_email: userEmail,
        endpoint: endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      }, { onConflict: 'endpoint' })
      .select();

    if (error) {
      console.error('Error saving subscription:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Subscription saved' }, { status: 201 });
  } catch (error) {
    console.error('Error in subscribe route:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
