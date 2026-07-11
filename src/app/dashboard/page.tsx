"use client";
import { useState, useEffect } from "react";
import { useRole } from "@/components/RoleContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  Clock, 
  Archive, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  ArrowLeft, 
  Link as LinkIcon, 
  Check, 
  Edit3, 
  Trash2,
  ExternalLink,
  Download,
  UserCheck,
  UserX,
  Users,
  Key,
  Calendar,
  BookOpen,
  MapPin,
  X
} from "lucide-react";

export default function Dashboard() {
  const { role, user, activeMenu, setActiveMenu } = useRole();
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [approvalLocation, setApprovalLocation] = useState({
     gedung: "A",
     lorong: "",
     rak: ""
  });

  // Modal Detail States
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);
  const [detailType, setDetailType] = useState<"archive" | "user" | "request" | null>(null);

  // Users List State for Manajemen User (PIC Gedung ONLY)
  const [usersList, setUsersList] = useState<any[]>([
     { id: "1", name: "Adrian Bahri", email: "adrian@sementonasa.co.id", role: "admin_dept", approved: true, created_at: "2026-07-10T10:00:00Z" },
     { id: "2", name: "Syukur", email: "syukur@sementonasa.co.id", role: "pic_gedung", approved: true, created_at: "2026-07-09T09:00:00Z" },
     { id: "3", name: "Budi Santoso", email: "budi@sementonasa.co.id", role: "user", approved: false, created_at: "2026-07-11T03:00:00Z" },
     { id: "4", name: "Dewi Lestari", email: "dewi@sementonasa.co.id", role: "user", approved: false, created_at: "2026-07-11T03:15:00Z" }
  ]);

  // Layanan Peminjaman & Kunjungan State
  const [requestsList, setRequestsList] = useState<any[]>([
     { id: "req-1", user_name: "Adrian Bahri", type: "peminjaman", archive_title: "BUKTI-BUKTI / DOKUMEN TRANSAKSI - EXISTING (332)", date: "2026-07-12", time_or_return: "2026-07-19", purpose: "Pemeriksaan Audit Internal Keuangan", status: "Menunggu ACC", created_at: "2026-07-11T03:00:00Z" },
     { id: "req-2", user_name: "Budi Santoso", type: "kunjungan", archive_title: null, date: "2026-07-14", time_or_return: "10:00 WITA", purpose: "Penelitian Struktur Gedung Arsip A", status: "Disetujui", created_at: "2026-07-11T04:10:00Z" }
  ]);

  const [serviceFormData, setServiceFormData] = useState({
     type: "peminjaman",
     archive_title: "",
     date: "",
     time_or_return: "",
     purpose: ""
  });

  // Self password change states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

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

  // Mock / state database records
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

  // Fetch from Supabase
  const fetchArchives = async () => {
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { data, error } = await supabase
              .from('archives')
              .select('*')
              .order('no', { ascending: true });
           
           if (!error && data && data.length > 0) {
              const formatted = data.map(item => ({
                 no: item.no ? String(item.no).padStart(2, '0') : String(item.id).substring(0, 4),
                 kodeKlasifikasi: item.kode_klasifikasi,
                 jenisBerkas: item.jenis_berkas,
                 judulBerkas: item.judul_berkas,
                 departemen: item.departemen,
                 tahun: item.tahun,
                 tanggalTerima: item.tanggal_terima,
                 jangkaWaktu: item.jangka_waktu,
                 gedung: item.gedung || "",
                 lorong: item.lorong || "",
                 rak: item.rak || "",
                 status: item.status,
                 linkBerkas: item.link_berkas
              }));
              setArchives(formatted);
           }
        }
     } catch (e) {
        console.warn("Supabase fetch failed, using mock data fallback:", e);
     }
  };

  // Fetch Users for PIC Gedung
  const fetchUsers = async () => {
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .order('created_at', { ascending: false });
           
           if (!error && data) {
              setUsersList(data);
           }
        }
     } catch (e) {
        console.warn("Failed to fetch profiles from Supabase, using mock fallback:", e);
     }
  };

  // Fetch Peminjaman & Kunjungan Requests
  const fetchRequests = async () => {
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { data, error } = await supabase
              .from('requests')
              .select('*')
              .order('created_at', { ascending: false });
           
           if (!error && data) {
              setRequestsList(data);
           }
        }
     } catch (err) {
        console.warn("Failed to fetch requests from Supabase, using mock fallback:", err);
     }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
     const savedSession = localStorage.getItem("arsip_session");
     if (!savedSession && !user) {
        router.push("/login");
     } else {
        fetchArchives();
     }
  }, [user, router]);

  // Fetch profiles list when PIC navigates to Manajemen User
  useEffect(() => {
     if (activeMenu === "Manajemen User" && role === 'pic_gedung') {
        fetchUsers();
     }
     if (activeMenu === "Layanan Arsip") {
        fetchRequests();
     }
  }, [activeMenu, role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     const { name, value } = e.target;
     setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
     const { name, value } = e.target;
     setServiceFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, value } = e.target;
     setApprovalLocation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     const statusVal = role === 'pic_gedung' ? "Aktif" : "Menunggu ACC";
     const deptVal = role === 'admin_dept' ? 'KEUANGAN' : formData.departemen;

     const payload = {
        kode_klasifikasi: formData.kodeKlasifikasi,
        jenis_berkas: formData.jenisBerkas,
        judul_berkas: formData.judulBerkas,
        departemen: deptVal,
        tahun: formData.tahun,
        tanggal_terima: formData.tanggalTerima,
        jangkaWaktu: formData.jangkaWaktu,
        gedung: role === 'pic_gedung' ? formData.gedung : null,
        lorong: role === 'pic_gedung' ? formData.lorong : null,
        rak: role === 'pic_gedung' ? formData.rak : null,
        status: statusVal,
        link_berkas: formData.linkBerkas
     };

     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase
              .from('archives')
              .insert([payload]);
           
           if (!error) {
              supabaseSuccess = true;
           } else {
              console.error("Supabase insert error:", error);
           }
        }
     } catch (err) {
        console.warn("Supabase insertion skipped, falling back to mock insert:", err);
     }

     if (supabaseSuccess) {
        setSuccessMessage(role === 'pic_gedung' ? "Arsip berhasil disimpan di Database!" : "Pengajuan dikirim ke Database!");
        fetchArchives();
     } else {
        const newRecord = {
           no: (archives.length + 1).toString().padStart(2, '0'),
           kodeKlasifikasi: formData.kodeKlasifikasi,
           jenisBerkas: formData.jenisBerkas,
           judulBerkas: formData.judulBerkas,
           departemen: deptVal,
           tahun: formData.tahun,
           tanggalTerima: formData.tanggalTerima,
           jangkaWaktu: formData.jangkaWaktu,
           gedung: role === 'pic_gedung' ? formData.gedung : "",
           lorong: role === 'pic_gedung' ? formData.lorong : "",
           rak: role === 'pic_gedung' ? formData.rak : "",
           status: statusVal,
           linkBerkas: formData.linkBerkas
        };
        setArchives(prev => [...prev, newRecord]);
        setSuccessMessage(role === 'pic_gedung' ? "Arsip disimpan (Simulasi)!" : "Pengajuan terkirim (Simulasi)!");
     }
     
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
     }, 1500);
  };

  const handleApprove = (no: string) => {
     setSelectedApprovalId(no);
  };

  const submitApproval = async (e: React.FormEvent) => {
     e.preventDefault();
     let supabaseSuccess = false;

     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const isNoNumeric = !isNaN(Number(selectedApprovalId));
           const queryField = isNoNumeric ? 'no' : 'id';
           const queryVal = isNoNumeric ? Number(selectedApprovalId) : selectedApprovalId;

           const { error } = await supabase
              .from('archives')
              .update({
                 gedung: approvalLocation.gedung,
                 lorong: approvalLocation.lorong,
                 rak: approvalLocation.rak,
                 status: "Aktif"
              })
              .eq(queryField, queryVal);

           if (!error) {
              supabaseSuccess = true;
           }
        }
     } catch (err) {
        console.warn(err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Status berkas diperbarui di database!");
        fetchArchives();
     } else {
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
        setSuccessMessage("Status berkas diperbarui (Simulasi)!");
     }

     setSelectedApprovalId(null);
     setApprovalLocation({ gedung: "A", lorong: "", rak: "" });
     setTimeout(() => setSuccessMessage(""), 1500);
  };

  const handleReject = async (no: string) => {
     let supabaseSuccess = false;

     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const isNoNumeric = !isNaN(Number(no));
           const queryField = isNoNumeric ? 'no' : 'id';
           const queryVal = isNoNumeric ? Number(no) : no;

           const { error } = await supabase
              .from('archives')
              .update({ status: "Ditolak" })
              .eq(queryField, queryVal);

           if (!error) {
              supabaseSuccess = true;
           }
        }
     } catch (err) {
        console.warn(err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Pengajuan ditolak di database.");
        fetchArchives();
     } else {
        setArchives(prev => prev.map(item => {
           if (item.no === no) {
              return { ...item, status: "Ditolak" };
           }
           return item;
        }));
        setSuccessMessage("Pengajuan ditolak (Simulasi).");
     }
     setTimeout(() => setSuccessMessage(""), 1500);
  };

  // Approve User Registration (PIC Gedung ONLY)
  const handleApproveUser = async (userId: string) => {
     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase
              .from('profiles')
              .update({ approved: true })
              .eq('id', userId);
           
           if (!error) {
              supabaseSuccess = true;
           }
        }
     } catch (err) {
        console.error(err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Pendaftaran pengguna disetujui (ACC)!");
        fetchUsers();
     } else {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, approved: true } : u));
        setSuccessMessage("Pendaftaran disetujui (Simulasi)!");
     }
     setTimeout(() => setSuccessMessage(""), 1500);
  };

  // Reject / Delete user registration request (PIC Gedung ONLY)
  const handleRejectUser = async (userId: string) => {
     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase
              .from('profiles')
              .delete()
              .eq('id', userId);
           
           if (!error) {
              supabaseSuccess = true;
           }
        }
     } catch (err) {
        console.error(err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Pendaftaran pengguna ditolak & dihapus!");
        fetchUsers();
     } else {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        setSuccessMessage("Pendaftaran ditolak (Simulasi)!");
     }
     setTimeout(() => setSuccessMessage(""), 1500);
  };

  // Reset User Password (PIC Gedung ONLY)
  const handleResetUserPassword = (name: string, email: string) => {
     setSuccessMessage(`Sukses! Kata sandi untuk ${name} (${email}) berhasil di-reset menjadi kata sandi bawaan: 'Tonasa123'. Silakan infokan ke pengguna.`);
     setTimeout(() => setSuccessMessage(""), 6000);
  };

  // Layanan Peminjaman & Kunjungan: Submit Request
  const handleCreateServiceRequest = async (e: React.FormEvent) => {
     e.preventDefault();
     
     const payload = {
        user_name: user?.name || "Staf Tonasa",
        type: serviceFormData.type,
        archive_title: serviceFormData.type === "peminjaman" ? serviceFormData.archive_title : null,
        date: serviceFormData.date,
        time_or_return: serviceFormData.time_or_return,
        purpose: serviceFormData.purpose,
        status: "Menunggu ACC"
     };

     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase
              .from('requests')
              .insert([payload]);
           if (!error) supabaseSuccess = true;
        }
     } catch (err) {
        console.warn("Supabase insertion skipped, fallback:", err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Pengajuan peminjaman/kunjungan berhasil terkirim!");
        fetchRequests();
     } else {
        const newReq = {
           id: "req-" + (requestsList.length + 1),
           user_name: user?.name || "Staf Tonasa",
           type: serviceFormData.type,
           archive_title: serviceFormData.type === "peminjaman" ? serviceFormData.archive_title : "-",
           date: serviceFormData.date,
           time_or_return: serviceFormData.time_or_return,
           purpose: serviceFormData.purpose,
           status: "Menunggu ACC",
           created_at: new Date().toISOString()
        };
        setRequestsList(prev => [newReq, ...prev]);
        setSuccessMessage("Pengajuan berhasil dikirim (Simulasi)!");
     }

     setServiceFormData({
        type: "peminjaman",
        archive_title: "",
        date: "",
        time_or_return: "",
        purpose: ""
     });
     setShowServiceForm(false);
     setTimeout(() => setSuccessMessage(""), 2000);
  };

  // Layanan Peminjaman & Kunjungan: Actions (PIC ONLY)
  const handleApproveRequest = async (reqId: string) => {
     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase
              .from('requests')
              .update({ status: 'Disetujui' })
              .eq('id', reqId);
           if (!error) supabaseSuccess = true;
        }
     } catch (err) {
        console.error(err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Pengajuan disetujui!");
        fetchRequests();
     } else {
        setRequestsList(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Disetujui' } : r));
        setSuccessMessage("Pengajuan disetujui (Simulasi)!");
     }
     setTimeout(() => setSuccessMessage(""), 1500);
  };

  const handleRejectRequest = async (reqId: string) => {
     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase
              .from('requests')
              .update({ status: 'Ditolak' })
              .eq('id', reqId);
           if (!error) supabaseSuccess = true;
        }
     } catch (err) {
        console.error(err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Pengajuan ditolak!");
        fetchRequests();
     } else {
        setRequestsList(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Ditolak' } : r));
        setSuccessMessage("Pengajuan ditolak (Simulasi)!");
     }
     setTimeout(() => setSuccessMessage(""), 1500);
  };

  const handleCompleteRequest = async (reqId: string) => {
     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase
              .from('requests')
              .update({ status: 'Selesai' })
              .eq('id', reqId);
           if (!error) supabaseSuccess = true;
        }
     } catch (err) {
        console.error(err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Status peminjaman ditandai Selesai (Berkas Kembali)!");
        fetchRequests();
     } else {
        setRequestsList(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Selesai' } : r));
        setSuccessMessage("Status peminjaman Selesai (Simulasi)!");
     }
     setTimeout(() => setSuccessMessage(""), 1500);
  };

  // Update Logged-in User's Own Password
  const handleUpdateSelfPassword = async (e: React.FormEvent) => {
     e.preventDefault();
     setPasswordError("");
     setSuccessMessage("");

     if (newPassword.length < 6) {
        setPasswordError("Kata sandi baru minimal harus 6 karakter.");
        return;
     }

     if (newPassword !== confirmPassword) {
        setPasswordError("Konfirmasi kata sandi baru tidak cocok.");
        return;
     }

     setIsSavingPassword(true);
     let supabaseSuccess = false;
     
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase.auth.updateUser({
              password: newPassword
           });

           if (!error) {
              supabaseSuccess = true;
           } else {
              setPasswordError(error.message);
           }
        }
     } catch (err: any) {
        console.warn("Supabase password update skipped, fallback to mock:", err);
     }

     setIsSavingPassword(false);

     if (supabaseSuccess) {
        setSuccessMessage("Kata sandi Anda berhasil diperbarui di database!");
        setNewPassword("");
        setConfirmPassword("");
     } else {
        setSuccessMessage("Kata sandi Anda berhasil diperbarui (Mode Simulasi)!");
        setNewPassword("");
        setConfirmPassword("");
     }

     setTimeout(() => setSuccessMessage(""), 4000);
  };

  const filteredArchives = archives.filter(item => {
     const matchesStatus = statusFilter === "Semua" || item.status === statusFilter;
     const matchesSearch = 
        item.judulBerkas.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.kodeKlasifikasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.departemen.toLowerCase().includes(searchQuery.toLowerCase());
     return matchesStatus && matchesSearch;
  });

  const getRoleName = (r: string) => {
     if (r === 'pic_gedung') return 'Admin PIC Gedung';
     if (r === 'admin_dept') return 'Admin Departemen';
     return 'Staf Biasa';
  };

  // Helper stats calculation
  const getStats = () => {
     const active = archives.filter(item => item.status === 'Aktif').length;
     const inactive = archives.filter(item => item.status === 'Inaktif').length;
     return {
        pic_gedung: { total: archives.length, active, inactive },
        admin_dept: { total: archives.filter(i => i.departemen === 'KEUANGAN').length, active: archives.filter(i => i.departemen === 'KEUANGAN' && i.status === 'Aktif').length, inactive: archives.filter(i => i.departemen === 'KEUANGAN' && i.status === 'Inaktif').length },
        user: { total: archives.length, active, inactive }
     };
  };
  const stats = getStats();

  // Reactive Stats per Department for the Chart
  const getDeptStats = () => {
     const depts = ["KEUANGAN", "PERLENGKAPAN", "HRD", "LEGAL"];
     return depts.map(dept => {
        const count = archives.filter(item => item.departemen.toUpperCase() === dept).length;
        return { name: dept, count };
     });
  };
  const deptStats = getDeptStats();
  const maxDeptCount = Math.max(...deptStats.map(d => d.count), 1);

  // EXPORT EXCEL (CSV)
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

  const closeDetailModal = () => {
     setSelectedDetailItem(null);
     setDetailType(null);
  };

  const renderDetailModal = () => {
     if (!selectedDetailItem || !detailType) return null;

     const submitApprovalFromModal = async (no: string) => {
        let supabaseSuccess = false;
        try {
           const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
           if (!isMockUrl) {
              const isNoNumeric = !isNaN(Number(no));
              const queryField = isNoNumeric ? 'no' : 'id';
              const queryVal = isNoNumeric ? Number(no) : no;

              const { error } = await supabase
                 .from('archives')
                 .update({
                    gedung: approvalLocation.gedung,
                    lorong: approvalLocation.lorong,
                    rak: approvalLocation.rak,
                    status: "Aktif"
                 })
                 .eq(queryField, queryVal);

              if (!error) {
                 supabaseSuccess = true;
              }
           }
        } catch (err) {
           console.warn(err);
        }

        if (supabaseSuccess) {
           setSuccessMessage("Status berkas diperbarui di database!");
           fetchArchives();
        } else {
           setArchives(prev => prev.map(item => {
              if (item.no === no) {
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
           setSuccessMessage("Status berkas diperbarui (Simulasi)!");
        }

        closeDetailModal();
        setApprovalLocation({ gedung: "A", lorong: "", rak: "" });
        setTimeout(() => setSuccessMessage(""), 1500);
     };

     const renderFooterActions = () => {
        if (detailType === 'archive' && selectedDetailItem.status === 'Menunggu ACC' && role === 'pic_gedung') {
           return (
              <div className="flex gap-2 w-full md:w-auto">
                 <button 
                    onClick={async (e) => {
                       e.preventDefault();
                       await submitApprovalFromModal(selectedDetailItem.no);
                    }}
                    className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xs text-[13px]"
                 >
                    Setujui & Simpan Lokasi
                 </button>
                 <button 
                    onClick={async (e) => {
                       e.preventDefault();
                       await handleReject(selectedDetailItem.no);
                       closeDetailModal();
                    }}
                    className="flex-1 md:flex-none border border-hairline hover:bg-red-50 text-ink-mute hover:text-primary font-medium px-4 py-2 rounded-xs text-[13px]"
                 >
                    Tolak Pengajuan
                 </button>
              </div>
           );
        }

        if (detailType === 'user' && role === 'pic_gedung') {
           if (!selectedDetailItem.approved) {
              return (
                 <div className="flex gap-2 w-full md:w-auto">
                    <button 
                       onClick={async () => {
                          await handleApproveUser(selectedDetailItem.id);
                          closeDetailModal();
                       }}
                       className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xs text-[13px] flex items-center justify-center gap-1.5"
                    >
                       <UserCheck size={14} /> ACC Akses
                    </button>
                    <button 
                       onClick={async () => {
                          await handleRejectUser(selectedDetailItem.id);
                          closeDetailModal();
                       }}
                       className="flex-1 md:flex-none border border-hairline hover:bg-red-50 hover:text-primary text-ink-mute font-medium px-4 py-2 rounded-xs text-[13px] flex items-center justify-center gap-1.5"
                    >
                       <UserX size={14} /> Tolak
                    </button>
                 </div>
              );
           } else if (selectedDetailItem.email !== user?.email) {
              return (
                 <div className="flex gap-2 w-full md:w-auto">
                    <button 
                       onClick={() => {
                          handleResetUserPassword(selectedDetailItem.name, selectedDetailItem.email);
                          closeDetailModal();
                       }}
                       className="flex-1 md:flex-none bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-xs text-[13px] flex items-center justify-center gap-1.5 font-semibold"
                    >
                       <Key size={14} /> Reset Password
                    </button>
                    <button 
                       onClick={async () => {
                          await handleRejectUser(selectedDetailItem.id);
                          closeDetailModal();
                       }}
                       className="flex-1 md:flex-none border border-hairline hover:bg-red-50 hover:text-primary text-ink-mute py-2 px-4 rounded-xs text-[13px] flex items-center justify-center gap-1.5"
                    >
                       <Trash2 size={14} /> Cabut Akses
                    </button>
                 </div>
              );
           }
        }

        if (detailType === 'request' && role === 'pic_gedung') {
           if (selectedDetailItem.status === 'Menunggu ACC') {
              return (
                 <div className="flex gap-2 w-full md:w-auto">
                    <button 
                       onClick={async () => {
                          await handleApproveRequest(selectedDetailItem.id);
                          closeDetailModal();
                       }}
                       className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xs text-[13px]"
                    >
                       Setujui
                    </button>
                    <button 
                       onClick={async () => {
                          await handleRejectRequest(selectedDetailItem.id);
                          closeDetailModal();
                       }}
                       className="flex-1 md:flex-none border border-hairline hover:bg-red-50 text-ink-mute hover:text-primary font-medium px-4 py-2 rounded-xs text-[13px]"
                    >
                       Tolak
                    </button>
                 </div>
              );
           } else if (selectedDetailItem.status === 'Disetujui' && selectedDetailItem.type === 'peminjaman') {
              return (
                 <button 
                    onClick={async () => {
                       await handleCompleteRequest(selectedDetailItem.id);
                       closeDetailModal();
                    }}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xs text-[13px]"
                 >
                    Kembali (Selesai)
                 </button>
              );
           }
        }

        return null;
     };

     return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-canvas border border-hairline rounded-sm shadow-2xl max-w-[550px] w-full relative overflow-hidden text-ink animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-hairline flex items-center justify-between bg-canvas-soft">
                 <h3 className="font-semibold text-[15px] tracking-tight text-ink flex items-center gap-2">
                    {detailType === 'archive' && <FileText size={18} className="text-primary" />}
                    {detailType === 'user' && <Users size={18} className="text-primary" />}
                    {detailType === 'request' && <Calendar size={18} className="text-primary" />}
                    Detail {detailType === 'archive' ? 'Berkas Arsip' : detailType === 'user' ? 'Informasi User' : 'Pengajuan Layanan'}
                 </h3>
                 <button 
                    onClick={closeDetailModal}
                    className="p-1 hover:bg-hairline rounded-full text-ink-mute hover:text-ink transition-colors"
                 >
                    <X size={18} />
                  </button>
               </div>

               {/* Modal Body */}
               <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  {/* ARCHIVE DETAIL VIEW */}
                  {detailType === 'archive' && (
                     <div className="space-y-4">
                        <div>
                           <span className="text-[11px] font-mono bg-hairline-cool px-2 py-0.5 rounded-xs text-ink">{selectedDetailItem.kodeKlasifikasi}</span>
                           <h4 className="text-[17px] font-bold text-ink mt-2">{selectedDetailItem.judulBerkas}</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-hairline pt-4 text-[13px]">
                           <div>
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Jenis Berkas</p>
                              <p className="font-medium text-ink mt-0.5">{selectedDetailItem.jenisBerkas}</p>
                           </div>
                           <div>
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Departemen</p>
                              <p className="font-medium text-ink mt-0.5">{selectedDetailItem.departemen}</p>
                           </div>
                           <div>
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Tahun Berkas</p>
                              <p className="font-mono text-ink mt-0.5">{selectedDetailItem.tahun}</p>
                           </div>
                           <div>
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Tanggal Terima</p>
                              <p className="font-mono text-ink mt-0.5">{selectedDetailItem.tanggalTerima}</p>
                           </div>
                           <div>
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Jangka Waktu</p>
                              <p className="font-medium text-ink mt-0.5">{selectedDetailItem.jangkaWaktu}</p>
                           </div>
                           <div>
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Status Berkas</p>
                              <span className={`inline-block border text-[11px] px-2 py-0.5 rounded-full font-medium mt-1 ${
                                 selectedDetailItem.status === 'Aktif' 
                                 ? 'bg-[#def7ec] text-[#03543f] border-[#bdf5db]' 
                                 : selectedDetailItem.status === 'Inaktif'
                                 ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                 : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                 {selectedDetailItem.status}
                              </span>
                           </div>
                        </div>

                        {selectedDetailItem.status === 'Menunggu ACC' && role === 'pic_gedung' ? (
                           <div className="border-t border-hairline pt-4 space-y-3">
                              <h5 className="text-[12px] font-bold text-ink uppercase tracking-wider">Tentukan Lokasi Fisik Penyimpanan</h5>
                              <div className="grid grid-cols-3 gap-3">
                                 <div>
                                    <label className="block text-[10px] font-semibold text-ink mb-1">Gedung</label>
                                    <input 
                                       type="text"
                                       value={approvalLocation.gedung}
                                       onChange={(e) => setApprovalLocation(prev => ({ ...prev, gedung: e.target.value }))}
                                       placeholder="e.g. A"
                                       className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-ink text-ink font-mono"
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-[10px] font-semibold text-ink mb-1">Lorong</label>
                                    <input 
                                       type="text"
                                       value={approvalLocation.lorong}
                                       onChange={(e) => setApprovalLocation(prev => ({ ...prev, lorong: e.target.value }))}
                                       placeholder="e.g. 20"
                                       className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-ink text-ink font-mono"
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-[10px] font-semibold text-ink mb-1">Rak</label>
                                    <input 
                                       type="text"
                                       value={approvalLocation.rak}
                                       onChange={(e) => setApprovalLocation(prev => ({ ...prev, rak: e.target.value }))}
                                       placeholder="e.g. RAK G"
                                       className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-ink text-ink font-mono"
                                    />
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="border-t border-hairline pt-4 space-y-3">
                              <h5 className="text-[12px] font-bold text-ink uppercase tracking-wider">Lokasi Fisik Penyimpanan</h5>
                              <div className="grid grid-cols-3 gap-3 text-center bg-canvas-soft border border-hairline p-3 rounded-xs">
                                 <div>
                                    <p className="text-ink-mute text-[10px] uppercase font-semibold">Gedung</p>
                                    <p className="text-[14px] font-bold text-ink mt-0.5">{selectedDetailItem.gedung || "-"}</p>
                                 </div>
                                 <div>
                                    <p className="text-ink-mute text-[10px] uppercase font-semibold">Lorong</p>
                                    <p className="text-[14px] font-bold text-ink mt-0.5">{selectedDetailItem.lorong || "-"}</p>
                                 </div>
                                 <div>
                                    <p className="text-ink-mute text-[10px] uppercase font-semibold">Rak</p>
                                    <p className="text-[14px] font-bold text-ink mt-0.5 truncate px-1">{selectedDetailItem.rak || "-"}</p>
                                 </div>
                              </div>
                           </div>
                        )}

                        <div className="border-t border-hairline pt-4">
                           <a 
                              href={selectedDetailItem.linkBerkas} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="w-full inline-flex items-center justify-center gap-2 border border-hairline hover:bg-canvas-soft text-[14px] font-semibold py-2.5 rounded-xs transition-colors text-ink"
                           >
                              <ExternalLink size={16} /> Buka Berkas Digital (Drive)
                           </a>
                        </div>
                     </div>
                  )}

                  {/* USER DETAIL VIEW */}
                  {detailType === 'user' && (
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-full border border-hairline overflow-hidden">
                              <img 
                                 src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedDetailItem.name}`} 
                                 alt="Avatar" 
                                 className="w-full h-full object-cover"
                              />
                           </div>
                           <div>
                              <h4 className="text-[18px] font-bold text-ink">{selectedDetailItem.name}</h4>
                              <p className="text-ink-mute text-[13px] font-mono mt-0.5">{selectedDetailItem.email}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-hairline pt-4 text-[13px]">
                           <div>
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Jabatan Peran</p>
                              <p className="font-semibold text-ink mt-0.5 capitalize">{selectedDetailItem.role === 'pic_gedung' ? 'PIC Gedung' : selectedDetailItem.role === 'admin_dept' ? 'Admin Departemen' : 'Staf Biasa'}</p>
                           </div>
                           <div>
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Status ACC</p>
                              <span className={`inline-block border text-[11px] px-2 py-0.5 rounded-full font-medium mt-1 ${
                                 selectedDetailItem.approved 
                                 ? 'bg-[#def7ec] text-[#03543f] border-[#bdf5db]' 
                                 : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                 {selectedDetailItem.approved ? 'Disetujui' : 'Menunggu ACC'}
                              </span>
                           </div>
                           {selectedDetailItem.created_at && (
                              <div className="col-span-2">
                                 <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Tanggal Pendaftaran</p>
                                 <p className="font-mono text-ink mt-0.5">{new Date(selectedDetailItem.created_at).toLocaleString('id-ID')}</p>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* REQUEST / LAYANAN ARSIP DETAIL VIEW */}
                  {detailType === 'request' && (
                     <div className="space-y-4">
                        <div>
                           <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-xs uppercase ${
                              selectedDetailItem.type === 'peminjaman' ? 'bg-blue-50 text-blue-800' : 'bg-purple-50 text-purple-800'
                           }`}>
                              {selectedDetailItem.type}
                           </span>
                           <h4 className="text-[17px] font-bold text-ink mt-2">
                              {selectedDetailItem.type === 'peminjaman' ? selectedDetailItem.archive_title : "Kunjungan Gedung Kearsipan"}
                           </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-hairline pt-4 text-[13px]">
                           <div>
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Nama Pemohon</p>
                              <p className="font-medium text-ink mt-0.5">{selectedDetailItem.user_name}</p>
                           </div>
                           <div>
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Status</p>
                              <span className={`inline-block border text-[11px] px-2 py-0.5 rounded-full font-medium mt-1 ${
                                 selectedDetailItem.status === 'Disetujui' 
                                 ? 'bg-[#def7ec] text-[#03543f] border-[#bdf5db]' 
                                 : selectedDetailItem.status === 'Selesai'
                                 ? 'bg-blue-50 text-blue-700 border-blue-100'
                                 : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                 {selectedDetailItem.status}
                              </span>
                           </div>
                           <div className="col-span-2">
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">
                                 {selectedDetailItem.type === 'peminjaman' ? 'Rentang Tanggal Peminjaman' : 'Tanggal & Waktu Kunjungan'}
                              </p>
                              <p className="font-mono text-ink mt-0.5">
                                 {selectedDetailItem.type === 'peminjaman' 
                                    ? `${selectedDetailItem.date} s/d ${selectedDetailItem.time_or_return}`
                                    : `${selectedDetailItem.date} (${selectedDetailItem.time_or_return})`}
                              </p>
                           </div>
                           <div className="col-span-2">
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Tujuan / Keperluan</p>
                              <p className="text-ink mt-1 bg-canvas-soft border border-hairline p-3 rounded-xs whitespace-pre-wrap">{selectedDetailItem.purpose}</p>
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Modal Footer with relocated Action Buttons */}
               <div className="px-6 py-4 border-t border-hairline flex flex-col md:flex-row items-center justify-between gap-3 bg-canvas-soft">
                  {renderFooterActions()}
                  <button 
                     type="button"
                     onClick={closeDetailModal}
                     className="btn-outline w-full md:w-auto text-center"
                  >
                     Tutup Detail
                  </button>
               </div>
            </div>
         </div>
     );
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

  // 1.5 LAYANAN PEMINJAMAN / KUNJUNGAN FORM VIEW (NEW FORM FOR USERS)
  if (showServiceForm) {
     return (
        <div className="space-y-6 max-w-[600px] mx-auto pb-10">
           <div className="pb-4 border-b border-hairline flex items-center gap-4">
              <button 
                 onClick={() => setShowServiceForm(false)} 
                 className="p-1.5 hover:bg-canvas-soft rounded-xs border border-hairline text-ink transition-colors"
              >
                 <ArrowLeft size={18} />
              </button>
              <div>
                 <h2 className="text-[18px] md:text-display-md font-medium tracking-tight text-ink">
                    Buat Pengajuan Layanan Kearsipan
                 </h2>
                 <p className="text-ink-mute text-[12px] md:text-[14px]">
                    Lengkapi formulir untuk mengajukan peminjaman fisik dokumen atau kunjungan ke ruang arsip Semen Tonasa.
                 </p>
              </div>
           </div>

           <form onSubmit={handleCreateServiceRequest} className="bg-canvas border border-hairline rounded-sm p-6 md:p-8 space-y-5">
              <div className="space-y-1.5">
                 <label className="block text-[13px] font-medium text-ink">Jenis Layanan</label>
                 <select 
                    name="type"
                    value={serviceFormData.type}
                    onChange={handleServiceInputChange}
                    className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2.5 focus:outline-none focus:border-ink text-ink"
                 >
                    <option value="peminjaman">Peminjaman Berkas Fisik</option>
                    <option value="kunjungan">Kunjungan Gedung/Ruang Arsip</option>
                 </select>
              </div>

              {serviceFormData.type === 'peminjaman' ? (
                 <>
                    <div className="space-y-1.5">
                       <label className="block text-[13px] font-medium text-ink">Judul & Kode Berkas Yang Ingin Dipinjam</label>
                       <input 
                          type="text" 
                          name="archive_title"
                          required
                          value={serviceFormData.archive_title}
                          onChange={handleServiceInputChange}
                          placeholder="e.g. Bukti Pembayaran Payment Register (PR-332)"
                          className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2.5 focus:outline-none focus:border-ink text-ink"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="block text-[13px] font-medium text-ink">Tanggal Peminjaman</label>
                          <input 
                             type="date" 
                             name="date"
                             required
                             value={serviceFormData.date}
                             onChange={handleServiceInputChange}
                             className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink font-mono"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="block text-[13px] font-medium text-ink">Rencana Tanggal Pengembalian</label>
                          <input 
                             type="date" 
                             name="time_or_return"
                             required
                             value={serviceFormData.time_or_return}
                             onChange={handleServiceInputChange}
                             className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink font-mono"
                          />
                       </div>
                    </div>
                 </>
              ) : (
                 <>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="block text-[13px] font-medium text-ink">Tanggal Kunjungan</label>
                          <input 
                             type="date" 
                             name="date"
                             required
                             value={serviceFormData.date}
                             onChange={handleServiceInputChange}
                             className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink font-mono"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="block text-[13px] font-medium text-ink">Waktu Kunjungan (Jam)</label>
                          <input 
                             type="text" 
                             name="time_or_return"
                             required
                             value={serviceFormData.time_or_return}
                             onChange={handleServiceInputChange}
                             placeholder="e.g. 10:00 WITA"
                             className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink"
                          />
                       </div>
                    </div>
                 </>
              )}

              <div className="space-y-1.5">
                 <label className="block text-[13px] font-medium text-ink">Tujuan / Keperluan Pengajuan</label>
                 <textarea 
                    name="purpose"
                    required
                    value={serviceFormData.purpose}
                    onChange={handleServiceInputChange}
                    rows={3}
                    placeholder="Tuliskan tujuan peminjaman atau kunjungan secara detail..."
                    className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink"
                 ></textarea>
              </div>

              <div className="pt-4 border-t border-hairline flex justify-end gap-3">
                 <button 
                    type="button" 
                    onClick={() => setShowServiceForm(false)} 
                    className="btn-outline"
                 >
                    Batal
                 </button>
                 <button 
                    type="submit" 
                    className="btn-primary"
                 >
                    Kirim Pengajuan
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

           {/* Desktop Table View */}
           <div className="hidden md:block border border-hairline bg-canvas rounded-xs overflow-x-auto">
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
                          <tr 
                             key={archive.no} 
                             onClick={(e) => {
                                if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
                                setSelectedDetailItem(archive);
                                setDetailType("archive");
                             }}
                             className="hover:bg-canvas-soft/50 transition-colors text-ink cursor-pointer"
                          >
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

           {/* Mobile Card List View (Mobile First Design) */}
           <div className="block md:hidden space-y-4">
              {pendingSubmissions.length > 0 ? (
                 pendingSubmissions.map((archive) => (
                    <div 
                       key={archive.no}
                       onClick={() => {
                          setSelectedDetailItem(archive);
                          setDetailType("archive");
                       }}
                       className="bg-canvas border border-hairline rounded-sm p-4 space-y-3 hover:border-hairline-strong transition-colors cursor-pointer"
                    >
                       <div className="flex justify-between items-start">
                          <div>
                             <span className="font-mono text-[10px] bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink">{archive.kodeKlasifikasi}</span>
                             <h4 className="font-bold text-[14px] text-ink mt-1.5">{archive.judulBerkas}</h4>
                             <p className="text-[12px] text-ink-mute mt-0.5">{archive.jenisBerkas}</p>
                          </div>
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-medium">
                             {archive.status}
                          </span>
                       </div>
                       <div className="flex items-center justify-between text-[11px] border-t border-hairline pt-3">
                          <div>
                             <p className="text-ink-mute">Dept: <span className="font-medium text-ink">{archive.departemen}</span></p>
                             <p className="text-ink-mute mt-0.5">Tahun: <span className="font-mono text-ink">{archive.tahun}</span></p>
                          </div>
                          <a 
                             href={archive.linkBerkas} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             onClick={(e) => e.stopPropagation()}
                             className="text-primary hover:underline font-semibold flex items-center gap-1"
                          >
                             <ExternalLink size={12} /> Lihat Berkas
                          </a>
                       </div>
                       <div className="flex gap-2 pt-2 border-t border-hairline">
                          <button 
                             onClick={(e) => { e.stopPropagation(); handleApprove(archive.no); }}
                             className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-sm text-[12px] text-center"
                          >
                             ACC
                          </button>
                          <button 
                             onClick={(e) => { e.stopPropagation(); handleReject(archive.no); }}
                             className="flex-1 border border-hairline hover:bg-red-50 text-ink-mute hover:text-primary font-medium py-2 rounded-sm text-[12px] text-center"
                          >
                             Tolak
                          </button>
                       </div>
                    </div>
                 ))
              ) : (
                 <div className="p-8 text-center text-ink-mute text-[14px] bg-canvas border border-hairline rounded-sm">
                    Tidak ada pengajuan berkas masuk saat ini.
                 </div>
              )}
           </div>
           {renderDetailModal()}
        </div>
     );
  }

  // 2.5 LAYANAN ARSIP (PEMINJAMAN & KUNJUNGAN LIST VIEW FOR ALL ROLES)
  if (activeMenu === "Layanan Arsip") {
     return (
        <div className="space-y-6 max-w-full mx-auto pb-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h2 className="text-[18px] md:text-[28px] font-medium tracking-tight text-ink">
                    Layanan Peminjaman & Kunjungan Arsip
                 </h2>
                 <p className="text-ink-mute text-[12px] md:text-[14px] mt-1">
                    {role === 'pic_gedung' 
                     ? "Kelola permohonan peminjaman dokumen fisik dan registrasi kunjungan gedung kearsipan."
                     : "Lihat status pengajuan peminjaman berkas atau buat pengajuan kunjungan fisik baru."}
                 </p>
              </div>

              {role !== 'pic_gedung' && (
                 <button 
                    onClick={() => setShowServiceForm(true)}
                    className="bg-primary hover:bg-primary-deep text-[14px] text-on-primary font-semibold px-4 py-2.5 rounded-sm transition-colors flex items-center gap-2 self-start md:self-auto"
                 >
                    <Plus size={16} /> Buat Pengajuan Layanan
                 </button>
              )}
           </div>

           {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm p-4 flex items-center gap-3">
                 <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                    <Check size={14} strokeWidth={3} />
                 </div>
                 <span className="text-[14px] font-medium leading-relaxed">{successMessage}</span>
              </div>
           )}

           {/* Desktop Table View */}
           <div className="hidden md:block border border-hairline bg-canvas rounded-xs overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse min-w-[850px]">
                 <thead>
                    <tr className="bg-canvas-soft border-b border-hairline text-ink font-semibold">
                       <th className="p-3 w-16 text-center">No</th>
                       <th className="p-3">Pemohon</th>
                       <th className="p-3">Jenis Layanan</th>
                       <th className="p-3">Detail Berkas / Rencana</th>
                       <th className="p-3 text-center">Tanggal / Waktu</th>
                       <th className="p-3">Keperluan</th>
                       <th className="p-3 text-center">Status</th>
                       {role === 'pic_gedung' && <th className="p-3 text-center">Tindakan</th>}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-hairline">
                    {requestsList.length > 0 ? (
                       requestsList.map((req, idx) => (
                          <tr 
                             key={req.id} 
                             onClick={(e) => {
                                if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
                                setSelectedDetailItem(req);
                                setDetailType("request");
                             }}
                             className="hover:bg-canvas-soft/50 transition-colors text-ink cursor-pointer"
                          >
                             <td className="p-3 text-center font-mono text-ink-mute">{idx + 1}</td>
                             <td className="p-3 font-semibold text-ink">{req.user_name}</td>
                             <td className="p-3">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-xs capitalize ${
                                   req.type === 'peminjaman' 
                                   ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                   : 'bg-purple-50 text-purple-700 border border-purple-100'
                                }`}>
                                   {req.type === 'peminjaman' ? <BookOpen size={12} /> : <MapPin size={12} />}
                                   {req.type}
                                </span>
                             </td>
                             <td className="p-3 font-medium text-ink max-w-[250px] truncate">
                                {req.type === 'peminjaman' ? req.archive_title : "Kunjungan Gedung Arsip"}
                             </td>
                             <td className="p-3 text-center font-mono text-ink-mute">
                                {req.type === 'peminjaman' 
                                 ? `${req.date} s/d ${req.time_or_return}` 
                                 : `${req.date} (${req.time_or_return})`}
                             </td>
                             <td className="p-3 text-ink-mute max-w-[200px] truncate" title={req.purpose}>{req.purpose}</td>
                             <td className="p-3 text-center">
                                <span className={`border text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                   req.status === 'Disetujui' 
                                   ? 'bg-[#def7ec] text-[#03543f] border-[#bdf5db]' 
                                   : req.status === 'Selesai'
                                   ? 'bg-blue-50 text-blue-700 border-blue-100'
                                   : req.status === 'Menunggu ACC'
                                   ? 'bg-amber-50 text-amber-700 border-amber-200'
                                   : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                   {req.status}
                                </span>
                             </td>
                             {role === 'pic_gedung' && (
                                <td className="p-3">
                                   <div className="flex items-center justify-center gap-2">
                                      {req.status === 'Menunggu ACC' ? (
                                         <>
                                            <button 
                                               onClick={() => handleApproveRequest(req.id)}
                                               className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2 py-1 rounded-sm text-[11px]"
                                            >
                                               Setujui
                                            </button>
                                            <button 
                                               onClick={() => handleRejectRequest(req.id)}
                                               className="border border-hairline hover:bg-red-50 text-ink-mute hover:text-primary font-medium px-2 py-1 rounded-sm text-[11px]"
                                            >
                                               Tolak
                                            </button>
                                         </>
                                      ) : req.status === 'Disetujui' && req.type === 'peminjaman' ? (
                                         <button 
                                            onClick={() => handleCompleteRequest(req.id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-1 rounded-sm text-[11px]"
                                         >
                                            Kembali (Selesai)
                                         </button>
                                      ) : (
                                         <span className="text-[11px] text-ink-mute-2 font-mono">-</span>
                                      )}
                                   </div>
                                </td>
                             )}
                          </tr>
                       ))
                    ) : (
                       <tr>
                          <td colSpan={role === 'pic_gedung' ? 8 : 7} className="p-8 text-center text-ink-mute text-[14px]">
                             Tidak ada riwayat pengajuan layanan saat ini.
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>

           {/* Mobile Card List View (Mobile First Design) */}
           <div className="block md:hidden space-y-3">
              {requestsList.length > 0 ? (
                 requestsList.map((req, idx) => (
                    <div 
                       key={req.id}
                       onClick={() => {
                          setSelectedDetailItem(req);
                          setDetailType("request");
                       }}
                       className="bg-canvas border border-hairline rounded-sm p-4 space-y-3 hover:border-hairline-strong transition-colors cursor-pointer"
                    >
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="font-semibold text-[14px] text-ink">{req.user_name}</h4>
                             <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-xs capitalize mt-1 ${
                                req.type === 'peminjaman' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                             }`}>
                                {req.type === 'peminjaman' ? <BookOpen size={10} /> : <MapPin size={10} />}
                                {req.type}
                             </span>
                          </div>
                          <span className={`border text-[10px] px-2 py-0.5 rounded-full font-medium ${
                             req.status === 'Disetujui' ? 'bg-[#def7ec] text-[#03543f]' : req.status === 'Selesai' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                             {req.status}
                          </span>
                       </div>
                       <div className="text-[12px] text-ink border-t border-hairline pt-2.5">
                          <p className="font-semibold text-ink-mute text-[9px] uppercase">Detail Pengajuan:</p>
                          <p className="font-medium mt-0.5 truncate">{req.type === 'peminjaman' ? req.archive_title : "Kunjungan Gedung Arsip"}</p>
                          <p className="text-ink-mute font-mono text-[11px] mt-1">
                             {req.type === 'peminjaman' ? `Sewa: ${req.date} s/d ${req.time_or_return}` : `Jadwal: ${req.date} (${req.time_or_return})`}
                          </p>
                       </div>
                       {role === 'pic_gedung' && (
                          <div className="flex gap-2 pt-2 border-t border-hairline">
                             {req.status === 'Menunggu ACC' ? (
                                <>
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); handleApproveRequest(req.id); }}
                                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 rounded-sm text-[11px]"
                                   >
                                      Setujui
                                   </button>
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); handleRejectRequest(req.id); }}
                                      className="flex-1 border border-hairline hover:bg-red-50 text-ink-mute hover:text-primary font-medium py-1.5 rounded-sm text-[11px]"
                                   >
                                      Tolak
                                   </button>
                                </>
                             ) : req.status === 'Disetujui' && req.type === 'peminjaman' ? (
                                <button 
                                   onClick={(e) => { e.stopPropagation(); handleCompleteRequest(req.id); }}
                                   className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 rounded-sm text-[11px]"
                                >
                                   Kembali (Selesai)
                                </button>
                             ) : (
                                <span className="text-[11px] text-ink-mute-2 w-full text-center py-1 font-mono">-</span>
                             )}
                          </div>
                       )}
                    </div>
                 ))
              ) : (
                 <div className="p-8 text-center text-ink-mute text-[14px] bg-canvas border border-hairline rounded-sm">
                    Tidak ada riwayat pengajuan layanan saat ini.
                 </div>
              )}
            </div>
            {renderDetailModal()}
         </div>
     );
  }

  // 3. PERSETUJUAN USER / MANAJEMEN USER (PIC Gedung ONLY)
  if (activeMenu === "Manajemen User" && role === 'pic_gedung') {
     const pendingUsers = usersList.filter(u => !u.approved);
     const approvedUsers = usersList.filter(u => u.approved);

     return (
        <div className="space-y-8 max-w-full mx-auto pb-10">
           <div>
              <h2 className="text-[18px] md:text-[28px] font-medium tracking-tight text-ink">
                 Manajemen & Persetujuan Pengguna
              </h2>
              <p className="text-ink-mute text-[12px] md:text-[14px] mt-1">
                 Berikan persetujuan akses (ACC) bagi staf departemen yang mendaftar baru serta kelola akun pengguna aktif.
              </p>
           </div>

           {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm p-4 flex items-center gap-3">
                 <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                    <Check size={14} strokeWidth={3} />
                 </div>
                 <span className="text-[14px] font-medium leading-relaxed">{successMessage}</span>
              </div>
           )}

           {/* SECTION 1: MENUNGGU PERSETUJUAN */}
           <div className="space-y-3">
              <h3 className="text-[14px] font-semibold text-ink flex items-center gap-2">
                 <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                 Menunggu Persetujuan ({pendingUsers.length})
              </h3>
              
              {/* Desktop View */}
              <div className="hidden md:block border border-hairline bg-canvas rounded-xs overflow-x-auto">
                 <table className="w-full text-left text-[12px] border-collapse min-w-[700px]">
                    <thead>
                       <tr className="bg-canvas-soft border-b border-hairline text-ink font-semibold">
                          <th className="p-3">Nama Lengkap</th>
                          <th className="p-3">Email Instansi</th>
                          <th className="p-3">Jabatan Diajukan</th>
                          <th className="p-3 text-center">Tanggal Daftar</th>
                          <th className="p-3 text-center">Tindakan</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                       {pendingUsers.length > 0 ? (
                          pendingUsers.map((item) => (
                             <tr 
                                key={item.id} 
                                onClick={(e) => {
                                   if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
                                   setSelectedDetailItem(item);
                                   setDetailType("user");
                                }}
                                className="hover:bg-canvas-soft/50 transition-colors text-ink cursor-pointer"
                             >
                                <td className="p-3 font-medium text-ink">{item.name}</td>
                                <td className="p-3 font-mono text-ink-mute">{item.email}</td>
                                <td className="p-3">
                                   <span className="font-mono text-xs bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink capitalize">
                                      {item.role === 'admin_dept' ? 'Admin Departemen' : 'Staf Biasa'}
                                   </span>
                                </td>
                                <td className="p-3 text-center text-ink-mute font-mono">
                                   {new Date(item.created_at).toLocaleDateString('id-ID')}
                                </td>
                                <td className="p-3">
                                   <div className="flex items-center justify-center gap-2">
                                      <button 
                                         onClick={() => handleApproveUser(item.id)}
                                         className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1 rounded-sm text-[11px] flex items-center gap-1"
                                      >
                                         <UserCheck size={12} /> ACC Akses
                                      </button>
                                      <button 
                                         onClick={() => handleRejectUser(item.id)}
                                         className="border border-hairline hover:bg-red-50 hover:text-primary text-ink-mute font-medium px-3 py-1 rounded-sm text-[11px] flex items-center gap-1"
                                      >
                                         <UserX size={12} /> Tolak
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))
                       ) : (
                          <tr>
                             <td colSpan={5} className="p-6 text-center text-ink-mute text-[13px]">
                                Tidak ada pendaftaran pengguna baru yang menunggu persetujuan saat ini.
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>

              {/* Mobile Card List View (Mobile First Design) */}
              <div className="block md:hidden space-y-3">
                 {pendingUsers.length > 0 ? (
                    pendingUsers.map((item) => (
                       <div 
                          key={item.id}
                          onClick={() => {
                             setSelectedDetailItem(item);
                             setDetailType("user");
                          }}
                          className="bg-canvas border border-hairline rounded-sm p-4 space-y-3 hover:border-hairline-strong transition-colors cursor-pointer"
                       >
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full border border-hairline overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${item.name}`} alt="Avatar" className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-[14px] text-ink truncate">{item.name}</h4>
                                <p className="font-mono text-[11px] text-ink-mute truncate">{item.email}</p>
                             </div>
                             <span className="font-mono text-[10px] bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink capitalize">
                                {item.role === 'admin_dept' ? 'Admin Departemen' : 'Staf Biasa'}
                             </span>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-hairline">
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleApproveUser(item.id); }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-sm text-[11px] flex items-center justify-center gap-1"
                             >
                                <UserCheck size={12} /> ACC Akses
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleRejectUser(item.id); }}
                                className="flex-1 border border-hairline hover:bg-red-50 hover:text-primary text-ink-mute font-medium py-2 rounded-sm text-[11px] flex items-center justify-center gap-1"
                             >
                                <UserX size={12} /> Tolak
                             </button>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="p-6 text-center text-ink-mute text-[13px] bg-canvas border border-hairline rounded-sm">
                       Tidak ada pendaftaran pengguna baru yang menunggu persetujuan.
                    </div>
                 )}
              </div>
           </div>

           {/* SECTION 2: PENGGUNA AKTIF */}
           <div className="space-y-3 pt-4">
              <h3 className="text-[14px] font-semibold text-ink flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                 Daftar Pengguna Aktif ({approvedUsers.length})
              </h3>
              
              {/* Desktop View */}
              <div className="hidden md:block border border-hairline bg-canvas rounded-xs overflow-x-auto">
                 <table className="w-full text-left text-[12px] border-collapse min-w-[700px]">
                    <thead>
                       <tr className="bg-canvas-soft border-b border-hairline text-ink font-semibold">
                          <th className="p-3">Nama Lengkap</th>
                          <th className="p-3">Email Instansi</th>
                          <th className="p-3">Jabatan</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-center">Tindakan</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                       {approvedUsers.map((item) => (
                          <tr 
                             key={item.id} 
                             onClick={(e) => {
                                if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
                                setSelectedDetailItem(item);
                                setDetailType("user");
                             }}
                             className="hover:bg-canvas-soft/50 transition-colors text-ink cursor-pointer"
                          >
                             <td className="p-3 font-medium text-ink">{item.name}</td>
                             <td className="p-3 font-mono text-ink-mute">{item.email}</td>
                             <td className="p-3">
                                <span className="font-mono text-xs bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink capitalize">
                                   {item.role === 'pic_gedung' ? 'Admin PIC Gedung' : item.role === 'admin_dept' ? 'Admin Departemen' : 'Staf Biasa'}
                                </span>
                             </td>
                             <td className="p-3 text-center">
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                   Aktif (Disetujui)
                                </span>
                             </td>
                             <td className="p-3">
                                <div className="flex items-center justify-center gap-3">
                                   {item.role !== 'pic_gedung' ? (
                                      <>
                                         <button 
                                            onClick={() => handleResetUserPassword(item.name, item.email)}
                                            className="p-1 text-ink-mute hover:text-amber-700 transition-colors"
                                            title="Reset Password Pengguna"
                                         >
                                            <Key size={14} className="text-amber-600 hover:text-amber-800" />
                                         </button>
                                         <button 
                                            onClick={() => handleRejectUser(item.id)}
                                            className="p-1 text-ink-mute hover:text-primary transition-colors"
                                            title="Cabut Akses Pengguna"
                                         >
                                            <Trash2 size={14} />
                                         </button>
                                      </>
                                   ) : (
                                      <span className="text-[10px] text-ink-mute-2 font-mono">-</span>
                                   )}
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* Mobile Card List View (Mobile First Design) */}
              <div className="block md:hidden space-y-3">
                 {approvedUsers.map((item) => (
                    <div 
                       key={item.id}
                       onClick={() => {
                          setSelectedDetailItem(item);
                          setDetailType("user");
                       }}
                       className="bg-canvas border border-hairline rounded-sm p-4 space-y-3 hover:border-hairline-strong transition-colors cursor-pointer"
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border border-hairline overflow-hidden">
                             <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${item.name}`} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-semibold text-[14px] text-ink truncate">{item.name}</h4>
                             <p className="font-mono text-[11px] text-ink-mute truncate">{item.email}</p>
                             <span className="font-mono text-[9px] bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink capitalize mt-1 inline-block">
                                {item.role === 'pic_gedung' ? 'Admin PIC Gedung' : item.role === 'admin_dept' ? 'Admin Departemen' : 'Staf Biasa'}
                             </span>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-2 py-0.5 rounded-full font-medium">
                             Aktif
                          </span>
                       </div>
                       {item.role !== 'pic_gedung' && (
                          <div className="flex gap-2 pt-2 border-t border-hairline">
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleResetUserPassword(item.name, item.email); }}
                                className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 py-1.5 rounded-sm text-[11px] flex items-center justify-center gap-1.5"
                                title="Reset Password"
                             >
                                <Key size={12} /> Reset Password
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleRejectUser(item.id); }}
                                className="flex-1 border border-hairline hover:bg-red-50 hover:text-primary text-ink-mute py-1.5 rounded-sm text-[11px] flex items-center justify-center gap-1.5"
                                title="Cabut Akses"
                             >
                                <Trash2 size={12} /> Cabut Akses
                             </button>
                          </div>
                       )}
                    </div>
                 ))}
               </div>
               {renderDetailModal()}
           </div>

        </div>
     );
  }

  // 3.5 VIEW: GANTI PASSWORD MANDIRI (NEW VIEW FOR ALL ROLES)
  if (activeMenu === "Ganti Password") {
     return (
        <div className="space-y-6 max-w-[500px] mx-auto pb-10">
           <div>
              <h2 className="text-[18px] md:text-[28px] font-medium tracking-tight text-ink">
                 Ganti Kata Sandi
              </h2>
              <p className="text-ink-mute text-[12px] md:text-[14px] mt-1">
                 Perbarui kata sandi keamanan akun kearsipan Anda secara mandiri.
              </p>
           </div>

           {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm p-4 flex items-center gap-3">
                 <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                    <Check size={14} strokeWidth={3} />
                 </div>
                 <span className="text-[14px] font-medium leading-relaxed">{successMessage}</span>
              </div>
           )}

           {passwordError && (
              <div className="bg-red-50 border border-red-200 text-primary text-[13px] rounded-xs p-3">
                 {passwordError}
              </div>
           )}

           <form onSubmit={handleUpdateSelfPassword} className="bg-canvas border border-hairline rounded-sm p-6 space-y-4">
              <div className="space-y-1.5">
                 <label className="block text-[13px] font-medium text-ink">Kata Sandi Baru</label>
                 <input 
                    type="password" 
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2.5 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                 />
              </div>

              <div className="space-y-1.5">
                 <label className="block text-[13px] font-medium text-ink">Konfirmasi Kata Sandi Baru</label>
                 <input 
                    type="password" 
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2.5 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                 />
              </div>

              <button 
                 type="submit" 
                 disabled={isSavingPassword}
                 className="w-full bg-primary hover:bg-primary-deep text-on-primary py-2.5 rounded-xs text-[14px] font-semibold transition-colors mt-2 disabled:opacity-50"
              >
                 {isSavingPassword ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
              </button>
           </form>
        </div>
     );
  }

  // 4. VIEW: DASHBOARD (HOME SCREEN FOR ADMINS)
  if (activeMenu === "Dashboard" && role !== 'user') {
     const pendingCount = archives.filter(item => item.status === "Menunggu ACC").length;
     const pendingUsersCount = usersList.filter(u => !u.approved).length;
     const pendingRequestsCount = requestsList.filter(r => r.status === "Menunggu ACC").length;
     
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

           {/* Alerts for Pending Submissions and Pending User Approvals */}
           <div className="space-y-3">
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

              {role === 'pic_gedung' && pendingRequestsCount > 0 && (
                 <div className="bg-purple-50 border border-purple-200 text-purple-800 rounded-sm p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                       <Calendar className="text-purple-600" />
                       <div>
                          <h3 className="font-semibold text-sm">Permohonan Layanan Peminjaman & Kunjungan</h3>
                          <p className="text-xs text-purple-700 mt-0.5">Ada {pendingRequestsCount} pengajuan peminjaman/kunjungan dari staf yang membutuhkan persetujuan.</p>
                       </div>
                    </div>
                    <button 
                       onClick={() => setActiveMenu("Layanan Arsip")}
                       className="bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-semibold text-[12px] px-3.5 py-1.5 rounded-sm transition-colors"
                    >
                       Tinjau Layanan
                    </button>
                 </div>
              )}

              {role === 'pic_gedung' && pendingUsersCount > 0 && (
                 <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-sm p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                       <Users className="text-blue-600" />
                       <div>
                          <h3 className="font-semibold text-sm">Pendaftaran Anggota Baru</h3>
                          <p className="text-xs text-blue-700 mt-0.5">Ada {pendingUsersCount} pengguna baru terdaftar yang memerlukan persetujuan (ACC) akses dari Anda.</p>
                       </div>
                    </div>
                    <button 
                       onClick={() => setActiveMenu("Manajemen User")}
                       className="bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 font-semibold text-[12px] px-3.5 py-1.5 rounded-sm transition-colors"
                    >
                       Aktivasi User
                    </button>
                 </div>
              )}
           </div>

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

           {/* STATS CHART CARD (REPLACES RECENT ARCHIVES LIST) */}
           <div className="bg-canvas border border-hairline rounded-sm p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-hairline">
                 <div>
                    <h3 className="text-[15px] font-bold text-ink tracking-tight">Statistik Arsip per Departemen</h3>
                    <p className="text-[12px] text-ink-mute">Perbandingan jumlah dokumen kearsipan yang tersimpan aktif di dalam sistem.</p>
                 </div>
                 <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-mute bg-canvas-soft border border-hairline px-2.5 py-1 rounded-xs">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Total Berkas
                 </div>
              </div>

              {/* Grid Bar Chart with custom rich styling */}
              <div className="space-y-5">
                 {deptStats.map((dept) => {
                    const percentage = (dept.count / maxDeptCount) * 100;
                    return (
                       <div key={dept.name} className="space-y-1.5 group">
                          <div className="flex justify-between items-center text-[12px]">
                             <span className="font-semibold text-ink group-hover:text-primary transition-colors tracking-tight">{dept.name}</span>
                             <span className="font-mono font-bold text-ink bg-canvas-soft border border-hairline px-2 py-0.5 rounded-xs text-[11px]">{dept.count} Berkas</span>
                          </div>
                          <div className="w-full h-8 bg-canvas-soft border border-hairline rounded-xs overflow-hidden relative">
                             {/* Animated Gradient Bar Fill */}
                             <div 
                                style={{ width: `${percentage}%` }} 
                                className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500 ease-out flex items-center justify-end px-3 relative min-w-[20px]"
                             >
                                {percentage > 12 && (
                                   <span className="text-[10px] font-extrabold text-white relative z-10 font-mono">
                                      {Math.round(percentage)}%
                                   </span>
                                )}
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
     );
  }

  // 4. VIEW: DAFTAR ARSIP GENERAL PAGE
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

           {role !== 'user' && (
              <button 
                 onClick={handleExportExcel}
                 className="btn-outline flex items-center justify-center gap-2 py-2 px-3 text-[13px] border border-hairline-strong rounded-sm hover:bg-canvas-soft transition-colors w-full md:w-auto"
              >
                 <Download size={15} /> Export Excel
              </button>
           )}
           
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

      {/* Desktop Table View */}
      <div className="hidden md:block border border-hairline bg-canvas rounded-xs overflow-x-auto">
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
                     <tr 
                        key={archive.no} 
                        onClick={(e) => {
                           if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
                           setSelectedDetailItem(archive);
                           setDetailType("archive");
                        }}
                        className="hover:bg-canvas-soft/50 transition-colors text-ink cursor-pointer"
                     >
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

      {/* Mobile Card List View (Mobile First Design) */}
      <div className="block md:hidden space-y-3">
         {filteredArchives.length > 0 ? (
            filteredArchives.map((archive) => (
               <div 
                  key={archive.no}
                  onClick={() => {
                     setSelectedDetailItem(archive);
                     setDetailType("archive");
                  }}
                  className="bg-canvas border border-hairline rounded-sm p-4 space-y-3 hover:border-hairline-strong transition-colors cursor-pointer"
               >
                  <div className="flex justify-between items-start">
                     <div>
                        <span className="font-mono text-[10px] bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink">{archive.kodeKlasifikasi}</span>
                        <h4 className="font-bold text-[14px] text-ink mt-1">{archive.judulBerkas}.pdf</h4>
                     </div>
                     <span className={`border text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        archive.status === 'Aktif' 
                        ? 'bg-[#def7ec] text-[#03543f] border-[#bdf5db]' 
                        : archive.status === 'Inaktif'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                     }`}>
                        {archive.status}
                     </span>
                  </div>
                  <div className="text-[12px] text-ink border-t border-hairline pt-2.5 grid grid-cols-2 gap-2">
                     <div>
                        <p className="text-ink-mute text-[9px] uppercase">Departemen</p>
                        <p className="font-medium text-[11px] mt-0.5">{archive.departemen}</p>
                     </div>
                     <div>
                        <p className="text-ink-mute text-[9px] uppercase">Tahun</p>
                        <p className="font-mono text-[11px] mt-0.5">{archive.tahun}</p>
                     </div>
                     <div className="col-span-2">
                        <p className="text-ink-mute text-[9px] uppercase">Letak Fisik Penyimpanan</p>
                        <p className="font-medium text-[11px] mt-0.5">Gedung {archive.gedung || "-"} / Lorong {archive.lorong || "-"} / {archive.rak || "-"}</p>
                     </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-hairline">
                     <a 
                        href={archive.linkBerkas} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary hover:underline font-semibold text-[11px] flex items-center gap-1"
                     >
                        <ExternalLink size={12} /> Buka Berkas
                     </a>
                     {role !== 'user' && (
                        <div className="flex gap-2">
                           <button 
                              onClick={(e) => { e.stopPropagation(); }} 
                              className="flex items-center gap-1 border border-hairline hover:bg-canvas-soft px-2 py-1 rounded-xs text-[10px] text-ink font-medium"
                           >
                              <Edit3 size={10} /> Edit
                           </button>
                           <button 
                              onClick={(e) => { e.stopPropagation(); }} 
                              className="flex items-center gap-1 border border-transparent bg-red-50 hover:bg-red-100 text-primary px-2 py-1 rounded-xs text-[10px] font-medium"
                           >
                              <Trash2 size={10} /> Hapus
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            ))
         ) : (
            <div className="p-8 text-center text-ink-mute text-[14px] bg-canvas border border-hairline rounded-sm">
               Tidak ada arsip berkas yang cocok dengan filter atau pencarian.
            </div>
         )}
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

      {/* MODAL DIALOG DETAIL DENGAN BACKDROP BLUR (BACKDROP-BLUR OVERLAY) */}
      {renderDetailModal()}

    </div>
  );
}
