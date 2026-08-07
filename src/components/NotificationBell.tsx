"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Archive, Calendar, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useRole } from "./RoleContext";

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
            <h3 className="font-semibold text-sm text-ink">Notifikasi</h3>
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
