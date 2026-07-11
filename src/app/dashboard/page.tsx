"use client";
import { useState, useEffect } from "react";
import { useRole } from "@/components/RoleContext";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Clock, 
  Archive, 
  ChevronRight, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter, 
  ArrowLeft, 
  Link as LinkIcon, 
  Check, 
  Edit3, 
  Trash2,
  ExternalLink,
  Download
} from "lucide-react";

export default function Dashboard() {
  const { role, user, activeMenu, setActiveMenu } = useRole();
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [approvalLocation, setApprovalLocation] = useState({
     gedung: "A",
     lorong: "",
     rak: ""
  });

  // Redirect to login if not authenticated
  useEffect(() => {
     const savedSession = localStorage.getItem("arsip_session");
     if (!savedSession && !user) {
        router.push("/login");
     }
  }, [user, router]);

  // Form State
  const [formData, setFormData] = useState({
     kodeKlasifikasi: "",
     jenisBerkas: "",
     judulBerkas: "",
     departemen: "KEUANGAN",
     tahun: new Date().getFullYear().toString(),
     tanggalTerima: "",
     jangkaWaktu: "",
     gedung: "",
     lorong: "",
     rak: "",
     linkBerkas: "",
     status: "Menunggu ACC"
  });

  // Mock database records
  const [archives, setArchives] = useState([
     {
        no: "01",
        kodeKlasifikasi: "PL.01.01.04",
        jenisBerkas: "MATERIAL DAN PERALATAN PABRIK",
        judulBerkas: "PENGADAAN DALAM NEGRI ( OP )",
        departemen: "PERLENGKAPAN",
        tahun: "2018",
        tanggalTerima: "01/03/2018",
        jangkaWaktu: "5 tahun",
        gedung: "A",
        lorong: "20",
        rak: "RAK F BARIS 2",
        status: "Aktif",
        linkBerkas: "https://drive.google.com/file/d/1_demo_perlengkapan/view"
     },
     {
        no: "02",
        kodeKlasifikasi: "PR (PAYMENT REGISTER)",
        jenisBerkas: "BUKTI-BUKTI / DOKUMEN TRANSAKSI",
        judulBerkas: "EXISTING (332)",
        departemen: "KEUANGAN",
        tahun: "2018",
        tanggalTerima: "23/04/2018",
        jangkaWaktu: "2th lpr disyahkan RKAP",
        gedung: "A",
        lorong: "22",
        rak: "RAK G BARIS 1",
        status: "Aktif",
        linkBerkas: "https://drive.google.com/file/d/1_demo_keuangan332/view"
     },
     {
        no: "03",
        kodeKlasifikasi: "PR (PAYMENT REGISTER)",
        jenisBerkas: "BUKTI-BUKTI / DOKUMEN TRANSAKSI",
        judulBerkas: "EXISTING (333)",
        departemen: "KEUANGAN",
        tahun: "2018",
        tanggalTerima: "23/04/2018",
        jangkaWaktu: "2th lpr disyahkan RKAP",
        gedung: "A",
        lorong: "22",
        rak: "RAK G BARIS 1",
        status: "Aktif",
        linkBerkas: "https://drive.google.com/file/d/1_demo_keuangan333/view"
     },
     {
        no: "04",
        kodeKlasifikasi: "PR (PAYMENT REGISTER)",
        jenisBerkas: "BUKTI-BUKTI / DOKUMEN TRANSAKSI",
        judulBerkas: "EXISTING (334)",
        departemen: "KEUANGAN",
        tahun: "2018",
        tanggalTerima: "23/04/2018",
        jangkaWaktu: "2th lpr disyahkan RKAP",
        gedung: "A",
        lorong: "22",
        rak: "RAK G BARIS 1",
        status: "Inaktif",
        linkBerkas: "https://drive.google.com/file/d/1_demo_keuangan334/view"
     },
     {
        no: "05",
        kodeKlasifikasi: "PR (PAYMENT REGISTER)",
        jenisBerkas: "BUKTI-BUKTI / DOKUMEN TRANSAKSI",
        judulBerkas: "EXISTING (335)",
        departemen: "KEUANGAN",
        tahun: "2018",
        tanggalTerima: "23/04/2018",
        jangkaWaktu: "2th lpr disyahkan RKAP",
        gedung: "A",
        lorong: "22",
        rak: "RAK G BARIS 1",
        status: "Inaktif",
        linkBerkas: "https://drive.google.com/file/d/1_demo_keuangan335/view"
     },
     {
        no: "06",
        kodeKlasifikasi: "PR (PAYMENT REGISTER)",
        jenisBerkas: "BUKTI-BUKTI / DOKUMEN TRANSAKSI",
        judulBerkas: "EXISTING (336)",
        departemen: "KEUANGAN",
        tahun: "2018",
        tanggalTerima: "23/04/2018",
        jangkaWaktu: "2th lpr disyahkan RKAP",
        gedung: "A",
        lorong: "22",
        rak: "RAK G BARIS 1",
        status: "Permanen",
        linkBerkas: "https://drive.google.com/file/d/1_demo_keuangan336/view"
     },
     {
        no: "07",
        kodeKlasifikasi: "PR (PAYMENT REGISTER)",
        jenisBerkas: "BUKTI-BUKTI / DOKUMEN TRANSAKSI",
        judulBerkas: "EXISTING (337)",
        departemen: "KEUANGAN",
        tahun: "2018",
        tanggalTerima: "23/04/2018",
        jangkaWaktu: "2th lpr disyahkan RKAP",
        gedung: "A",
        lorong: "22",
        rak: "RAK G BARIS 1",
        status: "Dinilai Kembali",
        linkBerkas: "https://drive.google.com/file/d/1_demo_keuangan337/view"
     },
     {
        no: "08",
        kodeKlasifikasi: "PL.02.04.11",
        jenisBerkas: "SOP OPERASIONAL SHIFT",
        judulBerkas: "SOP KARYAWAN SHIFT PABRIK UNIT 4",
        departemen: "HRD",
        tahun: "2026",
        tanggalTerima: "10/07/2026",
        jangkaWaktu: "3 tahun",
        gedung: "",
        lorong: "",
        rak: "",
        status: "Menunggu ACC",
        linkBerkas: "https://drive.google.com/file/d/1_demo_hrd08/view"
     },
     {
        no: "09",
        kodeKlasifikasi: "LGL.01.12.01",
        jenisBerkas: "PENGESAHAN DOKUMEN LAHAN",
        judulBerkas: "PENGESAHAN LAHAN BARU TONASA B",
        departemen: "LEGAL",
        tahun: "2026",
        tanggalTerima: "11/07/2026",
        jangkaWaktu: "10 tahun",
        gedung: "",
        lorong: "",
        rak: "",
        status: "Menunggu ACC",
        linkBerkas: "https://drive.google.com/file/d/1_demo_legal09/view"
     }
  ]);

  if (!user) {
     return (
        <div className="min-h-[50vh] flex items-center justify-center bg-canvas">
           <span className="text-[14px] text-ink-mute">Mengecek sesi login...</span>
        </div>
     );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     const { name, value } = e.target;
     setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, value } = e.target;
     setApprovalLocation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     
     const newRecord = {
        no: (archives.length + 1).toString().padStart(2, '0'),
        kodeKlasifikasi: formData.kodeKlasifikasi,
        jenisBerkas: formData.jenisBerkas,
        judulBerkas: formData.judulBerkas,
        departemen: role === 'admin_dept' ? 'KEUANGAN' : formData.departemen,
        tahun: formData.tahun,
        tanggalTerima: formData.tanggalTerima,
        jangkaWaktu: formData.jangkaWaktu,
        gedung: role === 'pic_gedung' ? formData.gedung : "",
        lorong: role === 'pic_gedung' ? formData.lorong : "",
        rak: role === 'pic_gedung' ? formData.rak : "",
        status: role === 'pic_gedung' ? "Aktif" : "Menunggu ACC",
        linkBerkas: formData.linkBerkas
     };

     setArchives(prev => [...prev, newRecord]);
     setSuccessMessage(
        role === 'pic_gedung' 
        ? "Arsip berhasil disimpan sebagai Aktif!" 
        : "Pengajuan arsip dikirim! Menunggu ACC dari PIC Gedung."
     );
     
     setTimeout(() => {
        setSuccessMessage("");
        setShowAddForm(false);
        setFormData({
           kodeKlasifikasi: "",
           jenisBerkas: "",
           judulBerkas: "",
           departemen: "KEUANGAN",
           tahun: new Date().getFullYear().toString(),
           tanggalTerima: "",
           jangkaWaktu: "",
           gedung: "",
           lorong: "",
           rak: "",
           linkBerkas: "",
           status: role === 'pic_gedung' ? "Aktif" : "Menunggu ACC"
        });
     }, 2000);
  };

  const handleApprove = (no: string) => {
     setSelectedApprovalId(no);
  };

  const submitApproval = (e: React.FormEvent) => {
     e.preventDefault();
     setArchives(prev => prev.map(item => {
        if (item.no === selectedApprovalId) {
           return {
              ...item,
              gedung: approvalLocation.gedung,
              lorong: approvalLocation.lorong,
              rak: approvalLocation.rak,
              status: "Aktif"
           };
        }
        return item;
     }));
     setSuccessMessage("Berkas berhasil disetujui & lokasi penyimpanan fisik direkam!");
     setSelectedApprovalId(null);
     setApprovalLocation({ gedung: "A", lorong: "", rak: "" });
     setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleReject = (no: string) => {
     setArchives(prev => prev.map(item => {
        if (item.no === no) {
           return { ...item, status: "Ditolak" };
        }
        return item;
     }));
     setSuccessMessage("Pengajuan arsip ditolak.");
     setTimeout(() => setSuccessMessage(""), 2000);
  };

  const filteredArchives = archives.filter(item => {
     const matchesStatus = statusFilter === "Semua" || item.status === statusFilter;
     const matchesSearch = 
        item.judulBerkas.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.kodeKlasifikasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.departemen.toLowerCase().includes(searchQuery.toLowerCase());
     return matchesStatus && matchesSearch;
  });

  // EXPORT EXCEL (CSV) FUNCTIONALITY (New feature)
  const handleExportExcel = () => {
     const headers = [
        "No",
        "Kode Klasifikasi",
        "Jenis Berkas",
        "Judul Berkas",
        "Departemen",
        "Tahun",
        "Tanggal Terima Berkas",
        "Jangka Waktu Aktif",
        "Gedung",
        "Lorong",
        "Rak",
        "Link Berkas Digital",
        "Status"
     ];

     const csvRows = [
        headers.join(","),
        ...filteredArchives.map(item => [
           `"${item.no}"`,
           `"${item.kodeKlasifikasi.replace(/"/g, '""')}"`,
           `"${item.jenisBerkas.replace(/"/g, '""')}"`,
           `"${item.judulBerkas.replace(/"/g, '""')}"`,
           `"${item.departemen.replace(/"/g, '""')}"`,
           `"${item.tahun}"`,
           `"${item.tanggalTerima}"`,
           `"${item.jangkaWaktu.replace(/"/g, '""')}"`,
           `"${(item.gedung || "-").replace(/"/g, '""')}"`,
           `"${(item.lorong || "-").replace(/"/g, '""')}"`,
           `"${(item.rak || "-").replace(/"/g, '""')}"`,
           `"${item.linkBerkas || ""}"`,
           `"${item.status}"`
        ].join(","))
     ].join("\n");

     const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.setAttribute("href", url);
     link.setAttribute("download", `Daftar_Arsip_Tonasa_${statusFilter}.csv`);
     link.style.visibility = "hidden";
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  // 1. ADD ARCHIVE FORM VIEW
  if (showAddForm) {
     return (
        <div className="space-y-6 max-w-[800px] mx-auto pb-10">
           <div className="pb-4 border-b border-hairline flex items-center gap-4">
              <button 
                 onClick={() => setShowAddForm(false)} 
                 className="p-1.5 hover:bg-canvas-soft rounded-xs border border-hairline text-ink transition-colors"
              >
                 <ArrowLeft size={18} />
              </button>
              <div>
                 <h2 className="text-[18px] md:text-display-md font-medium tracking-tight text-ink">
                    {role === 'pic_gedung' ? 'Tambah Berkas Arsip' : 'Ajukan Berkas Arsip Baru'}
                 </h2>
                 <p className="text-ink-mute text-[12px] md:text-[14px]">
                    {role === 'pic_gedung' 
                     ? 'Masukkan metadata berkas untuk langsung diarsipkan secara aktif.' 
                     : 'Berkas akan diajukan ke PIC Gedung Arsip untuk disetujui (ACC) terlebih dahulu.'}
                 </p>
              </div>
           </div>

           {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm p-4 flex items-center gap-3">
                 <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                    <Check size={14} strokeWidth={3} />
                 </div>
                 <span className="text-[14px] font-medium">{successMessage}</span>
              </div>
           )}

           <form onSubmit={handleSubmit} className="bg-canvas border border-hairline rounded-sm p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-ink">Kode Klasifikasi</label>
                    <input 
                       type="text" 
                       name="kodeKlasifikasi"
                       value={formData.kodeKlasifikasi}
                       onChange={handleInputChange}
                       required
                       placeholder="Contoh: PL.01.01.04"
                       className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-ink">Jenis Berkas</label>
                    <input 
                       type="text" 
                       name="jenisBerkas"
                       value={formData.jenisBerkas}
                       onChange={handleInputChange}
                       required
                       placeholder="Contoh: BUKTI-BUKTI / DOKUMEN TRANSAKSI"
                       className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-ink">Judul Berkas</label>
                    <input 
                       type="text" 
                       name="judulBerkas"
                       value={formData.judulBerkas}
                       onChange={handleInputChange}
                       required
                       placeholder="Contoh: PENGADAAN DALAM NEGRI ( OP )"
                       className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-ink">Departemen</label>
                    {role === 'pic_gedung' ? (
                       <select 
                          name="departemen"
                          value={formData.departemen}
                          onChange={handleInputChange}
                          className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink"
                       >
                          <option value="KEUANGAN">KEUANGAN</option>
                          <option value="PERLENGKAPAN">PERLENGKAPAN</option>
                          <option value="LEGAL">LEGAL</option>
                          <option value="UMUM">UMUM</option>
                       </select>
                    ) : (
                       <input 
                          type="text" 
                          name="departemen"
                          value="KEUANGAN (Departemen Anda)" 
                          disabled
                          className="w-full bg-canvas-soft border border-hairline text-[14px] rounded-xs px-3 py-2 text-ink-mute cursor-not-allowed"
                       />
                    )}
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-ink">Tahun Berkas</label>
                    <input 
                       type="text" 
                       name="tahun"
                       value={formData.tahun}
                       onChange={handleInputChange}
                       required
                       placeholder="Contoh: 2018"
                       className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-ink">Tanggal Terima Berkas</label>
                    <input 
                       type="text" 
                       name="tanggalTerima"
                       value={formData.tanggalTerima}
                       onChange={handleInputChange}
                       required
                       placeholder="e.g. 23/04/2018"
                       className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-ink">Jangka Waktu Aktif</label>
                    <input 
                       type="text" 
                       name="jangkaWaktu"
                       value={formData.jangkaWaktu}
                       onChange={handleInputChange}
                       required
                       placeholder="e.g. 5 tahun"
                       className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                    />
                 </div>

                 {role === 'pic_gedung' && (
                    <>
                       <div className="space-y-2">
                          <label className="block text-[13px] font-medium text-ink">Gedung</label>
                          <input 
                             type="text" 
                             name="gedung"
                             value={formData.gedung}
                             onChange={handleInputChange}
                             required
                             placeholder="Contoh: A, B"
                             className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="block text-[13px] font-medium text-ink">Lorong</label>
                          <input 
                             type="text" 
                             name="lorong"
                             value={formData.lorong}
                             onChange={handleInputChange}
                             required
                             placeholder="Contoh: 22"
                             className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="block text-[13px] font-medium text-ink">Rak</label>
                          <input 
                             type="text" 
                             name="rak"
                             value={formData.rak}
                             onChange={handleInputChange}
                             required
                             placeholder="Contoh: RAK G BARIS 1"
                             className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink"
                          />
                       </div>
                    </>
                 )}

                 {role === 'pic_gedung' && (
                    <div className="space-y-2">
                       <label className="block text-[13px] font-medium text-ink">Status Berkas</label>
                       <select 
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink"
                       >
                          <option value="Aktif">Aktif</option>
                          <option value="Inaktif">Inaktif</option>
                          <option value="Permanen">Permanen</option>
                       </select>
                    </div>
                 )}
              </div>

              <div className="space-y-2">
                 <label className="block text-[13px] font-medium text-ink">Link Berkas Digital (URL)</label>
                 <div className="relative">
                    <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                    <input 
                       type="url" 
                       name="linkBerkas"
                       value={formData.linkBerkas}
                       onChange={handleInputChange}
                       required
                       placeholder="https://drive.google.com/file/d/..."
                       className="w-full bg-canvas border border-hairline text-[14px] rounded-xs pl-9 pr-4 py-2.5 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                    />
                 </div>
              </div>

              <div className="pt-4 border-t border-hairline flex justify-end gap-3">
                 <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)} 
                    className="btn-outline"
                 >
                    Batal
                 </button>
                 <button 
                    type="submit" 
                    className="btn-primary"
                 >
                    {role === 'pic_gedung' ? 'Simpan Berkas' : 'Ajukan Berkas'}
                 </button>
              </div>
           </form>
        </div>
     );
  }

  // 2. PERSETUJUAN (ACC) PAGE VIEW (PIC Gedung ONLY)
  if (activeMenu === "Persetujuan (ACC)" && role === 'pic_gedung') {
     const pendingSubmissions = archives.filter(item => item.status === "Menunggu ACC");
     
     return (
        <div className="space-y-6 max-w-full mx-auto pb-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h2 className="text-[18px] md:text-[28px] font-medium tracking-tight text-ink">
                    Persetujuan (ACC) Berkas Masuk
                 </h2>
                 <p className="text-ink-mute text-[12px] md:text-[14px] mt-1">
                    Periksa berkas digital pengajuan departemen dan tentukan lokasi penyimpanan fisiknya sebelum menyetujui.
                 </p>
              </div>
              
              {/* Export Pending List to Excel for PIC */}
              <button 
                 onClick={handleExportExcel}
                 className="btn-outline flex items-center justify-center gap-2 py-2 px-3 text-[13px] border border-hairline-strong rounded-sm hover:bg-canvas-soft transition-colors w-full md:w-auto"
              >
                 <Download size={15} /> Export Pending
              </button>
           </div>

           {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm p-4 flex items-center gap-3">
                 <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                    <Check size={14} strokeWidth={3} />
                 </div>
                 <span className="text-[14px] font-medium">{successMessage}</span>
              </div>
           )}

           {selectedApprovalId && (
              <form onSubmit={submitApproval} className="border border-hairline bg-canvas-soft p-5 rounded-xs space-y-4 max-w-[500px]">
                 <div className="flex items-center gap-2 text-ink">
                    <MapPin size={18} className="text-primary" />
                    <h3 className="font-semibold text-[14px]">Tentukan Lokasi Fisik Penyimpanan</h3>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    <div>
                       <label className="block text-[11px] font-medium text-ink mb-1">Gedung</label>
                       <input 
                          type="text" 
                          name="gedung"
                          value={approvalLocation.gedung}
                          onChange={handleLocationChange}
                          required
                          placeholder="e.g. A"
                          className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-ink text-ink"
                       />
                    </div>
                    <div>
                       <label className="block text-[11px] font-medium text-ink mb-1">Lorong</label>
                       <input 
                          type="text" 
                          name="lorong"
                          value={approvalLocation.lorong}
                          onChange={handleLocationChange}
                          required
                          placeholder="e.g. 20"
                          className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-ink text-ink"
                       />
                    </div>
                    <div>
                       <label className="block text-[11px] font-medium text-ink mb-1">Rak</label>
                       <input 
                          type="text" 
                          name="rak"
                          value={approvalLocation.rak}
                          onChange={handleLocationChange}
                          required
                          placeholder="e.g. RAK G"
                          className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-ink text-ink"
                       />
                    </div>
                 </div>
                 <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
                    <button 
                       type="button" 
                       onClick={() => setSelectedApprovalId(null)}
                       className="btn-outline !py-1 !px-3 !text-[12px]"
                    >
                       Batal
                    </button>
                    <button 
                       type="submit"
                       className="btn-primary !py-1 !px-3 !text-[12px]"
                    >
                       Konfirmasi ACC
                    </button>
                 </div>
              </form>
           )}

           <div className="border border-hairline bg-canvas rounded-xs overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse min-w-[1000px]">
                 <thead>
                    <tr className="bg-canvas-soft border-b border-hairline text-ink font-semibold">
                       <th className="p-3 w-12 text-center">No</th>
                       <th className="p-3">Kode Klasifikasi</th>
                       <th className="p-3">Jenis Berkas</th>
                       <th className="p-3">Judul Berkas</th>
                       <th className="p-3">Departemen</th>
                       <th className="p-3 text-center">Tahun</th>
                       <th className="p-3 text-center">Tanggal Ajukan</th>
                       <th className="p-3 text-center">Link Berkas</th>
                       <th className="p-3 text-center">Status</th>
                       <th className="p-3 text-center">Tindakan</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-hairline">
                    {pendingSubmissions.length > 0 ? (
                       pendingSubmissions.map((archive) => (
                          <tr key={archive.no} className="hover:bg-canvas-soft/50 transition-colors text-ink">
                             <td className="p-3 text-center font-mono text-ink-mute">{archive.no}</td>
                             <td className="p-3 font-medium">{archive.kodeKlasifikasi}</td>
                             <td className="p-3 text-ink-mute">{archive.jenisBerkas}</td>
                             <td className="p-3 font-medium text-ink">{archive.judulBerkas}</td>
                             <td className="p-3"><span className="font-mono text-xs bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink">{archive.departemen}</span></td>
                             <td className="p-3 text-center font-mono">{archive.tahun}</td>
                             <td className="p-3 text-center font-mono">{archive.tanggalTerima}</td>
                             <td className="p-3 text-center">
                                <a 
                                   href={archive.linkBerkas} 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="inline-flex items-center gap-1.5 text-primary hover:underline hover:text-primary-deep font-semibold"
                                >
                                   <ExternalLink size={14} /> Buka Berkas
                                </a>
                             </td>
                             <td className="p-3 text-center">
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] px-2 py-0.5 rounded-full font-medium">
                                   {archive.status}
                                </span>
                             </td>
                             <td className="p-3">
                                <div className="flex items-center justify-center gap-2">
                                   <button 
                                      onClick={() => handleApprove(archive.no)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1 rounded-sm text-[11px]"
                                   >
                                      ACC
                                   </button>
                                   <button 
                                      onClick={() => handleReject(archive.no)}
                                      className="border border-hairline hover:bg-red-50 hover:text-primary text-ink-mute font-medium px-3 py-1 rounded-sm text-[11px]"
                                   >
                                      Tolak
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))
                    ) : (
                       <tr>
                          <td colSpan={10} className="p-8 text-center text-ink-mute text-[14px]">
                             Tidak ada pengajuan berkas masuk saat ini.
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
     );
  }

  // 3. VIEW: DASHBOARD (HOME SCREEN FOR ADMINS)
  if (activeMenu === "Dashboard" && role !== 'user') {
     const pendingCount = archives.filter(item => item.status === "Menunggu ACC").length;
     
     return (
        <div className="space-y-8 max-w-[1280px] mx-auto">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-hairline">
             <div>
                <h2 className="text-[18px] md:text-display-md font-medium tracking-tight text-ink">
                   Selamat Datang, {getRoleName(role)}.
                </h2>
                <p className="text-ink-mute mt-1 text-[14px]">Kelola arsip korporasi Anda dengan presisi.</p>
             </div>
             <div className="flex gap-3">
                {role === 'pic_gedung' && (
                  <button className="btn-outline flex items-center gap-2">
                    <FileText size={16} /> Laporan Bulanan
                  </button>
                )}
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={16} /> Tambah Arsip
                </button>
             </div>
           </div>

           {role === 'pic_gedung' && pendingCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-sm p-4 flex items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                    <Clock className="text-amber-600" />
                    <div>
                       <h3 className="font-semibold text-sm">Pengajuan Berkas Baru</h3>
                       <p className="text-xs text-amber-700 mt-0.5">Ada {pendingCount} pengajuan berkas dari departemen yang membutuhkan ACC Anda.</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => setActiveMenu("Persetujuan (ACC)")}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold text-[12px] px-3.5 py-1.5 rounded-sm transition-colors"
                 >
                    Periksa Sekarang
                 </button>
              </div>
           )}

           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-canvas border border-hairline rounded-sm p-6 flex flex-col justify-between hover:border-hairline-strong transition-colors">
                 <div className="flex items-center gap-2 mb-4 text-ink-mute">
                    <FileText size={16} className="text-ink" />
                    <p className="text-[13px] font-medium">
                       {role === 'pic_gedung' ? 'Total (Semua Dept)' : 'Total Arsip'}
                    </p>
                 </div>
                 <h3 className="text-display-md text-ink">{stats[role].total}</h3>
              </div>
              
              <div className="bg-canvas border border-hairline rounded-sm p-6 flex flex-col justify-between hover:border-hairline-strong transition-colors">
                 <div className="flex items-center gap-2 mb-4 text-ink-mute">
                    <Clock size={16} className="text-ink" />
                    <p className="text-[13px] font-medium">Arsip Aktif</p>
                 </div>
                 <h3 className="text-display-md text-ink">{stats[role].active}</h3>
              </div>
              
              <div className="col-span-2 md:col-span-1 bg-canvas-night text-on-dark rounded-sm p-6 border border-transparent flex flex-col justify-between relative overflow-hidden">
                 <div className="flex items-center gap-2 mb-4 text-ink-mute-2 relative z-10">
                    <Archive size={16} className="text-on-dark" />
                    <p className="text-[13px] font-medium">Inaktif (Gudang)</p>
                 </div>
                 <h3 className="text-display-md text-on-dark relative z-10">{stats[role].inactive}</h3>
                 <div className="absolute -right-4 -bottom-4 text-[#333333]">
                    <Archive size={100} />
                 </div>
              </div>
           </div>

           <div className="bg-canvas border border-hairline rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-hairline flex justify-between items-center bg-canvas-soft">
                 <h3 className="text-[14px] font-medium text-ink">Arsip Terbaru</h3>
                 <button 
                    onClick={() => setActiveMenu("Daftar Arsip")}
                    className="text-[13px] font-medium text-ink hover:text-primary transition-colors flex items-center gap-1"
                 >
                    Lihat Semua <ChevronRight size={14} />
                 </button>
              </div>
              
              <div className="divide-y divide-hairline">
                 {archives.slice(0, 3).map((archive) => (
                    <div key={archive.no} className="p-4 md:px-6 md:py-4 hover:bg-canvas-soft transition-colors flex items-center gap-4 group justify-between">
                       <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xs bg-canvas border border-hairline text-ink flex items-center justify-center flex-shrink-0">
                             <span className="font-mono text-[10px] font-medium tracking-wide">PDF</span>
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="text-[14px] md:text-[15px] font-medium text-ink truncate group-hover:text-primary transition-colors cursor-pointer">{archive.judulBerkas}.pdf</h4>
                             <div className="flex items-center gap-2 mt-1 text-[12px] text-ink-mute">
                                <span className="font-mono bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink">{archive.departemen}</span>
                                <span>•</span>
                                <span>No: {archive.kodeKlasifikasi}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <a 
                             href={archive.linkBerkas} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             className="text-primary hover:text-primary-deep" 
                             title="Buka berkas digital"
                          >
                             <ExternalLink size={14} />
                          </a>
                          <span className={`border text-[11px] px-2 py-0.5 rounded-full font-medium ${
                             archive.status === 'Aktif' 
                             ? 'bg-[#def7ec] text-[#03543f] border-[#bdf5db]' 
                             : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                             {archive.status}
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
     );
  }

  // 4. VIEW: DAFTAR ARSIP GENERAL PAGE (Available for all roles)
  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-[18px] md:text-[28px] font-medium tracking-tight text-ink">
              Daftar Berkas Arsip
           </h2>
           <p className="text-ink-mute text-[12px] md:text-[14px] mt-0.5">
              Cari dan kelola seluruh arsip korporasi yang terdaftar di database.
           </p>
        </div>
        
        {/* Actions header */}
        <div className="flex flex-wrap items-center gap-3">
           <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input 
                 type="text" 
                 placeholder="Search" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-canvas border border-hairline text-[13px] rounded-xs pl-9 pr-4 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink" 
              />
           </div>

           {/* Status Filter Dropdown */}
           <div className="relative w-full md:w-auto flex items-center gap-2 border border-hairline rounded-xs px-2.5 py-2 bg-canvas hover:border-hairline-strong transition-colors">
              <Filter size={14} className="text-ink-mute" />
              <select 
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="bg-transparent border-none text-[13px] text-ink font-medium outline-none pr-6 cursor-pointer"
              >
                 <option value="Semua">Semua Status</option>
                 <option value="Aktif">Berkas Aktif</option>
                 <option value="Inaktif">Berkas Inaktif</option>
                 <option value="Permanen">Berkas Permanen</option>
                 <option value="Dinilai Kembali">Dinilai Kembali</option>
                 <option value="Ditinjau Kembali">Ditinjau Kembali</option>
                 <option value="Upaya Pemusnahan">Upaya Pemusnahan</option>
                 <option value="Dimusnahkan">Dimusnahkan</option>
                 <option value="Menunggu ACC">Menunggu ACC</option>
              </select>
           </div>

           {/* Export Excel Button (Only for Admins) */}
           {role !== 'user' && (
              <button 
                 onClick={handleExportExcel}
                 className="btn-outline flex items-center justify-center gap-2 py-2 px-3 text-[13px] border border-hairline-strong rounded-sm hover:bg-canvas-soft transition-colors w-full md:w-auto"
              >
                 <Download size={15} /> Export Excel
              </button>
           )}
           
           {/* Add button only visible to Admins */}
           {role !== 'user' && (
             <button 
                onClick={() => setShowAddForm(true)}
                className="bg-[#e4e4e7] hover:bg-[#d4d4d8] text-[14px] text-ink font-medium px-4 py-2 rounded-sm transition-colors border border-hairline-strong w-full md:w-auto text-center"
             >
                Tambah Berkas
             </button>
           )}
        </div>
      </div>

      {/* FLAT TABLE */}
      <div className="border border-hairline bg-canvas rounded-xs overflow-x-auto">
         <table className="w-full text-left text-[12px] border-collapse min-w-[1250px]">
            <thead>
               <tr className="bg-canvas-soft border-b border-hairline text-ink font-semibold">
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Kode Klasifikasi</th>
                  <th className="p-3">Jenis Berkas</th>
                  <th className="p-3">Judul Berkas</th>
                  <th className="p-3">Departemen</th>
                  <th className="p-3 text-center">Tahun</th>
                  <th className="p-3 text-center">Tanggal Terima</th>
                  <th className="p-3">Jangka Waktu Aktif</th>
                  <th className="p-3 text-center">Gedung</th>
                  <th className="p-3 text-center">Lorong</th>
                  <th className="p-3">Rak</th>
                  <th className="p-3 text-center">Berkas Digital</th>
                  <th className="p-3 text-center">Status</th>
                  {role !== 'user' && <th className="p-3 text-center">Aksi</th>}
               </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
               {filteredArchives.length > 0 ? (
                  filteredArchives.map((archive) => (
                     <tr key={archive.no} className="hover:bg-canvas-soft/50 transition-colors text-ink">
                        <td className="p-3 text-center font-mono text-ink-mute">{archive.no}</td>
                        <td className="p-3 font-medium">{archive.kodeKlasifikasi}</td>
                        <td className="p-3 text-ink-mute">{archive.jenisBerkas}</td>
                        <td className="p-3 font-medium text-ink">{archive.judulBerkas}</td>
                        <td className="p-3"><span className="font-mono text-xs bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink">{archive.departemen}</span></td>
                        <td className="p-3 text-center font-mono">{archive.tahun}</td>
                        <td className="p-3 text-center font-mono">{archive.tanggalTerima}</td>
                        <td className="p-3 text-ink-mute">{archive.jangkaWaktu}</td>
                        <td className="p-3 text-center font-mono font-medium">{archive.gedung || "-"}</td>
                        <td className="p-3 text-center font-mono">{archive.lorong || "-"}</td>
                        <td className="p-3 text-[11px] font-medium">{archive.rak || "-"}</td>
                        <td className="p-3 text-center">
                           <a 
                              href={archive.linkBerkas} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1 text-primary hover:underline hover:text-primary-deep font-semibold"
                           >
                              <ExternalLink size={13} /> Buka
                           </a>
                        </td>
                        <td className="p-3 text-center">
                           <span className={`border text-[11px] px-2 py-0.5 rounded-full font-medium ${
                              archive.status === 'Aktif' 
                              ? 'bg-[#def7ec] text-[#03543f] border-[#bdf5db]' 
                              : archive.status === 'Inaktif'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : archive.status === 'Permanen'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : archive.status === 'Menunggu ACC'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-red-50 text-red-700 border-red-200'
                           }`}>
                              {archive.status}
                           </span>
                        </td>
                        {role !== 'user' && (
                           <td className="p-3">
                              <div className="flex items-center justify-center gap-2">
                                 <button className="p-1 hover:text-primary rounded-xs transition-colors" title="Edit">
                                    <Edit3 size={14} className="text-ink-mute hover:text-ink" />
                                 </button>
                                 <button className="p-1 hover:text-primary rounded-xs transition-colors" title="Hapus">
                                    <Trash2 size={14} className="text-primary" />
                                 </button>
                              </div>
                           </td>
                        )}
                     </tr>
                  ))
               ) : (
                  <tr>
                     <td colSpan={role === 'user' ? 13 : 14} className="p-8 text-center text-ink-mute text-[14px]">
                        Tidak ada arsip berkas yang cocok dengan filter atau kata kunci pencarian.
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center text-ink-mute text-[13px] pt-2">
         <span>Showing 1-{filteredArchives.length} of {filteredArchives.length}</span>
         <div className="flex gap-1.5">
            <button className="px-2.5 py-1 bg-canvas-soft border border-hairline rounded-sm text-ink-mute cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 bg-primary text-on-primary rounded-sm font-medium">1</button>
            <button className="px-2.5 py-1 bg-canvas border border-hairline rounded-sm text-ink hover:bg-canvas-soft">Next</button>
         </div>
      </div>

    </div>
  );
}
