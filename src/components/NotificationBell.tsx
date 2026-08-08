"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Archive, Calendar, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useRole } from "./RoleContext";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  reference_id: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const { role } = useRole();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Only show for pic_gedung and superadmin
  const isAuthorized = role === "pic_gedung" || role === "superadmin";

  const fetchNotifications = async () => {
    if (!isAuthorized) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotifications(data);
      }
    } catch (e) {
      console.warn("Failed to fetch notifications:", e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isAuthorized) return;

    fetchNotifications();

    // Polling setiap 30 detik sebagai pengganti realtime subscription
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [role, isAuthorized]);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true);
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          registration.pushManager.getSubscription().then(async subscription => {
            if (subscription) {
              // Resync ke server bila tombol pernah tersimpan di browser
              // tapi baris di database hilang (mis. gagal saat tabel belum ada).
              const email = role === 'superadmin' ? 'superadmin@arsiptonasa.my.id' : 'admin@arsiptonasa.my.id';
              try {
                const res = await fetch('/api/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ subscription, userEmail: email }),
                });
                setIsSubscribed(res.ok);
              } catch {
                setIsSubscribed(false);
              }
            } else {
              setIsSubscribed(false);
            }
          });
        })
        .catch(err => console.error('Service Worker registration failed:', err));
    }
  }, [role]);

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator)) return;
    
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
         alert('Izin notifikasi ditolak oleh browser.');
         return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
         console.error('VAPID public key not set');
         return;
      }
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Simpan ke server
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userEmail: role === 'superadmin' ? 'superadmin@arsiptonasa.my.id' : 'admin@arsiptonasa.my.id'
        }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        alert('Berhasil berlangganan push notification!');
      } else {
        alert('Gagal berlangganan push notification.');
      }
    } catch (err) {
      console.error('Failed to subscribe:', err);
      alert('Gagal berlangganan. Pastikan Anda mengizinkan notifikasi di browser.');
    }
  };

  const testPush = async () => {
     try {
        const res = await fetch('/api/test-push', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
              title: 'Tes Notifikasi Web Arsip',
              message: 'Push notification berhasil bekerja!'
           })
        });
        const data = await res.json();
        if (data.success === false) {
           alert('Gagal mengirim: ' + (data.error || data.message || 'unknown'));
        } else {
           alert(data.message || 'Notifikasi tes terkirim.');
        }
     } catch (err) {
        console.error('Failed to send test push:', err);
        alert('Gagal mengirim test push. Periksa jaringan / VAPID keys.');
     }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    const { error } = await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) {
      setNotifications([]);
    }
  };

  if (!isAuthorized) return null;

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-1.5 transition-colors rounded-xs ${
          isOpen ? "text-primary bg-primary-soft/10" : "text-ink-mute hover:text-primary"
        }`}
        title="Notifikasi"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-3.5 h-3.5 text-[8px] font-bold text-white bg-red-500 rounded-full border border-canvas transform translate-x-1/4 -translate-y-1/4">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full md:bottom-auto md:top-full mb-2 md:mb-0 md:mt-2 w-80 sm:w-96 bg-canvas border border-hairline shadow-lg rounded-md overflow-hidden z-50">
          <div className="flex items-center justify-between p-3 border-b border-hairline bg-canvas-soft">
            <div className="flex flex-col gap-1">
               <h3 className="font-semibold text-sm text-ink">Notifikasi</h3>
               {isPushSupported && !isSubscribed && (
                  <button onClick={subscribeToPush} className="text-[10px] text-left text-primary hover:underline font-medium">
                     + Aktifkan Push Notif Desktop
                  </button>
               )}
               {isSubscribed && (
                  <button onClick={testPush} className="text-[10px] text-left text-emerald-600 hover:underline font-medium">
                     Tes Notifikasi
                  </button>
               )}
            </div>
            {notifications.length > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary hover:text-primary-deep font-medium"
              >
                Bersihkan Semua
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto hide-scrollbar">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-ink-mute">Memuat notifikasi...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-ink-mute">
                <Bell className="mb-2 text-hairline-strong" size={32} />
                <p className="text-sm">Tidak ada notifikasi baru</p>
              </div>
            ) : (
              <div className="divide-y divide-hairline">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-canvas-soft transition-colors flex gap-3 relative group">
                    <div className="flex-shrink-0 mt-1">
                      {notif.type === 'archive_submission' ? (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Archive size={16} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-accent-indigo/10 flex items-center justify-center text-accent-indigo">
                          <Calendar size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pr-6">
                      <p className="text-sm font-medium text-ink leading-tight mb-1">{notif.title}</p>
                      <p className="text-xs text-ink-mute leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-ink-mute-2 mt-2">
                        {new Date(notif.created_at).toLocaleString('id-ID', {
                           day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteNotification(notif.id, e)}
                      className="absolute right-3 top-3 p-1.5 text-ink-faint hover:text-red-500 bg-canvas rounded-full opacity-0 group-hover:opacity-100 transition-all border border-hairline shadow-sm"
                      title="Hapus notifikasi"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
