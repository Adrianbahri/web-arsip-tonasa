"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Building, MapPin, Grid, Settings, LayoutTemplate, Save, Clock, QrCode, X, Download } from "lucide-react";
import QRCode from "react-qr-code";

export default function SettingsView() {
   const [activeTab, setActiveTab] = useState<"master" | "landing" | "retensi" | "digital_mapping">("master");
   
   // Master Data State
   const [departments, setDepartments] = useState<any[]>([]);
   const [locations, setLocations] = useState<any[]>([]);
   const [retensiRules, setRetensiRules] = useState<any[]>([]);
   const [jenisBerkasList, setJenisBerkasList] = useState<string[]>([]);
   const [newDept, setNewDept] = useState("");
   const [newLoc, setNewLoc] = useState({ gedung: "A", lorong: "", rak: "" });
   
   // State for unique gedung from archives
   const [archiveGedungList, setArchiveGedungList] = useState<string[]>([]);
   const [newRetensi, setNewRetensi] = useState({ kategori: "", masa_aktif_tahun: 5, masa_inaktif_tahun: 5 });
   
   // Landing Page State
   const [landingConfig, setLandingConfig] = useState<any>(null);
   const [savingLanding, setSavingLanding] = useState(false);

   // Digital Mapping State
   const [digitalMappings, setDigitalMappings] = useState<any[]>([]);
   const [newMapping, setNewMapping] = useState({ gedung: "", deskripsi: "", map_url: "" });
   const [editingMappingId, setEditingMappingId] = useState<string | null>(null);
   const [qrModal, setQrModal] = useState<any>(null);

   const [loading, setLoading] = useState(true);
   const [message, setMessage] = useState("");

   const downloadQRCode = () => {
      const svg = document.getElementById("qr-code-svg");
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
         canvas.width = img.width;
         canvas.height = img.height;
         if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `QR_${qrModal?.gedung || 'Lokasi'}.png`;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
         }
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
   };

   useEffect(() => {
      fetchMasterData();
   }, []);

   const fetchMasterData = async () => {
      setLoading(true);
      const [deptRes, locRes, retensiRes, landingRes, archivesRes, mappingRes] = await Promise.all([
         supabase.from('master_departments').select('*').order('name'),
         supabase.from('master_locations').select('*').order('gedung').order('lorong').order('rak'),
         supabase.from('master_retensi').select('*').order('kategori'),
         supabase.from('landing_page_config').select('*').eq('id', 'homepage').single(),
         supabase.from('archives').select('jenis_berkas, gedung'),
         supabase.from('master_digital_mapping').select('*').order('created_at', { ascending: false })
      ]);
      
      if (deptRes.data) setDepartments(deptRes.data);
      if (locRes.data) setLocations(locRes.data);
      if (retensiRes.data) setRetensiRules(retensiRes.data);
      if (mappingRes.data) setDigitalMappings(mappingRes.data);
      if (archivesRes.data) {
         const uniqueJenis = Array.from(new Set(archivesRes.data.map((a: any) => a.jenis_berkas).filter(Boolean))) as string[];
         setJenisBerkasList(uniqueJenis.sort());
         
         const uniqueGedung = Array.from(new Set(archivesRes.data.map((a: any) => a.gedung).filter(Boolean))) as string[];
         setArchiveGedungList(uniqueGedung);
      }
      if (landingRes.data) {
         setLandingConfig(landingRes.data);
         if (!landingRes.data.sop_items) {
            setLandingConfig((prev: any) => ({ ...prev, sop_items: [] }));
         }
      } else {
         setLandingConfig({
            hero_title: '', hero_subtitle: '', hero_image_url: '',
            sambutan_title: '', sambutan_text: '', sambutan_photo_url: '',
            sop_title: '', sop_text: '', sop_items: [],
            pic_title: '', pic_text: '', pic_photo_url: '', pic_whatsapp: '', pic_email: ''
         });
      }
      setLoading(false);
   };

   // ================== MASTER DATA LOGIC ==================
   const addRetensi = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newRetensi.kategori.trim()) return;

      const isDuplicate = retensiRules.some(r => r.kategori.toLowerCase() === newRetensi.kategori.trim().toLowerCase());
      if (isDuplicate) {
         setMessage("Gagal menambah: Jenis berkas ini sudah ada di Jadwal Retensi!");
         setTimeout(() => setMessage(""), 3000);
         return;
      }

      const { error } = await supabase.from('master_retensi').insert([newRetensi]);
      if (error) setMessage("Gagal menambah jadwal retensi: " + error.message);
      else { setMessage("Berhasil menambah jadwal retensi!"); setNewRetensi({ kategori: "", masa_aktif_tahun: 5, masa_inaktif_tahun: 5 }); fetchMasterData(); }
      setTimeout(() => setMessage(""), 3000);
   };

   const deleteRetensi = async (id: string) => {
      if (!confirm("Hapus jadwal retensi ini?")) return;
      const { error } = await supabase.from('master_retensi').delete().eq('id', id);
      if (error) setMessage("Gagal menghapus: " + error.message);
      else { setMessage("Jadwal retensi dihapus."); fetchMasterData(); }
      setTimeout(() => setMessage(""), 3000);
   };

   const addDepartment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newDept.trim()) return;
      const { error } = await supabase.from('master_departments').insert([{ name: newDept.toUpperCase() }]);
      if (error) setMessage("Gagal menambah departemen: " + error.message);
      else { setMessage("Berhasil menambah departemen!"); setNewDept(""); fetchMasterData(); }
      setTimeout(() => setMessage(""), 3000);
   };

   const deleteDepartment = async (id: string) => {
      if (!confirm("Hapus departemen ini?")) return;
      const { error } = await supabase.from('master_departments').delete().eq('id', id);
      if (error) setMessage("Gagal menghapus: " + error.message);
      else { setMessage("Departemen dihapus."); fetchMasterData(); }
      setTimeout(() => setMessage(""), 3000);
   };

   const addLocation = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newLoc.gedung || !newLoc.lorong || !newLoc.rak) return;
      const { error } = await supabase.from('master_locations').insert([newLoc]);
      if (error) setMessage("Gagal menambah lokasi: " + error.message);
      else { setMessage("Berhasil menambah lokasi rak!"); setNewLoc({ gedung: "A", lorong: "", rak: "" }); fetchMasterData(); }
      setTimeout(() => setMessage(""), 3000);
   };

   const deleteLocation = async (id: string) => {
      if (!confirm("Hapus lokasi rak ini?")) return;
      const { error } = await supabase.from('master_locations').delete().eq('id', id);
      if (error) setMessage("Gagal menghapus: " + error.message);
      else { setMessage("Lokasi dihapus."); fetchMasterData(); }
      setTimeout(() => setMessage(""), 3000);
   };

   // ================== DIGITAL MAPPING LOGIC ==================
   const addOrUpdateMapping = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMapping.gedung.trim() || !newMapping.deskripsi.trim()) return;
      
      let error;
      if (editingMappingId) {
         const { error: updateError } = await supabase.from('master_digital_mapping')
            .update({ 
               gedung: newMapping.gedung, 
               deskripsi: newMapping.deskripsi,
               map_url: newMapping.map_url
            })
            .eq('id', editingMappingId);
         error = updateError;
      } else {
         const { error: insertError } = await supabase.from('master_digital_mapping').insert([{ 
            gedung: newMapping.gedung, 
            deskripsi: newMapping.deskripsi,
            map_url: newMapping.map_url
         }]);
         error = insertError;
      }
      
      if (error) {
         setMessage(`Gagal ${editingMappingId ? 'mengubah' : 'menambah'} mapping: ` + error.message);
      } else { 
         setMessage(`Berhasil ${editingMappingId ? 'mengubah' : 'menambah'} mapping!`); 
         setNewMapping({ gedung: "", deskripsi: "", map_url: "" }); 
         setEditingMappingId(null);
         fetchMasterData(); 
      }
      setTimeout(() => setMessage(""), 3000);
   };

   const startEditMapping = (m: any) => {
      setNewMapping({ gedung: m.gedung, deskripsi: m.deskripsi, map_url: m.map_url || "" });
      setEditingMappingId(m.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const cancelEditMapping = () => {
      setNewMapping({ gedung: "", deskripsi: "", map_url: "" });
      setEditingMappingId(null);
   };

   const deleteMapping = async (id: string) => {
      if (!confirm("Hapus mapping ini?")) return;
      const { error } = await supabase.from('master_digital_mapping').delete().eq('id', id);
      if (error) setMessage("Gagal menghapus: " + error.message);
      else { setMessage("Mapping dihapus."); fetchMasterData(); }
      setTimeout(() => setMessage(""), 3000);
   };

   // ================== LANDING PAGE LOGIC ==================
   const saveLandingConfig = async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingLanding(true);
      const { error } = await supabase.from('landing_page_config').update(landingConfig).eq('id', 'homepage');
      if (error) setMessage("Gagal menyimpan tampilan: " + error.message);
      else setMessage("Tampilan Website Berhasil Disimpan!");
      setSavingLanding(false);
      setTimeout(() => setMessage(""), 3000);
   };

   const handleLandingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setLandingConfig((prev: any) => ({ ...prev, [name]: value }));
   };

   return (
      <div className="space-y-6 pb-10 w-full">
         <div className="flex flex-col gap-2 mb-2">
            <h2 className="text-[24px] font-medium tracking-tight text-ink flex items-center gap-2">
               <Settings size={24} className="text-primary" /> Pengaturan Sistem
            </h2>
            <p className="text-ink-mute text-[13px]">
               Kelola data master dan sesuaikan tampilan landing page secara terpusat.
            </p>
         </div>

         {/* Tabs Selector */}
         <div className="flex gap-6 border-b border-hairline mb-6 overflow-x-auto hide-scrollbar">
            <button 
               onClick={() => setActiveTab("master")}
               className={`py-2 text-[14px] font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "master" ? "border-primary text-primary" : "border-transparent text-ink-mute hover:text-ink"
               }`}
            >
               <Grid size={16} /> Data Master
            </button>
            <button 
               onClick={() => setActiveTab("retensi")}
               className={`py-2 text-[14px] font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "retensi" ? "border-primary text-primary" : "border-transparent text-ink-mute hover:text-ink"
               }`}
            >
               <Clock size={16} /> Jadwal Retensi (JRA)
            </button>
            <button 
               onClick={() => setActiveTab("landing")}
               className={`py-2 text-[14px] font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "landing" ? "border-primary text-primary" : "border-transparent text-ink-mute hover:text-ink"
               }`}
            >
               <LayoutTemplate size={16} /> Tampilan Website
            </button>
            <button 
               onClick={() => setActiveTab("digital_mapping")}
               className={`py-2 text-[14px] font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "digital_mapping" ? "border-primary text-primary" : "border-transparent text-ink-mute hover:text-ink"
               }`}
            >
               <MapPin size={16} /> Digital Mapping
            </button>
         </div>

         {message && (
            <div className="bg-primary-light/10 border border-primary text-primary px-4 py-2 rounded-sm text-[13px] font-medium">
               {message}
            </div>
         )}

         {loading && <div className="text-[13px] text-ink-mute text-center py-10">Memuat data...</div>}

         {!loading && activeTab === "master" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* MASTER DEPARTEMEN */}
               <div className="bg-canvas border border-hairline rounded-sm p-5 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-hairline pb-3 mb-4">
                     <Building size={16} className="text-ink" />
                     <h3 className="font-semibold text-[14px]">Master Departemen</h3>
                  </div>
                  
                  <form onSubmit={addDepartment} className="flex gap-2 mb-5">
                     <input 
                        type="text" 
                        placeholder="Tambah Departemen..." 
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                        className="flex-1 bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-1.5 focus:outline-none focus:border-ink uppercase"
                     />
                     <button type="submit" className="bg-primary text-white px-3 py-1.5 rounded-sm hover:bg-primary-deep flex items-center justify-center shrink-0">
                        <Plus size={16} />
                     </button>
                  </form>

                  <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                     {departments.map((d) => (
                        <li key={d.id} className="flex justify-between items-center bg-canvas-soft border border-hairline p-2 rounded-xs text-[13px]">
                           <span className="font-medium text-ink">{d.name}</span>
                           <button onClick={() => deleteDepartment(d.id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 bg-canvas hover:bg-red-50 dark:hover:bg-red-500/10 border border-hairline rounded-xs transition-colors">
                              <Trash2 size={14} />
                           </button>
                        </li>
                     ))}
                     {departments.length === 0 && <div className="text-[12px] text-ink-mute text-center">Belum ada data</div>}
                  </ul>
               </div>

               {/* MASTER LOKASI */}
               <div className="bg-canvas border border-hairline rounded-sm p-5 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-hairline pb-3 mb-4">
                     <MapPin size={16} className="text-ink" />
                     <h3 className="font-semibold text-[14px]">Struktur Lokasi Rak</h3>
                  </div>
                  
                  <form onSubmit={addLocation} className="flex flex-col gap-2 mb-5">
                     <div className="flex gap-2">
                        <select 
                           value={newLoc.gedung}
                           onChange={(e) => setNewLoc({...newLoc, gedung: e.target.value})}
                           className="w-1/3 bg-canvas border border-hairline text-[13px] rounded-xs px-2 py-1.5 focus:outline-none focus:border-ink"
                        >
                           <option value="A">Gedung A</option>
                           <option value="B">Gedung B</option>
                           <option value="C">Gedung C</option>
                           <option value="D">Gedung D</option>
                           <option value="E">Gedung E</option>
                        </select>
                        <input 
                           type="text" 
                           placeholder="Lorong (Contoh: L1)" 
                           value={newLoc.lorong}
                           onChange={(e) => setNewLoc({...newLoc, lorong: e.target.value})}
                           className="w-1/3 bg-canvas border border-hairline text-[13px] rounded-xs px-2 py-1.5 focus:outline-none focus:border-ink"
                        />
                        <input 
                           type="text" 
                           placeholder="Rak (Contoh: R1)" 
                           value={newLoc.rak}
                           onChange={(e) => setNewLoc({...newLoc, rak: e.target.value})}
                           className="w-1/3 bg-canvas border border-hairline text-[13px] rounded-xs px-2 py-1.5 focus:outline-none focus:border-ink"
                        />
                     </div>
                     <button type="submit" className="w-full bg-primary text-white px-3 py-1.5 rounded-sm hover:bg-primary-deep flex items-center justify-center gap-2 text-[13px]">
                        <Plus size={16} /> Tambah Lokasi Rak
                     </button>
                  </form>

                  <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                     {locations.map((l) => (
                        <li key={l.id} className="flex justify-between items-center bg-canvas-soft border border-hairline p-2 rounded-xs text-[13px]">
                           <span className="font-medium text-ink">Gedung {l.gedung} - {l.lorong} - {l.rak}</span>
                           <button onClick={() => deleteLocation(l.id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 bg-canvas hover:bg-red-50 dark:hover:bg-red-500/10 border border-hairline rounded-xs transition-colors">
                              <Trash2 size={14} />
                           </button>
                        </li>
                     ))}
                     {locations.length === 0 && <div className="text-[12px] text-ink-mute text-center">Belum ada data</div>}
                  </ul>
               </div>
            </div>
         )}

         {!loading && activeTab === "digital_mapping" && (
            <div className="bg-canvas border border-hairline rounded-sm p-6 shadow-xs w-full">
               <div className="flex items-center gap-2 border-b border-hairline pb-3 mb-5">
                  <MapPin size={18} className="text-primary" />
                  <div>
                     <h3 className="font-semibold text-[15px] text-ink">Digital Mapping Gedung</h3>
                     <p className="text-[12px] text-ink-mute mt-0.5">Atur peta denah interaktif, deskripsi ruangan, dan generate QR Code lokasi.</p>
                  </div>
               </div>
               
               <form onSubmit={addOrUpdateMapping} className="flex flex-col gap-3 mb-6 bg-canvas-soft p-4 rounded-sm border border-hairline">
                  <div className="space-y-1">
                     <label className="text-[12px] font-medium text-ink-mute">Gedung / Lokasi</label>
                     <select 
                        required
                        value={newMapping.gedung}
                        onChange={(e) => setNewMapping({...newMapping, gedung: e.target.value})}
                        className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink"
                     >
                        <option value="">-- Pilih Gedung --</option>
                        {Array.from(new Set([...locations.map(l => l.gedung), ...archiveGedungList])).filter(Boolean).sort().map(gedung => (
                           <option key={gedung as string} value={`Gedung ${gedung}`}>Gedung {gedung}</option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[12px] font-medium text-ink-mute">Deskripsi Ruangan (Untuk dibacakan TTS)</label>
                     <textarea 
                        required
                        value={newMapping.deskripsi}
                        onChange={(e) => setNewMapping({...newMapping, deskripsi: e.target.value})}
                        rows={3}
                        className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink"
                        placeholder="Contoh: Anda berada di Gedung A yang menyimpan berkas arsip operasional tahun 2010 sampai 2018."
                     ></textarea>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[12px] font-medium text-ink-mute">URL Gambar Denah (Opsional, Link GDrive/Imgur/dsb)</label>
                     <input 
                        type="text" 
                        value={newMapping.map_url}
                        onChange={(e) => setNewMapping({...newMapping, map_url: e.target.value})}
                        className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink"
                        placeholder="https://..."
                     />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                     {editingMappingId && (
                        <button type="button" onClick={cancelEditMapping} className="bg-canvas border border-hairline text-ink px-4 py-2 rounded-sm hover:bg-canvas-soft flex items-center justify-center gap-2 text-[13px] font-semibold shadow-sm">
                           Batal
                        </button>
                     )}
                     <button type="submit" className="bg-primary text-white px-4 py-2 rounded-sm hover:bg-primary-deep flex items-center justify-center gap-2 text-[13px] font-semibold shadow-sm">
                        {editingMappingId ? <><Save size={16} /> Simpan Perubahan</> : <><Plus size={16} /> Tambah Digital Mapping</>}
                     </button>
                  </div>
               </form>

               <div className="border border-hairline bg-canvas rounded-xs overflow-x-auto">
                  <table className="w-full text-left text-[12px] border-collapse min-w-[700px]">
                     <thead>
                        <tr className="bg-canvas-soft border-b border-hairline text-ink font-semibold">
                           <th className="p-3">Gedung / Lokasi</th>
                           <th className="p-3">Deskripsi / TTS Text</th>
                           <th className="p-3">Gambar Denah</th>
                           <th className="p-3 text-center">Tindakan</th>
                        </tr>
                     </thead>
                     <tbody>
                        {digitalMappings.length > 0 ? digitalMappings.map((m) => (
                           <tr key={m.id} className="border-b border-hairline hover:bg-canvas-soft/50 transition-colors">
                              <td className="p-3 font-medium text-ink align-top">{m.gedung}</td>
                              <td className="p-3 text-ink-mute max-w-sm truncate align-top">{m.deskripsi}</td>
                              <td className="p-3 text-ink-mute max-w-[150px] truncate align-top">
                                 {m.map_url ? (
                                    <a href={m.map_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Lihat Gambar</a>
                                 ) : "-"}
                              </td>
                              <td className="p-3 text-center align-top">
                                 <div className="flex items-center justify-center gap-2">
                                    <button 
                                       onClick={() => setQrModal(m)}
                                       className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 px-3 py-1.5 rounded-sm transition-colors border border-indigo-200 flex items-center gap-1 font-semibold text-[11px]"
                                    >
                                       <QrCode size={14} /> Lihat QR
                                    </button>
                                    <button 
                                       onClick={() => startEditMapping(m)}
                                       className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-sm transition-colors border border-transparent hover:border-blue-200"
                                       title="Edit Mapping"
                                    >
                                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                    </button>
                                    <button 
                                       onClick={() => deleteMapping(m.id)}
                                       className="text-red-500 hover:bg-red-50 p-1.5 rounded-sm transition-colors border border-transparent hover:border-red-200"
                                       title="Hapus Mapping"
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        )) : (
                           <tr>
                              <td colSpan={4} className="text-center p-6 text-ink-mute">
                                 Belum ada data digital mapping.
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {!loading && activeTab === "retensi" && (
            <div className="bg-canvas border border-hairline rounded-sm p-6 shadow-xs w-full">
               <div className="flex items-center gap-2 border-b border-hairline pb-3 mb-5">
                  <Clock size={18} className="text-primary" />
                  <div>
                     <h3 className="font-semibold text-[15px] text-ink">Jadwal Retensi Arsip (JRA)</h3>
                     <p className="text-[12px] text-ink-mute mt-0.5">Atur berapa lama sebuah kategori arsip disimpan di Rak Aktif dan Inaktif sebelum dimusnahkan.</p>
                  </div>
               </div>
               
               <form onSubmit={addRetensi} className="flex flex-col md:flex-row gap-3 mb-6 bg-canvas-soft p-4 rounded-sm border border-hairline">
                  <div className="flex-1 space-y-1">
                     <label className="text-[12px] font-medium text-ink-mute">Kategori Arsip (Jenis Berkas)</label>
                     <select 
                        value={newRetensi.kategori}
                        onChange={(e) => setNewRetensi({...newRetensi, kategori: e.target.value})}
                        className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink"
                     >
                        <option value="">-- Pilih Jenis Berkas --</option>
                        {jenisBerkasList.map((jb, idx) => (
                           <option key={idx} value={jb}>{jb}</option>
                        ))}
                     </select>
                  </div>
                  <div className="w-full md:w-32 space-y-1">
                     <label className="text-[12px] font-medium text-ink-mute">Masa Aktif</label>
                     <div className="relative">
                        <input 
                           type="number" 
                           min="0"
                           value={newRetensi.masa_aktif_tahun}
                           onChange={(e) => setNewRetensi({...newRetensi, masa_aktif_tahun: parseInt(e.target.value) || 0})}
                           className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink pr-12"
                        />
                        <span className="absolute right-3 top-2 text-[12px] text-ink-mute">Tahun</span>
                     </div>
                  </div>
                  <div className="w-full md:w-32 space-y-1">
                     <label className="text-[12px] font-medium text-ink-mute">Masa Inaktif</label>
                     <div className="relative">
                        <input 
                           type="number" 
                           min="0"
                           value={newRetensi.masa_inaktif_tahun}
                           onChange={(e) => setNewRetensi({...newRetensi, masa_inaktif_tahun: parseInt(e.target.value) || 0})}
                           className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink pr-12"
                        />
                        <span className="absolute right-3 top-2 text-[12px] text-ink-mute">Tahun</span>
                     </div>
                  </div>
                  <div className="flex items-end">
                     <button type="submit" className="h-[34px] w-full bg-primary text-white px-4 rounded-sm hover:bg-primary-deep flex items-center justify-center gap-2 text-[13px] font-medium transition-colors">
                        <Plus size={16} /> Tambah
                     </button>
                  </div>
               </form>

               <div className="overflow-x-auto border border-hairline rounded-sm">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-canvas-soft border-b border-hairline text-[12px] text-ink-mute uppercase tracking-wider">
                           <th className="p-3 font-medium">Kategori Arsip</th>
                           <th className="p-3 font-medium text-center">Aktif (Tahun)</th>
                           <th className="p-3 font-medium text-center">Inaktif (Tahun)</th>
                           <th className="p-3 font-medium text-center">Aksi</th>
                        </tr>
                     </thead>
                     <tbody>
                        {retensiRules.length > 0 ? retensiRules.map((r) => (
                           <tr key={r.id} className="border-b border-hairline last:border-0 text-[13px] hover:bg-canvas-soft transition-colors">
                              <td className="p-3 font-medium text-ink">{r.kategori}</td>
                              <td className="p-3 text-center">{r.masa_aktif_tahun}</td>
                              <td className="p-3 text-center">{r.masa_inaktif_tahun}</td>
                              <td className="p-3 text-center">
                                 <button onClick={() => deleteRetensi(r.id)} className="text-red-500 dark:text-red-400 hover:text-red-700 p-1.5 bg-canvas hover:bg-red-50 dark:hover:bg-red-500/10 border border-hairline rounded-xs transition-colors inline-flex">
                                    <Trash2 size={14} />
                                 </button>
                              </td>
                           </tr>
                        )) : (
                           <tr>
                              <td colSpan={4} className="p-6 text-center text-[13px] text-ink-mute">
                                 Belum ada aturan jadwal retensi. Silakan tambahkan di atas.
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {!loading && activeTab === "landing" && landingConfig && (
            <form onSubmit={saveLandingConfig} className="space-y-6">
               
               {/* Hero Section */}
               <div className="bg-canvas border border-hairline rounded-sm p-6 space-y-4">
                  <h3 className="font-semibold text-[15px] border-b border-hairline pb-2 mb-4 text-ink">Hero Banner</h3>
                  <div className="space-y-2">
                     <label className="text-[12px] font-medium text-ink-mute">Judul Utama</label>
                     <input type="text" name="hero_title" value={landingConfig.hero_title} onChange={handleLandingChange} className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[12px] font-medium text-ink-mute">Deskripsi Pendek</label>
                     <textarea name="hero_subtitle" value={landingConfig.hero_subtitle} onChange={handleLandingChange} rows={2} className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink"></textarea>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[12px] font-medium text-ink-mute">URL Gambar Latar Belakang (Kosongkan untuk default)</label>
                     <input type="text" name="hero_image_url" value={landingConfig.hero_image_url} onChange={handleLandingChange} placeholder="/hero-image.jpg" className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink" />
                  </div>
               </div>

               {/* Sambutan */}
               <div className="bg-canvas border border-hairline rounded-sm p-6 space-y-4">
                  <h3 className="font-semibold text-[15px] border-b border-hairline pb-2 mb-4 text-ink">Sambutan Pimpinan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[12px] font-medium text-ink-mute">Judul Sambutan</label>
                        <input type="text" name="sambutan_title" value={landingConfig.sambutan_title} onChange={handleLandingChange} className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[12px] font-medium text-ink-mute">URL Foto (Link GDrive/Imgur)</label>
                        <input type="text" name="sambutan_photo_url" value={landingConfig.sambutan_photo_url} onChange={handleLandingChange} placeholder="https://..." className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[12px] font-medium text-ink-mute">Teks Sambutan</label>
                     <textarea name="sambutan_text" value={landingConfig.sambutan_text} onChange={handleLandingChange} rows={5} className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink"></textarea>
                  </div>
               </div>

               {/* SOP */}
               <div className="bg-canvas border border-hairline rounded-sm p-6 space-y-4">
                  <h3 className="font-semibold text-[15px] border-b border-hairline pb-2 mb-4 text-ink">Prosedur (SOP)</h3>
                  <div className="space-y-2">
                     <label className="text-[12px] font-medium text-ink-mute">Judul Bagian Prosedur</label>
                     <input type="text" name="sop_title" value={landingConfig.sop_title} onChange={handleLandingChange} className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[12px] font-medium text-ink-mute">Deskripsi Pendek Prosedur</label>
                     <textarea name="sop_text" value={landingConfig.sop_text} onChange={handleLandingChange} rows={2} className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink"></textarea>
                  </div>
                  
                  <div className="pt-4 border-t border-hairline mt-4">
                     <div className="flex items-center justify-between mb-3">
                        <label className="text-[13px] font-semibold text-ink">Daftar Langkah SOP</label>
                        <button 
                           type="button" 
                           onClick={() => {
                              const currentItems = landingConfig.sop_items || [];
                              setLandingConfig({ ...landingConfig, sop_items: [...currentItems, { title: "", desc: "" }] });
                           }}
                           className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-2 py-1 rounded-sm text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                           <Plus size={12} /> Tambah Langkah
                        </button>
                     </div>
                     
                     <div className="space-y-3">
                        {(landingConfig.sop_items || []).map((item: any, idx: number) => (
                           <div key={idx} className="flex gap-3 items-start bg-canvas-soft border border-hairline p-3 rounded-xs relative">
                              <div className="font-bold text-primary/50 text-xl mt-1 w-6 shrink-0">
                                 {String(idx + 1).padStart(2, '0')}
                              </div>
                              <div className="flex-1 space-y-2">
                                 <input 
                                    type="text" 
                                    placeholder="Judul Langkah (contoh: Pemilahan)" 
                                    value={item.title}
                                    onChange={(e) => {
                                       const newItems = [...landingConfig.sop_items];
                                       newItems[idx].title = e.target.value;
                                       setLandingConfig({ ...landingConfig, sop_items: newItems });
                                    }}
                                    className="w-full bg-canvas border border-hairline text-[12px] font-semibold rounded-xs px-2 py-1.5 focus:border-ink text-ink" 
                                 />
                                 <textarea 
                                    placeholder="Deskripsi..." 
                                    value={item.desc}
                                    onChange={(e) => {
                                       const newItems = [...landingConfig.sop_items];
                                       newItems[idx].desc = e.target.value;
                                       setLandingConfig({ ...landingConfig, sop_items: newItems });
                                    }}
                                    rows={2} 
                                    className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2 py-1.5 focus:border-ink text-ink"
                                 ></textarea>
                              </div>
                              <button 
                                 type="button" 
                                 onClick={() => {
                                    const newItems = [...landingConfig.sop_items];
                                    newItems.splice(idx, 1);
                                    setLandingConfig({ ...landingConfig, sop_items: newItems });
                                 }}
                                 className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-sm transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                              >
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        ))}
                        {(!landingConfig.sop_items || landingConfig.sop_items.length === 0) && (
                           <div className="text-center py-4 text-ink-mute text-[12px] border border-dashed border-hairline rounded-sm">
                              Belum ada langkah SOP. Silakan klik "Tambah Langkah".
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* PIC Gedung */}
               <div className="bg-canvas border border-hairline rounded-sm p-6 space-y-4">
                  <h3 className="font-semibold text-[15px] border-b border-hairline pb-2 mb-4 text-ink">PIC Gedung</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[12px] font-medium text-ink-mute">Nama & Jabatan (Contoh: Syukur - PIC Gedung)</label>
                        <input type="text" name="pic_title" value={landingConfig.pic_title} onChange={handleLandingChange} className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[12px] font-medium text-ink-mute">URL Foto (Link GDrive/Imgur)</label>
                        <input type="text" name="pic_photo_url" value={landingConfig.pic_photo_url} onChange={handleLandingChange} placeholder="https://..." className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[12px] font-medium text-ink-mute">Nomor Whatsapp (Awali dengan https://wa.me/...)</label>
                        <input type="text" name="pic_whatsapp" value={landingConfig.pic_whatsapp} onChange={handleLandingChange} className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[12px] font-medium text-ink-mute">Email (Awali dengan mailto:)</label>
                        <input type="text" name="pic_email" value={landingConfig.pic_email} onChange={handleLandingChange} className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[12px] font-medium text-ink-mute">Teks Profil PIC</label>
                     <textarea name="pic_text" value={landingConfig.pic_text} onChange={handleLandingChange} rows={3} className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 focus:border-ink"></textarea>
                  </div>
               </div>

               <div className="flex justify-end pt-4">
                  <button 
                     type="submit" 
                     disabled={savingLanding}
                     className="bg-primary text-white font-semibold px-6 py-2 rounded-sm hover:bg-primary-deep flex items-center gap-2"
                  >
                     {savingLanding ? "Menyimpan..." : <><Save size={16} /> Simpan Perubahan</>}
                  </button>
               </div>
            </form>
         )}

         {/* QR Code Modal */}
         {qrModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center p-4 border-b border-gray-100">
                     <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <QrCode size={18} className="text-indigo-600" /> QR Lokasi
                     </h3>
                     <button onClick={() => setQrModal(null)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-md transition-colors">
                        <X size={18} />
                     </button>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center">
                     <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                        <QRCode
                           id="qr-code-svg"
                           value={`${typeof window !== 'undefined' ? window.location.origin : ''}/lokasi/${qrModal.id}`}
                           size={200}
                           level="H"
                        />
                     </div>
                     <p className="text-center font-bold text-gray-800 text-lg mb-1">{qrModal.gedung}</p>
                     <p className="text-center text-gray-500 text-sm mb-6">Scan untuk melihat peta dan mencari arsip</p>
                     
                     <div className="flex gap-3 w-full">
                        <button 
                           onClick={downloadQRCode}
                           className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                        >
                           <Download size={16} /> Download
                        </button>
                        <a 
                           href={`/lokasi/${qrModal.id}`} 
                           target="_blank"
                           className="flex-1 flex items-center justify-center text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition-colors"
                        >
                           Buka Link
                        </a>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
