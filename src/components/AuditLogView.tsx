"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Clock, History, AlertCircle } from "lucide-react";

export default function AuditLogView() {
   const [logs, setLogs] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchLogs();
   }, []);

   const fetchLogs = async () => {
      setLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
         .from('audit_logs')
         .select('*')
         .gte('created_at', thirtyDaysAgo.toISOString())
         .order('created_at', { ascending: false })
         .limit(100); // Batasi 100 log terakhir

      if (data) setLogs(data);
      if (error) console.error("Error fetching logs:", error);
      setLoading(false);
   };

   return (
      <div className="space-y-6 w-full pb-10">
         <div className="flex flex-col gap-2">
            <h2 className="text-[24px] font-medium tracking-tight text-ink flex items-center gap-2">
               <History size={24} className="text-primary" /> Riwayat Aktivitas (Audit Trail)
            </h2>
            <p className="text-ink-mute text-[13px]">
               Log rekam jejak aktivitas pengguna di dalam sistem untuk menjaga transparansi dan akuntabilitas.
            </p>
         </div>

         <div className="bg-canvas border border-hairline rounded-sm overflow-hidden shadow-xs">
            {loading ? (
               <div className="p-8 text-center text-ink-mute text-[13px] flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Memuat log aktivitas...
               </div>
            ) : logs.length === 0 ? (
               <div className="p-12 text-center flex flex-col items-center">
                  <AlertCircle size={40} className="text-ink-mute-2 mb-4" />
                  <p className="text-[14px] text-ink-mute font-medium">Belum ada riwayat aktivitas tercatat</p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px] border-collapse min-w-[700px]">
                     <thead>
                        <tr className="bg-canvas-soft border-b border-hairline text-ink">
                           <th className="p-4 font-semibold w-48">Waktu (WITA)</th>
                           <th className="p-4 font-semibold w-48">Pengguna</th>
                           <th className="p-4 font-semibold w-48">Aksi</th>
                           <th className="p-4 font-semibold">Detail</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-hairline">
                        {logs.map((log) => {
                           // Simple formatting for local time
                           const dateObj = new Date(log.created_at);
                           const formattedDate = dateObj.toLocaleDateString('id-ID', {
                              day: '2-digit', month: 'short', year: 'numeric'
                           });
                           const formattedTime = dateObj.toLocaleTimeString('id-ID', {
                              hour: '2-digit', minute: '2-digit'
                           });

                           return (
                              <tr key={log.id} className="hover:bg-canvas-soft/50 transition-colors text-ink">
                                 <td className="p-4 text-ink-mute flex items-center gap-2 whitespace-nowrap">
                                    <Clock size={14} /> {formattedDate} {formattedTime}
                                 </td>
                                 <td className="p-4 font-medium">{log.user_name}</td>
                                 <td className="p-4">
                                    <span className="bg-primary-light/10 text-primary px-2.5 py-1 rounded-sm text-[11px] font-bold tracking-wide uppercase">
                                       {log.action.replace('_', ' ')}
                                    </span>
                                 </td>
                                 <td className="p-4">{log.details}</td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            )}
         </div>
      </div>
   );
}
