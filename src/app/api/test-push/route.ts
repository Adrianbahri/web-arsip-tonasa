import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import webpush from 'web-push';

let isVapidInitialized = false;

function initVapid() {
  if (isVapidInitialized) return true;
  
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  
  if (!publicKey || !privateKey) {
    return false;
  }
  
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@arsiptonasa.my.id',
      publicKey,
      privateKey
    );
    isVapidInitialized = true;
    return true;
  } catch (err) {
    console.error('Failed to set VAPID details:', err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!initVapid()) {
      console.error('VAPID keys are not configured');
      return NextResponse.json({ success: false, error: 'Push notification credentials are not configured on the server.' }, { status: 500 });
    }

    const body = await request.json();
    const title = body.record?.title || body.title || 'Notifikasi Baru';
    const message = body.record?.message || body.message || 'Pesan percobaan';

    // Ambil semua subscription dari database
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscriptions found' });
    }

    const payload = JSON.stringify({
      title: title || 'Notifikasi Baru',
      message: message || 'Pesan percobaan',
      url: '/dashboard'
    });

    const sendPromises = subscriptions.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh
        }
      };
      
      return webpush.sendNotification(pushSubscription, payload).catch((e) => {
        if (e.statusCode === 404 || e.statusCode === 410) {
          console.log('Subscription has expired or is no longer valid: ', e);
          // Hapus dari database jika expired
          return supabase.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          console.error('Error sending push message:', e);
        }
      });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, message: 'Notifications sent' });
  } catch (error) {
    console.error('Error in test-push route:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
