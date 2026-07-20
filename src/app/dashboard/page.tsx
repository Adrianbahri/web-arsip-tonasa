"use client";
import { useState, useEffect } from "react";
import { useRole } from "@/components/RoleContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import SettingsView from "@/components/SettingsView";
import AuditLogView from "@/components/AuditLogView";
import * as XLSX from "xlsx";
import { 
  FileText, 
  Clock,
  Upload, 
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
  X,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

const formatDate = (dateStr: string) => {
   if (!dateStr) return "-";
   const parts = dateStr.split("-");
   if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
   }
   return dateStr;
};

const StatusBadge = ({ status, alasanPenolakan, isSmall = false }: { status: string; alasanPenolakan?: string; isSmall?: boolean }) => {
   let colorClasses = "";
   switch (status) {
      case 'Aktif':
      case 'Disetujui':
         colorClasses = 'bg-[#def7ec] dark:bg-emerald-500/10 text-[#03543f] dark:text-emerald-400 border-[#bdf5db] dark:border-emerald-500/20';
         break;
      case 'Inaktif':
         colorClasses = 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
         break;
      case 'Permanen':
         colorClasses = 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
         break;
      case 'Selesai':
         colorClasses = 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
         break;
      case 'Menunggu ACC':
         colorClasses = 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-500/30';
         break;
      case 'Ditolak':
      default:
         colorClasses = 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20';
         break;
   }

   const textSize = isSmall ? 'text-[10px]' : 'text-[11px]';

   return (
      <div className={`flex flex-col ${isSmall ? 'items-end' : 'items-center'} gap-1`}>
         <span className={`border ${textSize} px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${colorClasses}`}>
            {status}
         </span>
         {status === 'Ditolak' && alasanPenolakan && (
            <span className={`text-[9px] text-red-600 font-sans ${isSmall ? 'max-w-[100px]' : 'max-w-[120px]'} truncate`} title={alasanPenolakan}>
               Alasan: {alasanPenolakan}
            </span>
         )}
      </div>
   );
};

export default function Dashboard() {
  const { role, user, activeMenu, setActiveMenu } = useRole();
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [departemenFilter, setDepartemenFilter] = useState<string[]>([]);
  const [showDeptFilter, setShowDeptFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  // Advanced Search Filters
  const [yearFilter, setYearFilter] = useState("");
  const [gedungFilter, setGedungFilter] = useState("");
  const [lorongFilter, setLorongFilter] = useState("");
  
  // Recycle Bin State
  const [isRecycleBin, setIsRecycleBin] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  useEffect(() => {
     setCurrentPage(1);
  }, [searchQuery, statusFilter, departemenFilter, yearFilter, gedungFilter, lorongFilter, sortConfig, isRecycleBin]);

  const handleSort = (key: string) => {
     let direction: 'ascending' | 'descending' = 'ascending';
     if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
     }
     setSortConfig({ key, direction });
  };

  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [approvalLocation, setApprovalLocation] = useState({
     gedung: "A",
     lorong: "",
     rak: "",
      baris: ""
  });

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [archiveToDelete, setArchiveToDelete] = useState<string | null>(null);

  const [deleteRequestModalOpen, setDeleteRequestModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [archiveToReject, setArchiveToReject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Modal Detail States
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);
  const [detailType, setDetailType] = useState<"archive" | "user" | "request" | null>(null);

  // Users List State for Manajemen User (PIC Gedung ONLY)
  const [usersList, setUsersList] = useState<any[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'user', password: '' });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState("");
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState<any>(null);
  const [newRole, setNewRole] = useState<string>("user");

  // Layanan Peminjaman & Kunjungan State
  const [requestsList, setRequestsList] = useState<any[]>([]);

  // Layanan Peminjaman & Kunjungan: Reject Modal State
  const [rejectServiceModalOpen, setRejectServiceModalOpen] = useState(false);
  const [serviceToReject, setServiceToReject] = useState<string | null>(null);
  const [serviceRejectReason, setServiceRejectReason] = useState("");

  const [serviceFormData, setServiceFormData] = useState({
     type: "peminjaman",
     archive_title: "",
     date: "",
     time_or_return: "",
     purpose: "",
     link_surat: ""
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
      baris: "",
     linkBerkas: "",
     status: "Menunggu ACC",
     keterangan: "",
     isiBundel: [] as string[]
  });
  
  const [newItemText, setNewItemText] = useState("");
  const [isCustomDept, setIsCustomDept] = useState(false);

  // Duplicate Check States
  const [duplicateAlertModalOpen, setDuplicateAlertModalOpen] = useState(false);
  const [foundDuplicateRecord, setFoundDuplicateRecord] = useState<any | null>(null);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  const [bulkDuplicateAlertModalOpen, setBulkDuplicateAlertModalOpen] = useState(false);
  const [bulkDuplicates, setBulkDuplicates] = useState<any[]>([]); // { duplicateRecord, newRecord }
  const [bulkNewRecords, setBulkNewRecords] = useState<any[]>([]); // purely new records

  // Helper Duplicate Check
  const findDuplicate = (record: any, isEditMode: boolean = false, currentNo?: string | number) => {
     return archives.find(item => {
        if (isEditMode && item.no === currentNo) return false;
        if (item.deleted_at) return false; // ignore deleted

        const isSameName = item.judulBerkas?.toLowerCase() === record.judulBerkas?.toLowerCase();
        const isSameType = item.jenisBerkas?.toLowerCase() === record.jenisBerkas?.toLowerCase();
        const isSameDept = item.departemen?.toLowerCase() === record.departemen?.toLowerCase();
        
        let isSameLocation = true;
        if (record.gedung || record.lorong || record.rak || record.baris) {
           isSameLocation = (item.gedung || '') === (record.gedung || '') &&
                            (item.lorong || '') === (record.lorong || '') &&
                            (item.rak || '') === (record.rak || '') &&
                            (item.baris || '') === (record.baris || '');
        }

        const normalizeArray = (arr: any) => {
           if (!Array.isArray(arr)) return [];
           return arr.map(a => String(a).toLowerCase().trim()).sort();
        };
        const isSameBundel = JSON.stringify(normalizeArray(item.isiBundel)) === JSON.stringify(normalizeArray(record.isiBundel));

        return isSameName && isSameType && isSameDept && isSameLocation && isSameBundel;
     });
  };


  const handleAddIsiBundel = () => {
     if (newItemText.trim()) {
        const itemsToAdd: string[] = [];
        
        const rawItems = newItemText.split(',').map(i => i.trim()).filter(i => i);
        
        for (const item of rawItems) {
            // Deteksi penggunaan "s/d" atau "-"
            const match = item.match(/^(.*?)\s+(?:s\/d|-)\s+(.*?)$/i);
            
            if (match) {
                const startStr = match[1];
                const endStr = match[2];
                
                const startMatch = startStr.match(/^(.*?)(\d+)$/);
                const endMatch = endStr.match(/^(.*?)(\d+)$/);
                
                if (startMatch && endMatch && startMatch[1] === endMatch[1]) {
                    const prefix = startMatch[1];
                    const startNum = parseInt(startMatch[2], 10);
                    const endNum = parseInt(endMatch[2], 10);
                    const count = Math.abs(endNum - startNum) + 1;
                    
                    if (count <= 20) {
                        // Expand jika jumlah item <= 20
                        if (startNum <= endNum) {
                            for (let i = startNum; i <= endNum; i++) {
                                const numStr = i.toString().padStart(startMatch[2].length, '0');
                                itemsToAdd.push(`${prefix}${numStr}`);
                            }
                        } else {
                             for (let i = startNum; i >= endNum; i--) {
                                const numStr = i.toString().padStart(startMatch[2].length, '0');
                                itemsToAdd.push(`${prefix}${numStr}`);
                             }
                        }
                    } else {
                        // Jangan expand jika lebih dari 20 item, gunakan format '-'
                        itemsToAdd.push(`${startStr} - ${endStr}`);
                    }
                } else {
                    itemsToAdd.push(item);
                }
            } else {
                itemsToAdd.push(item);
            }
        }

        setFormData(prev => ({
           ...prev,
           isiBundel: [...prev.isiBundel, ...itemsToAdd]
        }));
        setNewItemText("");
     }
  };

  const handleRemoveIsiBundel = (index: number) => {
     setFormData(prev => ({
        ...prev,
        isiBundel: prev.isiBundel.filter((_, i) => i !== index)
     }));
  };

  const logActivity = async (action: string, details: string) => {
     if (!user) return;
     try {
        await supabase.from('audit_logs').insert([{
           user_id: user.id,
           user_name: user.name || user.email,
           action,
           details
        }]);
     } catch (err) {
        console.error("Failed to log activity", err);
     }
  };

  // Edit Mode State
  const [editArchiveItem, setEditArchiveItem] = useState<any | null>(null);

  // Mock / state database records
  const [archives, setArchives] = useState<any[]>([]);
  const [masterDepartments, setMasterDepartments] = useState<string[]>(["KEUANGAN", "LEGAL", "HUMAS", "TONASA IV", "PENGADAAN", "PRODUKSI", "DIREKSI"]);
  const [masterLocations, setMasterLocations] = useState<any[]>([]);

  // Fetch from Supabase
  const fetchArchives = async () => {
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
            // Fetch Master Data
            const [deptRes, locRes] = await Promise.all([
               supabase.from('master_departments').select('name').order('name'),
               supabase.from('master_locations').select('*').order('gedung').order('lorong').order('rak')
            ]);
            
            if (deptRes.data && deptRes.data.length > 0) {
               setMasterDepartments(deptRes.data.map(d => d.name));
            }
            if (locRes.data) {
               setMasterLocations(locRes.data);
            }
            let allData: any[] = [];
            let from = 0;
            const step = 1000;
            let hasMore = true;
            let fetchError = false;

            while (hasMore) {
               const { data, error } = await supabase
                  .from('archives')
                  .select('*')
                  .order('no', { ascending: true })
                  .range(from, from + step - 1);
               
               if (error) {
                  console.error("Error fetching archives:", error);
                  fetchError = true;
                  break;
               }

               if (data && data.length > 0) {
                  allData = [...allData, ...data];
                  if (data.length < step) {
                     hasMore = false;
                  } else {
                     from += step;
                  }
               } else {
                  hasMore = false;
               }
            }
            
            if (!fetchError) {
               const formatted = allData.map(item => ({
                  id: item.id,
                  no: item.no ? String(item.no).padStart(2, '0') : String(item.id).substring(0, 4),
                  kodeKlasifikasi: item.kode_klasifikasi,
                  jenisBerkas: item.jenis_berkas,
                  judulBerkas: item.judul_berkas,
                  departemen: (() => {
                     const d = (item.departemen || "").trim().toUpperCase();
                     if (/^KEUANGA|KEUNGAN|KUANGAN|KEUANGAN\s*$/.test(d) || d.includes('KEUANG')) return 'KEUANGAN';
                     return d;
                  })(),
                  tahun: item.tahun,
                  tanggalTerima: item.tanggal_terima,
                  jangkaWaktu: item.jangka_waktu,
                  gedung: item.gedung || "",
                  lorong: item.lorong || "",
                  rak: item.rak || "",
                  baris: item.baris || "",
                  keterangan: item.keterangan || "",
                  isiBundel: item.isi_bundel ? (typeof item.isi_bundel === 'string' ? JSON.parse(item.isi_bundel) : item.isi_bundel) : [],
                  status: item.status,
                  linkBerkas: item.link_berkas,
                  alasanPenolakan: item.alasan_penolakan || ""
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
     if (activeMenu === "Manajemen User" && role === 'superadmin') {
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

    const handleSubmit = async (e?: React.FormEvent, bypassDuplicateCheck: boolean = false) => {
      if (e) e.preventDefault();
      
      const statusVal = (role === 'superadmin' || role === 'pic_gedung') ? 'Aktif' : 'Menunggu ACC';
      let deptVal = (formData.departemen || "").trim().toUpperCase();
      if (/^KEUANGA|KEUNGAN|KUANGAN|KEUANGAN\s*$/.test(deptVal) || deptVal.includes('KEUANG')) {
          deptVal = 'KEUANGAN';
      }

      // 1. Pengecekan Duplikat untuk Insert
      if (!editArchiveItem && !bypassDuplicateCheck) {
         const tempPayload = { ...formData, departemen: deptVal };
         const existingDup = findDuplicate(tempPayload, false);
         if (existingDup) {
            setFoundDuplicateRecord(existingDup);
            setPendingFormData(tempPayload);
            setDuplicateAlertModalOpen(true);
            return; // Pause submit
         }
      }

      if (editArchiveItem) {
         // UPDATE MODE
         const payload = {
            kode_klasifikasi: formData.kodeKlasifikasi,
            jenis_berkas: formData.jenisBerkas,
            judul_berkas: formData.judulBerkas,
            departemen: deptVal,
            tahun: formData.tahun,
            tanggal_terima: formData.tanggalTerima,
            jangka_waktu: formData.jangkaWaktu,
            gedung: formData.gedung,
            lorong: formData.lorong,
            rak: formData.rak,
            baris: formData.baris,
            status: formData.status,
            keterangan: formData.keterangan,
            isi_bundel: JSON.stringify(formData.isiBundel),
            link_berkas: formData.linkBerkas
         };

         let supabaseSuccess = false;
         try {
            const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('mock.supabase.co');
            if (!isMockUrl) {
               const no = editArchiveItem.no;
               const isNoNumeric = !isNaN(Number(no));
               const queryField = isNoNumeric ? 'no' : 'id';
               const queryVal = isNoNumeric ? Number(no) : no;

               const { error } = await supabase
                  .from('archives')
                  .update(payload)
                  .eq(queryField, queryVal);

               if (!error) {
                  supabaseSuccess = true;
               } else {
                  console.error('Supabase update error:', error);
               }
            }
         } catch (err) {
            console.warn('Supabase update failed:', err);
         }

         if (supabaseSuccess) {
            logActivity('EDIT_ARCHIVE', `Memperbarui arsip: ${formData.judulBerkas}`);
            setSuccessMessage('Arsip berhasil diperbarui di Database!');
            fetchArchives();
         } else {
            setArchives(prev => prev.map(item => {
               if (item.no === editArchiveItem.no) {
                  return {
                     ...item,
                     kodeKlasifikasi: formData.kodeKlasifikasi,
                     jenisBerkas: formData.jenisBerkas,
                     judulBerkas: formData.judulBerkas,
                     departemen: deptVal,
                     tahun: formData.tahun,
                     tanggalTerima: formData.tanggalTerima,
                     jangkaWaktu: formData.jangkaWaktu,
                     gedung: formData.gedung,
                     lorong: formData.lorong,
                     rak: formData.rak,
            baris: formData.baris,
                     status: formData.status,
                     keterangan: formData.keterangan,
                     isiBundel: formData.isiBundel,
                     linkBerkas: formData.linkBerkas
                  };
               }
               return item;
            }));
            setSuccessMessage('Arsip diperbarui (Simulasi)!');
         }
      } else {
         // INSERT MODE
         const payload = {
            kode_klasifikasi: formData.kodeKlasifikasi,
            jenis_berkas: formData.jenisBerkas,
            judul_berkas: formData.judulBerkas,
            departemen: deptVal,
            tahun: formData.tahun,
            tanggal_terima: formData.tanggalTerima,
            jangka_waktu: formData.jangkaWaktu,
            gedung: (role === 'superadmin' || role === 'pic_gedung') ? formData.gedung : null,
            lorong: (role === 'superadmin' || role === 'pic_gedung') ? formData.lorong : null,
            rak: (role === 'superadmin' || role === 'pic_gedung') ? formData.rak : null,
            baris: (role === 'superadmin' || role === 'pic_gedung') ? formData.baris : null,
            status: statusVal,
            keterangan: formData.keterangan,
            isi_bundel: JSON.stringify(formData.isiBundel),
            link_berkas: formData.linkBerkas
         };

         let supabaseSuccess = false;
         try {
            const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('mock.supabase.co');
            if (!isMockUrl) {
               const { error } = await supabase
                  .from('archives')
                  .insert([payload]);
               
               if (!error) {
                  supabaseSuccess = true;
               } else {
                  console.error('Supabase insert error:', error);
               }
            }
         } catch (err) {
            console.warn('Supabase insertion failed:', err);
         }

         if (supabaseSuccess) {
            logActivity('CREATE_ARCHIVE', `Menambahkan arsip baru: ${formData.judulBerkas}`);
            setSuccessMessage((role === 'superadmin' || role === 'pic_gedung') ? 'Arsip berhasil disimpan di Database!' : 'Pengajuan dikirim ke Database!');
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
               gedung: (role === 'superadmin' || role === 'pic_gedung') ? formData.gedung : '',
               lorong: (role === 'superadmin' || role === 'pic_gedung') ? formData.lorong : '',
               rak: (role === 'superadmin' || role === 'pic_gedung') ? formData.rak : '',
            baris: (role === 'superadmin' || role === 'pic_gedung') ? formData.baris : '',
               status: statusVal,
               keterangan: formData.keterangan,
               isiBundel: formData.isiBundel,
               linkBerkas: formData.linkBerkas
            };
            setArchives(prev => [...prev, newRecord]);
            setSuccessMessage((role === 'superadmin' || role === 'pic_gedung') ? 'Arsip disimpan (Simulasi)!' : 'Pengajuan terkirim (Simulasi)!');
         }
      }
      
      setEditArchiveItem(null);

      setTimeout(() => {
         setSuccessMessage("");
        setShowAddForm(false);
        setFormData({
           kodeKlasifikasi: "",
           jenisBerkas: "",
           judulBerkas: "",
           departemen: "",
           tahun: new Date().getFullYear().toString(),
           tanggalTerima: "",
           jangkaWaktu: "",
           gedung: "",
           lorong: "",
           rak: "",
      baris: "",
           linkBerkas: "",
         status: (role === 'superadmin' || role === 'pic_gedung') ? "Aktif" : "Menunggu ACC",
           keterangan: "",
           isiBundel: []
        });
     }, 1500);
  };

  const handleConfirmDuplicateTimpa = async () => {
      setDuplicateAlertModalOpen(false);
      if (!foundDuplicateRecord || !pendingFormData) return;
      
      // We will perform an UPDATE on foundDuplicateRecord.no using pendingFormData
      const statusVal = (role === 'superadmin' || role === 'pic_gedung') ? 'Aktif' : 'Menunggu ACC';
      
      const payload = {
         kode_klasifikasi: pendingFormData.kodeKlasifikasi,
         jenis_berkas: pendingFormData.jenisBerkas,
         judul_berkas: pendingFormData.judulBerkas,
         departemen: pendingFormData.departemen,
         tahun: pendingFormData.tahun,
         tanggal_terima: pendingFormData.tanggalTerima,
         jangka_waktu: pendingFormData.jangkaWaktu,
         gedung: (role === 'superadmin' || role === 'pic_gedung') ? pendingFormData.gedung : foundDuplicateRecord.gedung,
         lorong: (role === 'superadmin' || role === 'pic_gedung') ? pendingFormData.lorong : foundDuplicateRecord.lorong,
         rak: (role === 'superadmin' || role === 'pic_gedung') ? pendingFormData.rak : foundDuplicateRecord.rak,
         baris: (role === 'superadmin' || role === 'pic_gedung') ? pendingFormData.baris : foundDuplicateRecord.baris,
         status: statusVal,
         keterangan: pendingFormData.keterangan,
         isi_bundel: JSON.stringify(pendingFormData.isiBundel),
         link_berkas: pendingFormData.linkBerkas
      };

      let supabaseSuccess = false;
      try {
         const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('mock.supabase.co');
         if (!isMockUrl) {
            const no = foundDuplicateRecord.no || foundDuplicateRecord.id;
            const isNoNumeric = !isNaN(Number(no));
            const queryField = isNoNumeric ? 'no' : 'id';
            const queryVal = isNoNumeric ? Number(no) : no;

            const { error } = await supabase
               .from('archives')
               .update(payload)
               .eq(queryField, queryVal);

            if (!error) supabaseSuccess = true;
         }
      } catch (err) {
         console.warn('Supabase update failed:', err);
      }

      if (supabaseSuccess) {
         logActivity('OVERWRITE_ARCHIVE', `Menimpa arsip duplikat: ${pendingFormData.judulBerkas}`);
         setSuccessMessage('Arsip duplikat berhasil ditimpa!');
         fetchArchives();
      } else {
         setSuccessMessage('Arsip duplikat berhasil ditimpa (Simulasi)!');
      }

      setFoundDuplicateRecord(null);
      setPendingFormData(null);
      
      setTimeout(() => {
         setSuccessMessage("");
         setShowAddForm(false);
         setFormData({
            kodeKlasifikasi: "",
            jenisBerkas: "",
            judulBerkas: "",
            departemen: "",
            tahun: new Date().getFullYear().toString(),
            tanggalTerima: "",
            jangkaWaktu: "",
            gedung: "",
            lorong: "",
            rak: "",
      baris: "",
            linkBerkas: "",
            status: (role === 'superadmin' || role === 'pic_gedung') ? "Aktif" : "Menunggu ACC",
            keterangan: "",
            isiBundel: []
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
                 baris: approvalLocation.baris,
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
        logActivity('APPROVE_ARCHIVE', `Menerima dan menempatkan arsip di Rak`);
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
                 baris: approvalLocation.baris,
                 status: "Aktif"
              };
           }
           return item;
        }));
        setSuccessMessage("Status berkas diperbarui (Simulasi)!");
     }

     setSelectedApprovalId(null);
     setApprovalLocation({ gedung: "A", lorong: "", rak: "",
      baris: "" });
     setTimeout(() => setSuccessMessage(""), 1500);
   };

   const handleEditClick = (archive: any) => {
      const dept = archive.departemen || '';
      setIsCustomDept(!masterDepartments.includes(dept.toUpperCase()) && dept !== '');
      
      setEditArchiveItem(archive);
      setFormData({
         kodeKlasifikasi: archive.kodeKlasifikasi || '',
         jenisBerkas: archive.jenisBerkas || '',
         judulBerkas: archive.judulBerkas || '',
         departemen: archive.departemen || '',
         tahun: archive.tahun || new Date().getFullYear().toString(),
         tanggalTerima: archive.tanggalTerima || '',
         jangkaWaktu: archive.jangkaWaktu || '',
         gedung: archive.gedung || '',
         lorong: archive.lorong || '',
         rak: archive.rak || '',
         baris: archive.baris || '',
         linkBerkas: archive.linkBerkas || '',
         status: archive.status || 'Menunggu ACC',
         keterangan: archive.keterangan || '',
         isiBundel: archive.isiBundel || []
      });
      setShowAddForm(true);
      closeDetailModal();
   };

   const confirmDeleteArchive = (no: string) => {
      setArchiveToDelete(no);
      setDeleteModalOpen(true);
   };

   const confirmDeleteRequest = (id: string) => {
      setRequestToDelete(id);
      setDeleteRequestModalOpen(true);
   };

   const handleDeleteRequest = async () => {
      if (!requestToDelete) return;
      const id = requestToDelete;
      setDeleteRequestModalOpen(false);
      setRequestToDelete(null);

      try {
         const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('mock.supabase.co');
         if (!isMockUrl) {
            const { error } = await supabase
               .from('requests')
               .delete()
               .eq('id', id);

            if (error) {
               console.error("Supabase Error deleting request:", error);
               alert("Gagal menghapus pengajuan dari database: " + error.message);
               return;
            }
         }
         
         setSuccessMessage('Pengajuan berhasil dihapus dari database.');
         fetchRequests();
      } catch (err: any) {
         console.warn('Supabase delete request failed:', err);
         alert("Terjadi kesalahan sistem saat menghapus: " + err.message);
      }
      setTimeout(() => setSuccessMessage(''), 1500);
   };

   const handleDeleteArchive = async () => {
      if (!archiveToDelete) return;
      const no = archiveToDelete;
      setDeleteModalOpen(false);
      setArchiveToDelete(null);

      let supabaseSuccess = false;
      try {
         const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('mock.supabase.co');
         if (!isMockUrl) {
            const isNoNumeric = !isNaN(Number(no));
            const queryField = isNoNumeric ? 'no' : 'id';
            const queryVal = isNoNumeric ? Number(no) : no;

            // Soft Delete by setting deleted_at
            const { error } = await supabase
               .from('archives')
               .update({ deleted_at: new Date().toISOString() })
               .eq(queryField, queryVal);

            if (!error) {
               supabaseSuccess = true;
               logActivity('Hapus Arsip', `Memindahkan arsip ${queryVal} ke tempat sampah`);
            } else {
               alert("Gagal memindahkan ke tempat sampah: " + error.message);
            }
         }
      } catch (err: any) {
         console.warn('Supabase delete skipped, fallback to mock delete:', err);
      }

      setArchives(archives.map(a => a.no === no || a.id === no ? { ...a, deleted_at: new Date().toISOString() } : a));
      setSuccessMessage(supabaseSuccess ? 'Berhasil dipindahkan ke tempat sampah!' : 'Berhasil dipindahkan (Mode Simulasi)!');
      closeDetailModal();
      setTimeout(() => setSuccessMessage(''), 3000);
   };

   const handleHardDeleteArchive = async (id: string | number) => {
      if (!confirm("Apakah Anda yakin ingin menghapus data ini PERMANEN dari database? Data yang dihapus permanen tidak bisa dikembalikan.")) return;
      
      let supabaseSuccess = false;
      try {
         const isNoNumeric = !isNaN(Number(id));
         const queryField = isNoNumeric ? 'no' : 'id';
         const queryVal = isNoNumeric ? Number(id) : id;

         const { error } = await supabase
            .from('archives')
            .delete()
            .eq(queryField, queryVal);

         if (!error) {
            supabaseSuccess = true;
            logActivity('Hapus Permanen', `Menghapus arsip ${queryVal} secara permanen dari sistem`);
         } else {
            alert("Gagal menghapus permanen: " + error.message);
         }
      } catch (err: any) {
         console.warn('Supabase hard delete failed:', err);
      }

      setArchives(archives.filter(a => a.no !== id && a.id !== id));
      setSuccessMessage(supabaseSuccess ? 'Data berhasil dihapus permanen!' : 'Dihapus permanen (Simulasi)');
      closeDetailModal();
      setTimeout(() => setSuccessMessage(''), 3000);
   };

   const handleRestoreArchive = async (id: string | number) => {
      let supabaseSuccess = false;
      try {
         const isNoNumeric = !isNaN(Number(id));
         const queryField = isNoNumeric ? 'no' : 'id';
         const queryVal = isNoNumeric ? Number(id) : id;

         const { error } = await supabase
            .from('archives')
            .update({ deleted_at: null })
            .eq(queryField, queryVal);

         if (!error) {
            supabaseSuccess = true;
            logActivity('Pulihkan Arsip', `Memulihkan arsip ${queryVal} dari tempat sampah`);
         } else {
            alert("Gagal memulihkan arsip: " + error.message);
         }
      } catch (err: any) {
         console.warn('Supabase restore failed:', err);
      }

      setArchives(archives.map(a => a.no === id || a.id === id ? { ...a, deleted_at: null } : a));
      setSuccessMessage(supabaseSuccess ? 'Arsip berhasil dipulihkan!' : 'Dipulihkan (Simulasi)');
      closeDetailModal();
      setTimeout(() => setSuccessMessage(''), 3000);
   };

   const handlePinjamClick = (archive: any) => {
      closeDetailModal();
      setActiveMenu('Layanan Arsip');
      setServiceFormData(prev => ({
         ...prev,
         type: 'peminjaman',
         archive_title: `${archive.judulBerkas} (${archive.no})`
      }));
      setShowServiceForm(true);
   };


   const confirmRejectArchive = (no: string) => {
      setArchiveToReject(no);
      setRejectReason("");
      setRejectModalOpen(true);
   };

   const submitRejectArchive = async () => {
      if (!archiveToReject) return;
      if (!rejectReason.trim()) {
         alert("Alasan penolakan tidak boleh kosong!");
         return;
      }
      
      const no = archiveToReject;
      const reason = rejectReason;
      
      setRejectModalOpen(false);
      setArchiveToReject(null);
      setRejectReason("");

      await handleReject(no, reason);
      closeDetailModal();
   };

  const handleReject = async (no: string, alasan: string) => {
     let supabaseSuccess = false;

     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const isNoNumeric = !isNaN(Number(no));
           const queryField = isNoNumeric ? 'no' : 'id';
           const queryVal = isNoNumeric ? Number(no) : no;

           const { error } = await supabase
              .from('archives')
              .update({ status: "Ditolak", alasan_penolakan: alasan })
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
              return { ...item, status: "Ditolak", alasanPenolakan: alasan };
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
  const handleAddUserSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsAddingUser(true);
     setAddUserError("");

     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co") || !process.env.NEXT_PUBLIC_SUPABASE_URL;
        
        if (isMockUrl) {
           const mockUser = {
              id: "mock-" + Date.now(),
              name: newUserForm.name,
              email: newUserForm.email,
              role: newUserForm.role,
              approved: true,
              created_at: new Date().toISOString()
           };
           setUsersList(prev => [mockUser, ...prev]);
           setShowAddUserModal(false);
           setNewUserForm({ name: '', email: '', role: 'user', password: '' });
           setSuccessMessage("Pengguna berhasil ditambahkan (Simulasi)!");
           setTimeout(() => setSuccessMessage(""), 2000);
           return;
        }

        const { data, error } = await supabase.auth.signUp({
           email: newUserForm.email,
           password: newUserForm.password,
           options: {
              data: {
                 name: newUserForm.name,
                 role: newUserForm.role,
                 approved: true
              }
           }
        });

        if (error) {
           setAddUserError(error.message);
        } else {
           setShowAddUserModal(false);
           setNewUserForm({ name: '', email: '', role: 'user', password: '' });
           setSuccessMessage("Pengguna berhasil ditambahkan!");
           setTimeout(() => setSuccessMessage(""), 2000);
           fetchUsers();
        }
     } catch (err: any) {
        setAddUserError(err.message || "Gagal menambah pengguna");
     } finally {
        setIsAddingUser(false);
     }
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

  // Cabut Akses (Blokir) Pengguna Aktif
  const handleBlockUser = async (userId: string) => {
     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase
              .from('profiles')
              .update({ approved: false })
              .eq('id', userId);
           
           if (!error) supabaseSuccess = true;
        }
     } catch (err) {
        console.error(err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Akses pengguna berhasil dicabut (Diblokir).");
        fetchUsers();
     } else {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, approved: false } : u));
        setSuccessMessage("Akses dicabut (Simulasi)!");
     }
     setTimeout(() => setSuccessMessage(""), 2000);
  };

  // Ubah Jabatan Pengguna Aktif
  const handleChangeRole = async (userId: string, newRole: string) => {
     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           const { error } = await supabase
              .from('profiles')
              .update({ role: newRole })
              .eq('id', userId);
           
           if (!error) supabaseSuccess = true;
        }
     } catch (err) {
        console.error(err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Jabatan pengguna berhasil diubah!");
        fetchUsers();
        setShowChangeRoleModal(false);
     } else {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setSuccessMessage("Jabatan diubah (Simulasi)!");
        setShowChangeRoleModal(false);
     }
     setTimeout(() => setSuccessMessage(""), 2000);
  };

  // Reset User Password via Email
  const handleResetUserPassword = async (name: string, email: string) => {
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           await supabase.auth.resetPasswordForEmail(email);
        }
     } catch (err) {
        console.error(err);
     }
     setSuccessMessage(`Email berisi tautan reset sandi telah dikirimkan ke ${email}. Silakan infokan ke pengguna untuk mengecek kotak masuk/spam mereka.`);
     setTimeout(() => setSuccessMessage(""), 5000);
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
        link_surat: serviceFormData.link_surat || null,
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
        purpose: "",
        link_surat: ""
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

  const confirmRejectRequest = (reqId: string) => {
     setServiceToReject(reqId);
     setServiceRejectReason("");
     setRejectServiceModalOpen(true);
  };

  const submitRejectRequest = async () => {
     if (!serviceToReject) return;
     if (!serviceRejectReason.trim()) {
        return; // Don't submit without a reason
     }
     
     let supabaseSuccess = false;
     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("mock.supabase.co");
        if (!isMockUrl) {
           // Note: Make sure the Supabase table 'requests' has a 'reject_reason' text column.
           const { error } = await supabase
              .from('requests')
              .update({ status: 'Ditolak', reject_reason: serviceRejectReason })
              .eq('id', serviceToReject);
           if (!error) supabaseSuccess = true;
        }
     } catch (err) {
        console.error(err);
     }

     if (supabaseSuccess) {
        setSuccessMessage("Pengajuan ditolak!");
        fetchRequests();
     } else {
        setRequestsList(prev => prev.map(r => r.id === serviceToReject ? { ...r, status: 'Ditolak', reject_reason: serviceRejectReason } : r));
        setSuccessMessage("Pengajuan ditolak (Simulasi)!");
     }
     setRejectServiceModalOpen(false);
     setTimeout(() => setSuccessMessage(""), 1500);
  };

  const renderServiceRejectModal = () => {
    if (!rejectServiceModalOpen) return null;
    return (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-all duration-300">
          <div 
             className="bg-canvas border border-hairline rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300"
             onClick={(e) => e.stopPropagation()}
          >
             <div className="p-6">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                   </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Tolak Pengajuan?</h3>
                <p className="text-gray-500 mb-4 text-center text-sm">Harap berikan alasan penolakan.</p>
                <div className="mb-6">
                   <textarea 
                      value={serviceRejectReason}
                      onChange={(e) => setServiceRejectReason(e.target.value)}
                      placeholder="Masukkan alasan..."
                      className="w-full border border-hairline rounded-xl px-3 py-2.5 text-sm text-ink focus:ring-2 focus:ring-rose-500 outline-none resize-none bg-canvas-soft"
                      rows={3}
                      autoFocus
                   />
                </div>
                <div className="flex gap-3 w-full">
                   <button onClick={() => setRejectServiceModalOpen(false)} className="flex-1 px-4 py-2.5 bg-canvas-soft text-ink font-medium rounded-xl hover:bg-hairline">Batal</button>
                   <button onClick={submitRejectRequest} className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700">Ya, Tolak</button>
                </div>
             </div>
          </div>
       </div>
    );
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

  const uniqueDepartments = Array.from(new Set(archives.map(a => a?.departemen).filter(Boolean)));

  const filteredArchives = archives
     .map(item => {
        const q = searchQuery.toLowerCase();
        if (!q) return { ...item, _searchScore: 1 };
        
        let score = 0;
        
        if (item.isiBundel && item.isiBundel.some((b: string) => {
            const bLower = b.toLowerCase();
            if (bLower.includes(q)) return true;
            
            // Cek apakah item adalah format range (menggunakan - atau s/d)
            const rangeMatch = b.match(/^(.*?)\s*(?:-|s\/d)\s*(.*?)$/i);
            if (rangeMatch) {
               const startStr = rangeMatch[1];
               const endStr = rangeMatch[2];
               
               const startMatch = startStr.match(/^(.*?)(\d+)$/);
               const endMatch = endStr.match(/^(.*?)(\d+)$/);
               const queryMatch = q.match(/^(.*?)(\d+)$/);
               const queryOnlyNum = q.match(/^(\d+)$/);
               
               if (startMatch && endMatch && (queryMatch || queryOnlyNum)) {
                  const prefix = startMatch[1].toLowerCase();
                  const startNum = parseInt(startMatch[2], 10);
                  const endNum = parseInt(endMatch[2], 10);
                  
                  let queryPrefix = "";
                  let queryNum = 0;
                  
                  if (queryMatch) {
                     queryPrefix = queryMatch[1].toLowerCase();
                     queryNum = parseInt(queryMatch[2], 10);
                  } else if (queryOnlyNum) {
                     queryNum = parseInt(queryOnlyNum[1], 10);
                  }
                  
                  // Jika query memiliki prefix, pastikan prefix-nya cocok dengan range
                  // Jika query HANYA angka (queryOnlyNum), abaikan pengecekan prefix
                  if (!queryPrefix || queryPrefix === prefix) {
                     if (queryNum >= Math.min(startNum, endNum) && queryNum <= Math.max(startNum, endNum)) {
                        return true;
                     }
                  }
               }
            }
            return false;
        })) {
            score = Math.max(score, 4);
        }
        if (item.judulBerkas && item.judulBerkas.toLowerCase().includes(q)) {
            score = Math.max(score, 3);
        }
        if (item.kodeKlasifikasi && item.kodeKlasifikasi.toLowerCase().includes(q)) {
            score = Math.max(score, 3);
        }
        if (item.jenisBerkas && item.jenisBerkas.toLowerCase().includes(q)) {
            score = Math.max(score, 2);
        }
        if (item.departemen && item.departemen.toLowerCase().includes(q)) {
            score = Math.max(score, 1);
        }
        
        return { ...item, _searchScore: score };
     })
     .filter(item => {
        // Recycle Bin Filter
        const isDeleted = item.deleted_at !== null && item.deleted_at !== undefined;
        if (isRecycleBin && !isDeleted) return false;
        if (!isRecycleBin && isDeleted) return false;
        
        // Departemen Role Filter for Recycle Bin (PIC sees all, Dept Admin sees only theirs)
        if (isRecycleBin && role === 'admin_dept' && user?.name) {
           const userDept = user.name.split('-')[1]?.trim()?.toUpperCase() || "";
           if (userDept && item.departemen?.toUpperCase() !== userDept) return false;
        }

        const matchesStatus = statusFilter === "Semua" || item.status === statusFilter;
        const matchesSearch = searchQuery === "" || item._searchScore > 0;
        const matchesDept = departemenFilter.length === 0 || departemenFilter.includes(item.departemen);
        
        const matchesYear = yearFilter === "" || (item.kurunWaktu && item.kurunWaktu.toString().includes(yearFilter));
        const matchesGedung = gedungFilter === "" || item.gedung === gedungFilter;
        const matchesLorong = lorongFilter === "" || item.lorong === lorongFilter;

        return matchesStatus && matchesSearch && matchesDept && matchesYear && matchesGedung && matchesLorong;
     })
     .sort((a, b) => {
         if (sortConfig !== null) {
            const { key, direction } = sortConfig;
            let aVal = a[key] || '';
            let bVal = b[key] || '';
            
            // Handle numeric values for sort like tahun, rak, lorong
            if (key === 'tahun' || key === 'rak' || key === 'no' || key === 'lorong') {
               const aNum = Number(aVal);
               const bNum = Number(bVal);
               if (!isNaN(aNum) && !isNaN(bNum)) {
                  return direction === 'ascending' ? aNum - bNum : bNum - aNum;
               }
            }

            // String sort
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            if (aVal < bVal) return direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return direction === 'ascending' ? 1 : -1;
            return 0;
         }
         return b._searchScore - a._searchScore;
     });

  const paginatedArchives = filteredArchives.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredArchives.length / itemsPerPage) || 1;

  const getRoleName = (r: string) => {
     if (r === 'superadmin') return 'Superadmin';
     if (r === 'pic_gedung') return 'Admin Gedung';
     if (r === 'admin_dept') return 'Admin Departemen';
     return 'Staf Biasa';
  };

  // Helper stats calculation
  const getStats = () => {
     const active = archives.filter(item => item.status === 'Aktif').length;
     const inactive = archives.filter(item => item.status === 'Inaktif').length;
     return {
        superadmin: { total: archives.length, active, inactive },
        pic_gedung: { total: archives.length, active, inactive },
        admin_dept: { total: archives.filter(i => i.departemen === 'KEUANGAN').length, active: archives.filter(i => i.departemen === 'KEUANGAN' && i.status === 'Aktif').length, inactive: archives.filter(i => i.departemen === 'KEUANGAN' && i.status === 'Inaktif').length },
        user: { total: archives.length, active, inactive }
     };
  };
  const stats = getStats();

  // Analytics Calculations
  const uniqueDepartmentsForStats = Array.from(new Set(archives.map(a => a?.departemen).filter(Boolean)));
  const deptStats = uniqueDepartmentsForStats.map(dept => ({
      name: dept,
      count: archives.filter(item => item.departemen.toUpperCase() === dept.toUpperCase()).length
  })).sort((a, b) => b.count - a.count).slice(0, 7); // Top 7 departments

  // Calculate Yearly Trend
  const yearlyDataMap = archives.reduce((acc, item) => {
      const year = item.tahun || new Date().getFullYear().toString();
      if (!acc[year]) acc[year] = 0;
      acc[year]++;
      return acc;
  }, {} as Record<string, number>);
  const yearlyTrendData = Object.keys(yearlyDataMap)
      .sort((a, b) => a.localeCompare(b))
      .map(year => ({ year, count: yearlyDataMap[year] }));

  // Summary Metrics
  const totalArchives = archives.length;
  const totalActiveDepts = uniqueDepartmentsForStats.length;
  const pendingApprovals = archives.filter(item => item.status === 'Menunggu ACC').length;
  const currentYear = new Date().getFullYear().toString();
  const archivesThisYear = yearlyDataMap[currentYear] || 0;

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
        "Baris",
        "Keterangan",
        "Isi (Lampiran)",
        "Link PDF (Opsional)",
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
           `"${(item.baris || "-").replace(/"/g, '""')}"`,
           `"${(item.keterangan || "").replace(/"/g, '""')}"`,
           `"${(item.isiBundel?.join(', ') || "").replace(/"/g, '""')}"`,
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

  // IMPORT EXCEL (XLSX)
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     const reader = new FileReader();
     reader.onload = async (evt) => {
        try {
           const bstr = evt.target?.result;
           const wb = XLSX.read(bstr, { type: 'binary' });
           const wsname = wb.SheetNames[0];
           const ws = wb.Sheets[wsname];
           const data = XLSX.utils.sheet_to_json(ws);
           
           if (!data || data.length === 0) {
              setSuccessMessage("File Excel kosong atau format tidak sesuai.");
              return;
           }

           const recordsFromExcel = data.map((row: any) => ({
              kode_klasifikasi: row['Kode Klasifikasi'] || '',
              jenis_berkas: row['Jenis Berkas'] || '',
              judul_berkas: row['Judul Berkas'] || '',
              departemen: row['Departemen'] || 'KEUANGAN',
              tahun: String(row['Tahun'] || new Date().getFullYear()),
              tanggal_terima: row['Tanggal Terima Berkas'] || '',
              jangka_waktu: row['Jangka Waktu Aktif'] || '',
              keterangan: row['Keterangan'] || '',
              isi_bundel: row['Isi (Lampiran)'] ? row['Isi (Lampiran)'].toString().split(',').map((s: string) => s.trim()).filter(Boolean) : [],
              status: row['Status'] || 'Aktif',
              link_berkas: row['Link PDF (Opsional)'] || '',
              gedung: row['Gedung'] || null,
              lorong: row['Lorong'] || null,
              rak: row['Rak'] ? String(row['Rak']).replace(/^rak\s+/i, '').trim() : null,
              baris: row['Baris'] || null
           }));

           // Duplicate checking
           const duplicatesFound: any[] = [];
           const newRecordsToInsert: any[] = [];

           for (const rec of recordsFromExcel) {
              // Convert to the format expected by findDuplicate
              const tempPayload = {
                 judulBerkas: rec.judul_berkas,
                 jenisBerkas: rec.jenis_berkas,
                 departemen: rec.departemen,
                 gedung: rec.gedung,
                 lorong: rec.lorong,
                 rak: rec.rak,
                 baris: rec.baris,
                 isiBundel: rec.isi_bundel
              };
              const existingDup = findDuplicate(tempPayload, false);
              if (existingDup) {
                 duplicatesFound.push({ duplicateRecord: existingDup, newRecord: rec });
              } else {
                 newRecordsToInsert.push(rec);
              }
           }

           if (duplicatesFound.length > 0) {
              setBulkDuplicates(duplicatesFound);
              setBulkNewRecords(newRecordsToInsert);
              setBulkDuplicateAlertModalOpen(true);
              return; // Pause the import flow
           }

           if (newRecordsToInsert.length > 0) {
              const { error } = await supabase.from('archives').insert(newRecordsToInsert);
              if (error) throw error;
              logActivity('IMPORT_EXCEL', `Mengimpor ${newRecordsToInsert.length} arsip dari Excel`);
              setSuccessMessage(`Berhasil mengimpor ${newRecordsToInsert.length} arsip dari Excel!`);
              setTimeout(() => setSuccessMessage(""), 5000);
              fetchArchives();
           } else {
              setSuccessMessage("Tidak ada data baru untuk diimpor.");
              setTimeout(() => setSuccessMessage(""), 5000);
           }
        } catch (error) {
           console.error("Gagal import excel:", error);
           setSuccessMessage("Gagal mengimpor Excel. Pastikan format tabel sesuai.");
           setTimeout(() => setSuccessMessage(""), 5000);
        }
     };
     reader.readAsBinaryString(file);
     e.target.value = ''; // Reset file input
  };

  const executeBulkImport = async (overwrite: boolean) => {
     setBulkDuplicateAlertModalOpen(false);
     setSuccessMessage("Sedang memproses import...");
     let successCount = 0;
     let updateCount = 0;

     try {
        const isMockUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('mock.supabase.co');
        if (!isMockUrl) {
           // Insert new records
           if (bulkNewRecords.length > 0) {
              const { error } = await supabase.from('archives').insert(bulkNewRecords);
              if (!error) successCount += bulkNewRecords.length;
           }

           // Overwrite duplicates if requested
           if (overwrite && bulkDuplicates.length > 0) {
              for (const dup of bulkDuplicates) {
                 const no = dup.duplicateRecord.no || dup.duplicateRecord.id;
                 const isNoNumeric = !isNaN(Number(no));
                 const queryField = isNoNumeric ? 'no' : 'id';
                 const queryVal = isNoNumeric ? Number(no) : no;

                 // Only update the existing fields using the new record from excel
                 // Merging existing gedung/lorong/rak if the new record doesn't have it (optional, but let's replace entirely if it's overwrite)
                 const payloadToUpdate = {
                    ...dup.newRecord,
                    gedung: dup.newRecord.gedung || dup.duplicateRecord.gedung,
                    lorong: dup.newRecord.lorong || dup.duplicateRecord.lorong,
                    rak: dup.newRecord.rak || dup.duplicateRecord.rak,
                    baris: dup.newRecord.baris || dup.duplicateRecord.baris,
                 };

                 const { error: upErr } = await supabase
                    .from('archives')
                    .update(payloadToUpdate)
                    .eq(queryField, queryVal);
                 
                 if (!upErr) updateCount++;
              }
           }
        } else {
            successCount += bulkNewRecords.length;
            if (overwrite) updateCount += bulkDuplicates.length;
        }

        let msg = '';
        if (successCount > 0) msg += `Berhasil mengimpor ${successCount} data baru. `;
        if (updateCount > 0) msg += `Berhasil menimpa ${updateCount} data duplikat. `;
        if (successCount === 0 && updateCount === 0) msg = "Tidak ada data yang diproses.";
        
        logActivity('IMPORT_EXCEL', msg);
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(""), 5000);
        fetchArchives();

     } catch (err) {
        console.error("Gagal import excel:", err);
        setSuccessMessage("Terjadi kesalahan saat memproses data Excel.");
        setTimeout(() => setSuccessMessage(""), 5000);
     }

     setBulkDuplicates([]);
     setBulkNewRecords([]);
     setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleBulkDuplicateTimpa = () => executeBulkImport(true);
  const handleBulkDuplicateLewati = () => executeBulkImport(false);
  const handleBulkDuplicateBatal = () => {
     setBulkDuplicateAlertModalOpen(false);
     setBulkDuplicates([]);
     setBulkNewRecords([]);
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
                 baris: approvalLocation.baris,
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
           logActivity('APPROVE_ARCHIVE', `Menerima dan menempatkan arsip di Rak`);
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
                 baris: approvalLocation.baris,
                    status: "Aktif"
                 };
              }
              return item;
           }));
           setSuccessMessage("Status berkas diperbarui (Simulasi)!");
        }

        closeDetailModal();
        setApprovalLocation({ gedung: "A", lorong: "", rak: "",
      baris: "" });
        setTimeout(() => setSuccessMessage(""), 1500);
     };

     const renderFooterActions = () => {
        if (detailType === 'archive' && selectedDetailItem.status === 'Menunggu ACC' && (role === 'superadmin' || role === 'pic_gedung')) {
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
                        confirmRejectArchive(selectedDetailItem.no);
                     }}
                    className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded-xs text-[13px]"
                 >
                    Tolak Pengajuan
                 </button>
              </div>
           );
        }

        if (detailType === 'user' && role === 'superadmin') {
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
                       className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded-xs text-[13px] flex items-center justify-center gap-1.5"
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
                       className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded-xs text-[13px] flex items-center justify-center gap-1.5"
                    >
                       <Trash2 size={14} /> Cabut Akses
                    </button>
                 </div>
              );
           }
        }

        if (detailType === 'request' && (role === 'superadmin' || role === 'pic_gedung')) {
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
                          confirmRejectRequest(selectedDetailItem.id);
                          closeDetailModal();
                       }}
                       className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded-xs text-[13px]"
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

        
         if (detailType === 'archive' && selectedDetailItem.status !== 'Menunggu ACC') {
            if (role === 'user') {
               if (selectedDetailItem.status !== 'Ditolak') {
                  return (
                     <button
                        onClick={() => handlePinjamClick(selectedDetailItem)}
                        className="btn-primary w-full md:w-auto text-center flex items-center justify-center gap-1.5"
                     >
                        <BookOpen size={15} /> Ajukan Peminjaman
                     </button>
                  );
               }
            } else {
               return (
                  <div className="flex gap-2 w-full md:w-auto">
                     <button 
                        onClick={() => handleEditClick(selectedDetailItem)}
                        className="flex-1 md:flex-none btn-outline flex items-center justify-center gap-1.5 text-[13px] border border-hairline-strong py-2 px-4 hover:bg-canvas-soft transition-colors text-ink font-semibold"
                     >
                        <Edit3 size={14} /> Edit Berkas
                     </button>
                     <button 
                        onClick={() => confirmDeleteArchive(selectedDetailItem.no)}
                        className="flex-1 md:flex-none border border-transparent bg-red-50 hover:bg-red-100 text-primary font-semibold px-4 py-2 rounded-xs text-[13px] flex items-center justify-center gap-1.5 transition-colors"
                     >
                        <Trash2 size={14} /> Hapus Berkas
                     </button>
                  </div>
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
                              <p className="font-medium text-ink mt-0.5 uppercase">{selectedDetailItem.jenisBerkas}</p>
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
                           <div className="col-span-2">
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Keterangan</p>
                              <p className="font-medium text-ink mt-0.5">{selectedDetailItem.keterangan || "-"}</p>
                           </div>
                           <div className="col-span-2">
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold mb-1">Isi (Lampiran)</p>
                              {selectedDetailItem.isiBundel && selectedDetailItem.isiBundel.length > 0 ? (
                                 <ul className="list-disc pl-4 space-y-1">
                                    {selectedDetailItem.isiBundel.map((item: string, idx: number) => (
                                       <li key={idx} className="font-medium text-ink">{item}</li>
                                    ))}
                                 </ul>
                              ) : (
                                 <p className="font-medium text-ink">-</p>
                              )}
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

                        {selectedDetailItem.status === 'Menunggu ACC' && (role === 'superadmin' || role === 'pic_gedung') ? (
                           <div className="border-t border-hairline pt-4 space-y-3">
                              <h5 className="text-[12px] font-bold text-ink uppercase tracking-wider">Tentukan Lokasi Fisik Penyimpanan</h5>
                              <div className="mt-2">
                                 <label className="block text-[10px] font-semibold text-ink mb-1">Pilih Lokasi Rak</label>
                                 <select 
                                    className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-ink text-ink font-mono"
                                    value={JSON.stringify(approvalLocation)}
                                    onChange={(e) => {
                                       try {
                                          const loc = JSON.parse(e.target.value);
                                          setApprovalLocation(loc);
                                       } catch (err) {}
                                    }}
                                 >
                                    <option value='{"gedung":"A","lorong":"","rak":""}' disabled>Pilih Lokasi Rak...</option>
                                    {masterLocations.map(l => (
                                       <option key={l.id} value={JSON.stringify({gedung: l.gedung, lorong: l.lorong, rak: l.rak, baris: l.baris})}>
                                          Gedung {l.gedung} - Lorong {l.lorong} - Rak {l.rak} - Baris {l.baris}
                                       </option>
                                    ))}
                                 </select>
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
                           {selectedDetailItem.linkBerkas && selectedDetailItem.linkBerkas !== '-' ? (
                              <a 
                                 href={selectedDetailItem.linkBerkas} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-semibold py-2.5 rounded-xs transition-colors"
                              >
                                 <ExternalLink size={16} /> Buka Berkas Digital (Drive)
                              </a>
                           ) : (
                              <span className="w-full inline-flex items-center justify-center gap-2 bg-canvas-soft text-ink-mute text-[14px] font-semibold py-2.5 rounded-xs cursor-not-allowed">
                                 <ExternalLink size={16} /> Berkas Digital Tidak Tersedia
                              </span>
                           )}
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
                              <p className="font-semibold text-ink mt-0.5 capitalize">{selectedDetailItem.role === 'superadmin' ? 'Superadmin' : selectedDetailItem.role === 'pic_gedung' ? 'Admin Gedung' : selectedDetailItem.role === 'admin_dept' ? 'Admin Departemen' : 'Staf Biasa'}</p>
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
                           <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-xs capitalize ${
                              selectedDetailItem.type === 'peminjaman' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-500/10 text-purple-800 dark:text-purple-400'
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
                               <div className="mt-1.5 flex justify-start">
                                  <StatusBadge status={selectedDetailItem.status} alasanPenolakan={selectedDetailItem.reject_reason} />
                                </div>
                            </div>
                           <div className="col-span-2">
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">
                                 {selectedDetailItem.type === 'peminjaman' ? 'Rentang Tanggal Peminjaman' : 'Tanggal & Waktu Kunjungan'}
                               </p>
                               <p className="font-mono text-ink mt-0.5">
                                  {selectedDetailItem.type === 'peminjaman' 
                                     ? `${formatDate(selectedDetailItem.date)} s/d ${formatDate(selectedDetailItem.time_or_return)}`
                                     : `${formatDate(selectedDetailItem.date)} (${selectedDetailItem.time_or_return})`}
                               </p>
                           </div>
                           <div className="col-span-2">
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Tujuan / Keperluan</p>
                              <p className="text-ink mt-1 bg-canvas-soft border border-hairline p-3 rounded-xs whitespace-pre-wrap">{selectedDetailItem.purpose}</p>
                           </div>
                           {selectedDetailItem.link_surat && (
                              <div className="col-span-2 mt-2">
                                 <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Link Surat Elektronik</p>
                                 <a 
                                    href={selectedDetailItem.link_surat.startsWith('http') ? selectedDetailItem.link_surat : `https://${selectedDetailItem.link_surat}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-primary hover:underline mt-1 inline-block text-[13px] break-all bg-canvas-soft border border-hairline p-2 rounded-xs w-full"
                                 >
                                    {selectedDetailItem.link_surat}
                                 </a>
                              </div>
                           )}
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

  {/* DELETE CONFIRMATION MODAL */}
  const renderDeleteModal = () => {
    if (!deleteModalOpen) return null;
    return (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-all duration-300">
          <div 
             className="bg-canvas border border-hairline rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300"
             onClick={(e) => e.stopPropagation()}
          >
             <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                   </svg>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Arsip?</h3>
                <p className="text-gray-500 mb-6">
                   Apakah Anda yakin ingin menghapus berkas arsip ini? Tindakan ini tidak dapat dibatalkan.
                </p>
                
                <div className="flex gap-3 w-full">
                   <button
                      onClick={() => setDeleteModalOpen(false)}
                      className="flex-1 px-4 py-2.5 bg-canvas-soft text-ink font-medium rounded-xl hover:bg-hairline transition-colors"
                   >
                      Batal
                   </button>
                   <button
                      onClick={handleDeleteArchive}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/30 transition-all"
                   >
                      Ya, Hapus
                   </button>
                </div>
             </div>
          </div>
       </div>
    );
  };

   const renderDeleteRequestModal = () => {
      if (!deleteRequestModalOpen) return null;
      return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-all duration-300">
            <div 
               className="bg-canvas border border-hairline rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300"
               onClick={(e) => e.stopPropagation()}
            >
               <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                     </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Pengajuan?</h3>
                  <p className="text-gray-500 mb-6">
                     Apakah Anda yakin ingin menghapus pengajuan layanan ini? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  
                  <div className="flex gap-3 w-full">
                     <button
                        onClick={() => setDeleteRequestModalOpen(false)}
                        className="flex-1 px-4 py-2.5 bg-canvas-soft text-ink font-medium rounded-xl hover:bg-hairline transition-colors"
                     >
                        Batal
                     </button>
                     <button
                        onClick={handleDeleteRequest}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/30 transition-all"
                     >
                        Ya, Hapus
                     </button>
                  </div>
               </div>
            </div>
         </div>
      );
   };

  const renderAddUserModal = () => {
     if (!showAddUserModal) return null;
     return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-all duration-300">
           <div className="bg-canvas border border-hairline rounded-sm shadow-xl w-full max-w-[400px] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-hairline flex justify-between items-center bg-canvas-soft">
                 <h3 className="font-semibold text-ink text-[15px] flex items-center gap-2">
                    <Users size={16} className="text-primary" /> Tambah Pengguna Baru
                 </h3>
                 <button onClick={() => setShowAddUserModal(false)} className="text-ink-mute hover:text-ink transition-colors p-1">
                    <X size={16} />
                 </button>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar">
                 {addUserError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xs text-[13px]">
                       {addUserError}
                    </div>
                 )}
                 <form id="add-user-form" onSubmit={handleAddUserSubmit} className="space-y-4">
                    <div>
                       <label className="block text-[13px] font-medium text-ink mb-1.5">Nama Lengkap</label>
                       <input 
                          type="text" 
                          required 
                          value={newUserForm.name}
                          onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                          className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 outline-none focus:border-ink"
                          placeholder="Nama Lengkap"
                       />
                    </div>
                    <div>
                       <label className="block text-[13px] font-medium text-ink mb-1.5">Email</label>
                       <input 
                          type="email" 
                          required 
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                          className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 outline-none focus:border-ink"
                          placeholder="contoh@sementonasa.co.id"
                       />
                    </div>
                    <div>
                       <label className="block text-[13px] font-medium text-ink mb-1.5">Role</label>
                       <select 
                          value={newUserForm.role}
                          onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                          className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 outline-none focus:border-ink"
                       >
                          <option value="user">User Biasa</option>
                          <option value="admin_dept">Admin Departemen</option>
                          <option value="pic_gedung">Admin Gedung</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-[13px] font-medium text-ink mb-1.5">Password</label>
                       <input 
                          type="password" 
                          required
                          minLength={6}
                          value={newUserForm.password}
                          onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                          className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 outline-none focus:border-ink"
                          placeholder="Minimal 6 karakter"
                       />
                    </div>
                 </form>
              </div>
              <div className="p-4 border-t border-hairline bg-canvas-soft flex justify-end gap-3">
                 <button 
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 text-[13px] font-semibold text-ink-mute hover:text-ink transition-colors"
                 >
                    Batal
                 </button>
                 <button 
                    type="submit"
                    form="add-user-form"
                    disabled={isAddingUser}
                    className="bg-primary hover:bg-primary-deep text-on-primary px-5 py-2 rounded-sm text-[13px] font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                 >
                    {isAddingUser ? "Menyimpan..." : "Simpan Pengguna"}
                 </button>
              </div>
           </div>
        </div>
     );
  };

  const renderChangeRoleModal = () => {
     if (!showChangeRoleModal || !userToChangeRole) return null;

     return (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
           <div className="bg-canvas border border-hairline rounded-sm shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-hairline flex items-center justify-between bg-canvas-soft">
                 <h3 className="font-semibold text-ink text-[14px]">Ubah Jabatan Pengguna</h3>
                 <button onClick={() => setShowChangeRoleModal(false)} className="text-ink-mute hover:text-ink">
                    <X size={18} />
                 </button>
              </div>
              <div className="p-5">
                 <div className="mb-4">
                    <p className="text-[13px] text-ink-mute mb-1">Pengguna:</p>
                    <p className="font-medium text-ink">{userToChangeRole.name}</p>
                    <p className="text-[12px] text-ink-mute font-mono">{userToChangeRole.email}</p>
                 </div>
                 <div>
                    <label className="block text-[13px] font-medium text-ink mb-1.5">Pilih Jabatan Baru</label>
                    <select 
                       value={newRole}
                       onChange={(e) => setNewRole(e.target.value)}
                       className="w-full bg-canvas border border-hairline text-[13px] rounded-xs px-3 py-2 outline-none focus:border-ink"
                    >
                       <option value="user">Staf Biasa</option>
                       <option value="admin_dept">Admin Departemen</option>
                       <option value="pic_gedung">Admin Gedung</option>
                       <option value="superadmin">Superadmin</option>
                    </select>
                 </div>
              </div>
              <div className="p-4 border-t border-hairline bg-canvas-soft flex justify-end gap-3">
                 <button 
                    onClick={() => setShowChangeRoleModal(false)}
                    className="px-4 py-2 text-[13px] font-semibold text-ink-mute hover:text-ink transition-colors"
                 >
                    Batal
                 </button>
                 <button 
                    onClick={() => handleChangeRole(userToChangeRole.id, newRole)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-sm text-[13px] font-semibold transition-colors flex items-center gap-2"
                 >
                    Simpan Perubahan
                 </button>
              </div>
           </div>
        </div>
     );
  };

  {/* REJECT CONFIRMATION MODAL */}
  const renderRejectModal = () => {
    if (!rejectModalOpen) return null;
    return (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-all duration-300">
          <div 
             className="bg-canvas border border-hairline rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300"
             onClick={(e) => e.stopPropagation()}
          >
             <div className="p-6">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                   </svg>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Tolak Pengajuan?</h3>
                <p className="text-gray-500 mb-4 text-center text-sm">
                   Harap berikan alasan yang jelas mengapa berkas arsip ini ditolak.
                </p>
                
                <div className="mb-6">
                   <label htmlFor="rejectReason" className="sr-only">Alasan Penolakan</label>
                   <textarea 
                      id="rejectReason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Masukkan alasan penolakan..."
                      className="w-full border border-hairline rounded-xl px-3 py-2.5 text-sm text-ink focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none bg-canvas-soft"
                      rows={3}
                      autoFocus
                   />
                </div>
                
                <div className="flex gap-3 w-full">
                   <button
                      onClick={() => setRejectModalOpen(false)}
                      className="flex-1 px-4 py-2.5 bg-canvas-soft text-ink font-medium rounded-xl hover:bg-hairline transition-colors"
                   >
                      Batal
                   </button>
                   <button
                      onClick={submitRejectArchive}
                      className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-500/30 transition-all"
                   >
                      Ya, Tolak
                   </button>
                </div>
             </div>
          </div>
       </div>
    );
  };


  // 1. ADD ARCHIVE FORM VIEW
  if (showAddForm) {
     return (
        <div className="space-y-6 w-full pb-10">
           <div className="pb-4 border-b border-hairline flex items-center gap-4">
              <button 
                 onClick={() => {
                    setShowAddForm(false);
                    setEditArchiveItem(null);
                    setFormData({
                       kodeKlasifikasi: "",
                       jenisBerkas: "",
                       judulBerkas: "",
                       departemen: "",
                       tahun: new Date().getFullYear().toString(),
                       tanggalTerima: "",
                       jangkaWaktu: "",
                       gedung: "",
                       lorong: "",
                       rak: "",
      baris: "",
                       linkBerkas: "",
                       status: "Menunggu ACC",
                       keterangan: "",
                       isiBundel: []
                    });
                 }} 
                 className="p-1.5 hover:bg-canvas-soft rounded-xs border border-hairline text-ink transition-colors"
              >
                 <ArrowLeft size={18} />
              </button>
              <div>
                 <h2 className="text-[18px] md:text-display-md font-medium tracking-tight text-ink">
                    {editArchiveItem 
                     ? 'Edit Berkas Arsip' 
                     : ((role === 'superadmin' || role === 'pic_gedung') ? 'Tambah Berkas Arsip' : 'Ajukan Berkas Arsip Baru')}
                 </h2>
                 <p className="text-ink-mute text-[12px] md:text-[14px]">
                    {editArchiveItem 
                     ? `Mengedit data berkas: ${editArchiveItem.judulBerkas}` 
                     : (role === 'pic_gedung' 
                        ? 'Masukkan metadata berkas untuk langsung diarsipkan secara aktif.' 
                        : 'Berkas akan diajukan ke PIC Gedung Arsip untuk disetujui (ACC) terlebih dahulu.')}
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
                     {(() => {
                        const currentDept = (formData.departemen || "").toUpperCase();
                        const isPredefined = masterDepartments.includes(currentDept);
                        
                        return (
                           <div className="flex flex-col gap-2">
                              <select
                                 name="departemen_select"
                                 value={isPredefined ? currentDept : (currentDept === "" ? (isCustomDept ? "LAINNYA" : "") : "LAINNYA")}
                                 onChange={(e) => {
                                    if (e.target.value === "LAINNYA") {
                                       setIsCustomDept(true);
                                       setFormData(prev => ({ ...prev, departemen: "" }));
                                    } else {
                                       setIsCustomDept(false);
                                       setFormData(prev => ({ ...prev, departemen: e.target.value }));
                                    }
                                 }}
                                 required={!isCustomDept}
                                 className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink"
                              >
                                 <option value="" disabled>Pilih Departemen</option>
                                 {masterDepartments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                 ))}
                                 {((role === 'superadmin' || role === 'pic_gedung') || isCustomDept || (!isPredefined && currentDept !== "")) && (
                                    <option value="LAINNYA">Lainnya (Kustom)...</option>
                                 )}
                              </select>
                              
                              {isCustomDept && (
                                 <input 
                                    type="text" 
                                    name="departemen"
                                    value={formData.departemen}
                                    onChange={handleInputChange}
                                    required={isCustomDept}
                                    placeholder="Masukkan nama departemen kustom"
                                    className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                                 />
                              )}
                           </div>
                        );
                     })()}
                 </div>


                 <div className="space-y-2 md:col-span-2">
                    <label className="block text-[13px] font-medium text-ink mb-2">Isi (Lampiran)</label>
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                       <input 
                          type="text" 
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddIsiBundel(); } }}
                          placeholder="Contoh: Dokumen 10000, Dokumen 20192020"
                          className="flex-1 bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                       />
                       <button 
                          type="button" 
                          onClick={handleAddIsiBundel}
                          className="w-full sm:w-auto justify-center bg-canvas border border-hairline px-4 py-2 text-[13px] font-medium rounded-xs hover:bg-canvas-soft transition-colors flex items-center gap-1 text-ink"
                       >
                          <Plus size={16} /> Tambah
                       </button>
                    </div>
                    {formData.isiBundel && formData.isiBundel.length > 0 && (
                       <ul className="space-y-2">
                          {formData.isiBundel.map((item, idx) => (
                             <li key={idx} className="flex justify-between items-center bg-canvas-soft border border-hairline px-3 py-2 rounded-xs text-[13px] text-ink">
                                <span>{item}</span>
                                <button type="button" onClick={() => handleRemoveIsiBundel(idx)} className="text-red-500 hover:text-red-700">
                                   <X size={16} />
                                </button>
                             </li>
                          ))}
                       </ul>
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
                       placeholder="e.g. 5 tahun"
                       className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                    />
                 </div>

                 {(role === 'superadmin' || role === 'pic_gedung') && (
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
                              placeholder="Contoh: A"
                              className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="block text-[13px] font-medium text-ink">Baris</label>
                           <input 
                              type="text" 
                              name="baris"
                              value={formData.baris}
                              onChange={handleInputChange}
                              required
                              placeholder="Contoh: 1"
                              className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink"
                           />
                        </div>
                    </>
                 )}

                 {(role === 'superadmin' || role === 'pic_gedung') && (
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
                       placeholder="https://drive.google.com/file/d/..."
                       className="w-full bg-canvas border border-hairline text-[14px] rounded-xs pl-9 pr-4 py-2.5 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="block text-[13px] font-medium text-ink">Keterangan (Singkat)</label>
                 <textarea 
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={(e) => setFormData(prev => ({ ...prev, keterangan: e.target.value }))}
                    rows={3}
                    placeholder="Catatan tambahan terkait berkas..."
                    className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                 />
              </div>

              <div className="pt-4 border-t border-hairline flex justify-end gap-3">
                 <button 
                    type="button" 
                    onClick={() => {
                       setShowAddForm(false);
                       setEditArchiveItem(null);
                       setFormData({
                          kodeKlasifikasi: "",
                          jenisBerkas: "",
                          judulBerkas: "",
                          departemen: "",
                          tahun: new Date().getFullYear().toString(),
                          tanggalTerima: "",
                          jangkaWaktu: "",
                          gedung: "",
                          lorong: "",
                          rak: "",
      baris: "",
                          linkBerkas: "",
                          status: "Menunggu ACC",
                          keterangan: "",
                          isiBundel: []
                       });
                    }} 
                    className="btn-outline"
                 >
                    Batal
                 </button>
                 <button 
                    type="submit" 
                    className="btn-primary"
                 >
                    {editArchiveItem 
                     ? 'Simpan Perubahan' 
                     : ((role === 'superadmin' || role === 'pic_gedung') ? 'Simpan Berkas' : 'Ajukan Berkas')}
                 </button>
              </div>
           </form>
        </div>
     );
  }

  // 1.5 LAYANAN PEMINJAMAN / KUNJUNGAN FORM VIEW (NEW FORM FOR USERS)
  if (showServiceForm) {
     return (
        <div className="space-y-6 w-full pb-10">
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

              <div className="space-y-1.5">
                 <label className="block text-[13px] font-medium text-ink">Link Surat Elektronik (Opsional)</label>
                 <input 
                    type="url"
                    name="link_surat"
                    value={serviceFormData.link_surat || ""}
                    onChange={handleServiceInputChange}
                    placeholder="https://link-surat-pengajuan..."
                    className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink text-ink"
                 />
                 <p className="text-[11px] text-ink-mute mt-1">Lampirkan link surat permohonan resmi jika ada (Google Drive, OneDrive, dsb).</p>
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
  if (activeMenu === "Persetujuan (ACC)" && (role === 'superadmin' || role === 'pic_gedung')) {
     const pendingSubmissions = archives.filter(item => item.status === "Menunggu ACC");
     
     return (
        <div className="space-y-6 w-full pb-10">
           <div className="flex flex-col md:items-start justify-between gap-4 mb-6">
              <div className="shrink-0">
                  <div className="flex-1 min-w-0">
                     <h2 className="text-[18px] md:text-[24px] font-medium tracking-tight text-ink flex items-center gap-2">
                        Persetujuan Berkas Masuk
                     </h2>
                     <p className="text-ink-mute text-[12px] md:text-[13px] mt-0.5">
                        Periksa berkas digital pengajuan departemen dan tentukan lokasi penyimpanan fisiknya sebelum menyetujui.
                     </p>
                  </div>
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
                 <div className="mt-2">
                    <label className="block text-[11px] font-medium text-ink mb-1">Pilih Lokasi Rak</label>
                    <select 
                       className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-ink text-ink font-mono"
                       value={JSON.stringify(approvalLocation)}
                       onChange={(e) => {
                          try {
                             const loc = JSON.parse(e.target.value);
                             setApprovalLocation(loc);
                          } catch (err) {}
                       }}
                    >
                       <option value='{"gedung":"A","lorong":"","rak":""}' disabled>Pilih Lokasi Rak...</option>
                       {masterLocations.map(l => (
                          <option key={l.id} value={JSON.stringify({gedung: l.gedung, lorong: l.lorong, rak: l.rak, baris: l.baris})}>
                             Gedung {l.gedung} - Lorong {l.lorong} - Rak {l.rak} - Baris {l.baris}
                          </option>
                       ))}
                    </select>
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
                       <th className="p-3">Keterangan</th>
                       <th className="p-3 text-center">Isi Bundel</th>
                       <th className="p-3 text-center">Tahun</th>
                       <th className="p-3 text-center">Tanggal Ajukan</th>
                       <th className="p-3 text-center">Link Berkas</th>
                       <th className="p-3 text-center">Status</th>
                       <th className="p-3 text-center">Tindakan</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-hairline">
                    {pendingSubmissions.length > 0 ? (
                       pendingSubmissions.map((archive, index) => (
                          <tr 
                             key={archive.no} 
                             onClick={(e) => {
                                if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
                                setSelectedDetailItem(archive);
                                setDetailType("archive");
                             }}
                             className="hover:bg-canvas-soft/50 transition-colors text-ink cursor-pointer"
                          >
                             <td className="p-3 text-center font-mono text-ink-mute">{index + 1}</td>
                             <td className="p-3 font-medium">{archive.kodeKlasifikasi}</td>
                             <td className="p-3 text-ink-mute uppercase">{archive.jenisBerkas}</td>
                             <td className="p-3 font-medium text-ink">{archive.judulBerkas}</td>
                             <td className="p-3"><span className="font-mono text-xs bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink">{archive.departemen}</span></td>
                             <td className="p-3 text-ink-mute text-[11px] max-w-[150px] truncate" title={archive.keterangan}>{archive.keterangan || "-"}</td>
                             <td className="p-3 text-center">
                                <span className="bg-canvas-soft border border-hairline px-2 py-0.5 rounded-md text-[10px] max-w-[200px] truncate inline-block" title={archive.isiBundel?.join(', ')}>
                                   {archive.isiBundel?.join(', ') || '-'}
                                </span>
                             </td>
                             <td className="p-3 text-center font-mono">{archive.tahun}</td>
                             <td className="p-3 text-center font-mono whitespace-nowrap">{formatDate(archive.tanggalTerima)}</td>
                             <td className="p-3 text-center">
                                 {archive.linkBerkas && archive.linkBerkas !== '-' ? (
                                    <a 
                                       href={archive.linkBerkas} 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="inline-flex items-center gap-1.5 text-primary hover:underline hover:text-primary-deep font-semibold"
                                    >
                                       <ExternalLink size={14} /> Buka Berkas
                                    </a>
                                 ) : (
                                    <span className="inline-flex items-center gap-1.5 text-ink-mute/50 cursor-not-allowed font-semibold">
                                       <ExternalLink size={14} /> Buka Berkas
                                    </span>
                                 )}
                             </td>
                             <td className="p-3 text-center">
                                <StatusBadge status={archive.status} />
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
                                      onClick={() => confirmRejectArchive(archive.no)}
                                      className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-3 py-1 rounded-sm text-[11px]"
                                   >
                                      Tolak
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))
                    ) : (
                       <tr>
                          <td colSpan={12} className="p-8 text-center text-ink-mute text-[14px]">
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
                 pendingSubmissions.map((archive, index) => (
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
                             <p className="text-[12px] text-ink-mute mt-0.5 uppercase">{archive.jenisBerkas}</p>
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
                             onClick={(e) => {
                                 e.stopPropagation();
                                 confirmRejectArchive(archive.no);
                              }}
                             className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 rounded-sm text-[12px] text-center"
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
           {renderDeleteModal()}
           {renderRejectModal()}
        </div>
     );
  }

  // 2.5 LAYANAN ARSIP (PEMINJAMAN & KUNJUNGAN LIST VIEW FOR ALL ROLES)
  if (activeMenu === "Layanan Arsip") {
     const filteredRequests = (role === 'superadmin' || role === 'pic_gedung') ? requestsList : requestsList.filter(req => req.user_name === user?.name);

     return (
        <div className="flex flex-col h-full w-full">
           <div className="flex-none flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="shrink-0">
                 <h2 className="text-[18px] md:text-[24px] font-medium tracking-tight text-ink">
                    Layanan Peminjaman & Kunjungan Arsip
                 </h2>
                 <p className="text-ink-mute text-[12px] md:text-[13px] mt-0.5">
                    {role === 'pic_gedung' 
                     ? "Kelola permohonan peminjaman dokumen fisik dan registrasi kunjungan gedung kearsipan."
                     : "Lihat status pengajuan peminjaman berkas atau buat pengajuan kunjungan fisik baru."}
                 </p>
              </div>

              {(role !== 'superadmin' && role !== 'pic_gedung') && (
                 <button 
                     onClick={() => setShowServiceForm(true)}
                     className="bg-primary hover:bg-primary-deep text-[12px] text-on-primary font-medium px-3 py-1.5 rounded-sm transition-colors flex items-center gap-2 self-start md:self-auto"
                  >
                     <Plus size={14} /> Buat Pengajuan Layanan
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
           <div className="hidden md:flex flex-col flex-1 border border-hairline bg-canvas rounded-xs overflow-hidden min-h-0 mb-4">
              <div className="flex-1 overflow-auto">
                 <table className="w-full text-left text-[12px] border-collapse min-w-[850px]">
                    <thead className="sticky top-0 z-10 bg-canvas-soft border-b border-hairline shadow-sm">
                       <tr className="text-ink font-semibold">
                       <th className="p-3 w-16 text-center">No</th>
                       <th className="p-3">Pemohon</th>
                       <th className="p-3">Jenis Layanan</th>
                       <th className="p-3">Detail Berkas / Rencana</th>
                       <th className="p-3 text-center">Tanggal / Waktu</th>
                       <th className="p-3">Keperluan</th>
                       <th className="p-3 text-center">Status</th>
                       {(role === 'superadmin' || role === 'pic_gedung') && <th className="p-3 text-center">Tindakan</th>}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-hairline">
                    {filteredRequests.length > 0 ? (
                       filteredRequests.map((req, idx) => (
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
                                   ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20' 
                                   : 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20'
                                }`}>
                                   {req.type === 'peminjaman' ? <BookOpen size={12} /> : <MapPin size={12} />}
                                   {req.type}
                                </span>
                             </td>
                             <td className="p-3 font-medium text-ink max-w-[250px] truncate">
                                {req.type === 'peminjaman' ? req.archive_title : "Kunjungan Gedung Arsip"}
                             </td>
                             <td className="p-3 text-center font-mono text-ink-mute whitespace-nowrap">
                                {req.type === 'peminjaman' ? (
                                   <div className="inline-flex items-center gap-1.5">
                                      <span className="text-ink font-semibold">{formatDate(req.date)}</span>
                                      <span className="text-[10px] text-ink-mute font-sans px-1 bg-hairline-cool rounded-xs font-normal">s/d</span>
                                      <span className="text-ink font-semibold">{formatDate(req.time_or_return)}</span>
                                   </div>
                                ) : (
                                   <div className="inline-flex items-center gap-1">
                                      <span className="text-ink font-semibold">{formatDate(req.date)}</span>
                                      <span className="text-[11px] text-ink-mute font-sans">({req.time_or_return})</span>
                                   </div>
                                )}
                             </td>
                             <td className="p-3 text-ink-mute max-w-[200px] truncate" title={req.purpose}>{req.purpose}</td>
                             <td className="p-3 text-center">
                                <StatusBadge status={req.status} alasanPenolakan={req.reject_reason} />
                             </td>
                             {(role === 'superadmin' || role === 'pic_gedung') && (
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
                                               onClick={(e) => {
                                                  e.stopPropagation();
                                                  confirmRejectRequest(req.id);
                                               }}
                                               className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-2 py-1 rounded-sm text-[11px]"
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
                                          <button 
                                             onClick={(e) => { e.stopPropagation(); confirmDeleteRequest(req.id); }}
                                             className="bg-transparent border border-red-500/30 text-red-500 hover:bg-red-50 font-medium px-3.5 py-1 rounded-sm text-[11px] transition-colors"
                                          >
                                             Hapus
                                          </button>
                                       )}
                                   </div>
                                </td>
                             )}
                          </tr>
                       ))
                    ) : (
                       <tr>
                          <td colSpan={(role === 'superadmin' || role === 'pic_gedung') ? 8 : 7} className="p-8 text-center text-ink-mute text-[14px]">
                             Tidak ada riwayat pengajuan layanan saat ini.
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
              </div>
           </div>

           {/* Mobile Card List View (Mobile First Design) */}
           <div className="block md:hidden space-y-4">
              {filteredRequests.length > 0 ? (
                 filteredRequests.map((req, idx) => (
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
                          <div>
                             <StatusBadge status={req.status} alasanPenolakan={req.reject_reason} isSmall={true} />
                          </div>
                       </div>
                       <div className="text-[12px] text-ink border-t border-hairline pt-2.5">
                          <p className="font-semibold text-ink-mute text-[9px] uppercase">Detail Pengajuan:</p>
                          <p className="font-medium mt-0.5 truncate">{req.type === 'peminjaman' ? req.archive_title : "Kunjungan Gedung Arsip"}</p>
                          <p className="text-ink-mute font-mono text-[11px] mt-1">
                             {req.type === 'peminjaman' 
                                 ? `Sewa: ${formatDate(req.date)} s/d ${formatDate(req.time_or_return)}` 
                                 : `Jadwal: ${formatDate(req.date)} (${req.time_or_return})`}
                          </p>
                       </div>
                       {(role === 'superadmin' || role === 'pic_gedung') && (
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
                                      onClick={(e) => { e.stopPropagation(); confirmRejectRequest(req.id); }}
                                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium py-1.5 rounded-sm text-[11px]"
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
                                <button 
                                   onClick={(e) => { e.stopPropagation(); confirmDeleteRequest(req.id); }}
                                   className="flex-1 bg-transparent border border-red-500/30 text-red-500 hover:bg-red-50 font-medium py-1.5 rounded-sm text-[11px] transition-colors"
                                >
                                   Hapus Pengajuan
                                </button>
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
            {renderDeleteModal()}
            {renderDeleteRequestModal()}
            {renderRejectModal()}
            {renderServiceRejectModal()}
         </div>
     );
  }

  // PENGATURAN SISTEM (MASTER DATA)
  if (activeMenu === "Pengaturan" && role === 'superadmin') {
     return <SettingsView />;
  }

  // AUDIT TRAIL (RIWAYAT LOG)
  if (activeMenu === "Riwayat Log" && role === 'superadmin') {
     return <AuditLogView />;
  }

  // 3. PERSETUJUAN USER / MANAJEMEN USER (PIC Gedung ONLY)
  if (activeMenu === "Manajemen User" && role === 'superadmin') {
     const pendingUsers = usersList.filter(u => !u.approved);
     const approvedUsers = usersList.filter(u => u.approved);

     return (
        <div className="space-y-8 w-full pb-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="shrink-0">
                 <h2 className="text-[18px] md:text-[24px] font-medium tracking-tight text-ink">
                    Manajemen & Persetujuan Pengguna
                 </h2>
                 <p className="text-ink-mute text-[12px] md:text-[13px] mt-0.5">
                    Berikan persetujuan akses (ACC) bagi staf departemen yang mendaftar baru serta kelola akun pengguna aktif.
                 </p>
              </div>
              <button 
                 onClick={() => setShowAddUserModal(true)}
                 className="bg-primary hover:bg-primary-deep text-on-primary px-4 py-2 rounded-sm text-[13px] font-semibold flex items-center gap-2 whitespace-nowrap shadow-sm"
              >
                 <Users size={16} /> Tambah Pengguna
              </button>
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
                                         onClick={(e) => {
                                            e.stopPropagation();
                                            handleRejectUser(item.id);
                                         }}
                                         className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-sm text-xs transition-colors flex-1"
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
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-sm text-[11px] flex items-center justify-center gap-1"
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
                                   {item.role === 'superadmin' ? 'Superadmin' : item.role === 'pic_gedung' ? 'Admin Gedung' : item.role === 'admin_dept' ? 'Admin Departemen' : 'Staf Biasa'}
                                </span>
                             </td>
                             <td className="p-3 text-center">
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                   Aktif (Disetujui)
                                </span>
                             </td>
                             <td className="p-3">
                                <div className="flex items-center justify-center gap-3">
                                   {item.role !== 'superadmin' ? (
                                      <>
                                         <button 
                                            onClick={(e) => {
                                               e.stopPropagation();
                                               setUserToChangeRole(item);
                                               setNewRole(item.role);
                                               setShowChangeRoleModal(true);
                                            }}
                                            className="p-1 text-ink-mute hover:text-blue-700 transition-colors"
                                            title="Ubah Jabatan Pengguna"
                                         >
                                            <Edit3 size={14} className="text-blue-600 hover:text-blue-800" />
                                         </button>
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); handleResetUserPassword(item.name, item.email); }}
                                            className="p-1 text-ink-mute hover:text-amber-700 transition-colors"
                                            title="Reset Password Pengguna"
                                         >
                                            <Key size={14} className="text-amber-600 hover:text-amber-800" />
                                         </button>
                                         <button 
                                            onClick={(e) => {
                                               e.stopPropagation();
                                               if (confirm(`Apakah Anda yakin ingin MENCABUT AKSES (Blokir) pengguna ${item.name}?`)) {
                                                  handleBlockUser(item.id);
                                               }
                                            }}
                                            className="p-1 text-ink-mute hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                                            title="Cabut Akses Pengguna"
                                         >
                                            <Trash2 size={14} className="text-rose-600 hover:text-rose-700" />
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
                                {item.role === 'superadmin' ? 'Superadmin' : item.role === 'pic_gedung' ? 'Admin Gedung' : item.role === 'admin_dept' ? 'Admin Departemen' : 'Staf Biasa'}
                             </span>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-2 py-0.5 rounded-full font-medium">
                             Aktif
                          </span>
                       </div>
                       {item.role !== 'superadmin' && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-hairline">
                             <button 
                                onClick={(e) => {
                                   e.stopPropagation();
                                   setUserToChangeRole(item);
                                   setNewRole(item.role);
                                   setShowChangeRoleModal(true);
                                }}
                                className="flex-1 min-w-[30%] bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-1.5 rounded-sm text-[11px] flex items-center justify-center gap-1.5"
                                title="Ubah Jabatan"
                             >
                                <Edit3 size={12} /> Ubah Jabatan
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleResetUserPassword(item.name, item.email); }}
                                className="flex-1 min-w-[30%] bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 py-1.5 rounded-sm text-[11px] flex items-center justify-center gap-1.5"
                                title="Reset Password"
                             >
                                <Key size={12} /> Reset Sandi
                             </button>
                             <button 
                                onClick={(e) => {
                                   e.stopPropagation();
                                   if (confirm(`Apakah Anda yakin ingin MENCABUT AKSES pengguna ${item.name}?`)) {
                                      handleBlockUser(item.id);
                                   }
                                }}
                                className="flex-1 min-w-[30%] bg-rose-600 hover:bg-rose-700 text-white py-1.5 rounded-sm text-[11px] flex items-center justify-center gap-1.5"
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
               {renderDeleteModal()}
               {renderRejectModal()}
               {renderAddUserModal()}
               {renderChangeRoleModal()}
           </div>

        </div>
     );
  }

  // 3.5 VIEW: GANTI PASSWORD MANDIRI (NEW VIEW FOR ALL ROLES)
  if (activeMenu === "Ganti Password") {
     return (
        <div className="space-y-6 max-w-[500px] mx-auto pb-10">
           <div>
              <h2 className="text-[18px] md:text-[24px] font-medium tracking-tight text-ink">
                 Ganti Kata Sandi
              </h2>
              <p className="text-ink-mute text-[12px] md:text-[13px] mt-0.5">
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
  if (activeMenu === "Dashboard") {
     const pendingCount = archives.filter(item => item.status === "Menunggu ACC").length;
     const pendingUsersCount = usersList.filter(u => !u.approved).length;
     const pendingRequestsCount = requestsList.filter(r => r.status === "Menunggu ACC").length;
     
     return (
        <div className="space-y-8 w-full">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
             <div className="shrink-0">
                <h2 className="text-[18px] md:text-[24px] font-medium tracking-tight text-ink">
                   Selamat Datang, {user?.name || (role === 'superadmin' ? "Superadmin" : role === 'pic_gedung' ? "Admin Gedung" : role === 'admin_dept' ? "Admin Departemen" : "User") }.
                </h2>
                <p className="text-ink-mute text-[12px] md:text-[13px] mt-0.5">
                   Kelola arsip korporasi Anda dengan presisi.
                </p>
             </div>
             <div className="flex gap-3">
                {(role === 'superadmin' || role === 'pic_gedung') && (
                  <button className="btn-outline flex items-center gap-2">
                    <FileText size={16} /> Laporan Bulanan
                  </button>
                )}
                <button 
                  onClick={() => { setIsCustomDept(false); setShowAddForm(true); }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={16} /> Tambah Arsip
                </button>
             </div>
           </div>

           {/* Alerts for Pending Submissions and Pending User Approvals */}
           <div className="space-y-3">
              {(role === 'superadmin' || role === 'pic_gedung') && pendingCount > 0 && (
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

              {(role === 'superadmin' || role === 'pic_gedung') && pendingRequestsCount > 0 && (
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

              {role === 'superadmin' && pendingUsersCount > 0 && (
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
                       {(role === 'superadmin' || role === 'pic_gedung') ? 'Total (Semua Dept)' : 'Total Arsip'}
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

           {/* SUMMARY CARDS */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-canvas border border-hairline rounded-sm p-4 flex flex-col gap-2 shadow-xs hover:shadow-sm transition-shadow">
                 <div className="flex items-center justify-between text-ink-mute">
                    <span className="text-[12px] font-semibold uppercase tracking-wider">Total Arsip</span>
                    <Archive size={16} />
                 </div>
                 <span className="text-3xl font-bold text-ink">{totalArchives}</span>
              </div>
              <div className="bg-canvas border border-hairline rounded-sm p-4 flex flex-col gap-2 shadow-xs hover:shadow-sm transition-shadow">
                 <div className="flex items-center justify-between text-ink-mute">
                    <span className="text-[12px] font-semibold uppercase tracking-wider">Departemen Aktif</span>
                    <Users size={16} />
                 </div>
                 <span className="text-3xl font-bold text-ink">{totalActiveDepts}</span>
              </div>
              <div className="bg-canvas border border-hairline rounded-sm p-4 flex flex-col gap-2 shadow-xs hover:shadow-sm transition-shadow">
                 <div className="flex items-center justify-between text-ink-mute">
                    <span className="text-[12px] font-semibold uppercase tracking-wider">Arsip {currentYear}</span>
                    <Calendar size={16} />
                 </div>
                 <span className="text-3xl font-bold text-ink">{archivesThisYear}</span>
              </div>
              <div className="bg-canvas border border-hairline rounded-sm p-4 flex flex-col gap-2 shadow-xs hover:shadow-sm transition-shadow">
                 <div className="flex items-center justify-between text-ink-mute">
                    <span className="text-[12px] font-semibold uppercase tracking-wider">Menunggu ACC</span>
                    <Clock size={16} className="text-amber-500" />
                 </div>
                 <span className="text-3xl font-bold text-amber-600">{pendingApprovals}</span>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* BAR CHART */}
               <div className="bg-canvas border border-hairline rounded-sm p-6 flex flex-col">
                  <div className="mb-6">
                     <h3 className="text-[15px] font-bold text-ink tracking-tight">Statistik per Departemen</h3>
                     <p className="text-[12px] text-ink-mute">Total arsip untuk 7 departemen teratas</p>
                  </div>
                  <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                           <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
                           <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
                           <Tooltip 
                              cursor={{ fill: '#F3F4F6' }} 
                              contentStyle={{ borderRadius: '4px', border: '1px solid #E5E7EB', fontSize: '12px', fontWeight: 'bold' }} 
                           />
                           <Bar dataKey="count" fill="#E11D48" radius={[4, 4, 0, 0]} barSize={32} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* AREA CHART */}
               <div className="bg-canvas border border-hairline rounded-sm p-6 flex flex-col">
                  <div className="mb-6">
                     <h3 className="text-[15px] font-bold text-ink tracking-tight">Tren Arsip per Tahun</h3>
                     <p className="text-[12px] text-ink-mute">Pertumbuhan jumlah dokumen dari waktu ke waktu</p>
                  </div>
                  <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={yearlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#E11D48" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#E11D48" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                           <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
                           <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
                           <Tooltip 
                              contentStyle={{ borderRadius: '4px', border: '1px solid #E5E7EB', fontSize: '12px', fontWeight: 'bold' }} 
                           />
                           <Area type="monotone" dataKey="count" stroke="#E11D48" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
           </div>
        </div>
     );
  }

  const renderPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
          for (let i = 1; i <= totalPages; i++) {
              pages.push(i);
          }
      } else {
          pages.push(1);
          
          let startPage = Math.max(2, currentPage - 1);
          let endPage = Math.min(totalPages - 1, currentPage + 1);
          
          if (currentPage <= 2) {
              endPage = 3;
          } else if (currentPage >= totalPages - 1) {
              startPage = totalPages - 2;
          }
          
          if (startPage > 2) pages.push('...');
          for (let i = startPage; i <= endPage; i++) {
              pages.push(i);
          }
          if (endPage < totalPages - 1) pages.push('...');
          
          pages.push(totalPages);
      }
      
      return pages.map((page, index) => (
          page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 py-1 text-ink-mute">...</span>
          ) : (
              <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(page as number)}
                  className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
                      currentPage === page 
                          ? 'bg-primary text-on-primary' 
                          : 'bg-canvas border border-hairline text-ink hover:bg-canvas-soft'
                  }`}
              >
                  {page}
              </button>
          )
      ));
  };

  const renderDuplicateAlertModal = () => {
     if (!duplicateAlertModalOpen || !foundDuplicateRecord) return null;
     return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
           <div className="bg-canvas border border-hairline rounded-sm shadow-2xl max-w-[500px] w-full p-6 text-ink">
              <h3 className="font-bold text-[16px] text-ink flex items-center gap-2 mb-3">
                 <AlertTriangle size={20} className="text-amber-500" />
                 Peringatan Duplikasi Data
              </h3>
              <p className="text-[13px] text-ink-mute mb-4">
                 Sistem mendeteksi bahwa data dengan Judul, Jenis, Departemen, dan Lokasi yang sama sudah ada di database:
              </p>
              <div className="bg-canvas-soft border border-hairline p-3 rounded-xs mb-5 text-[12px] space-y-1">
                 <p><span className="font-semibold">Judul Berkas:</span> {foundDuplicateRecord.judulBerkas}</p>
                 <p><span className="font-semibold">Jenis Berkas:</span> {foundDuplicateRecord.jenisBerkas}</p>
                 <p><span className="font-semibold">Departemen:</span> {foundDuplicateRecord.departemen}</p>
                 <p><span className="font-semibold">Lokasi:</span> Gedung {foundDuplicateRecord.gedung || '-'} / Lorong {foundDuplicateRecord.lorong || '-'} / Rak {foundDuplicateRecord.rak || '-'} / Baris {foundDuplicateRecord.baris || '-'}</p>
              </div>
              <div className="flex justify-end gap-2">
                 <button 
                    onClick={() => {
                       setDuplicateAlertModalOpen(false);
                       setFoundDuplicateRecord(null);
                       setPendingFormData(null);
                    }}
                    className="px-4 py-2 bg-canvas hover:bg-canvas-soft border border-hairline rounded-xs text-[13px] font-semibold"
                 >
                    Batal
                 </button>
                 <button 
                    onClick={handleConfirmDuplicateTimpa}
                    className="px-4 py-2 bg-primary hover:bg-primary-deep text-on-primary rounded-xs text-[13px] font-semibold transition-colors"
                 >
                    Timpa Data Lama
                 </button>
              </div>
           </div>
        </div>
     );
  };

  const renderBulkDuplicateAlertModal = () => {
     if (!bulkDuplicateAlertModalOpen) return null;
     return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
           <div className="bg-canvas border border-hairline rounded-sm shadow-2xl max-w-[500px] w-full p-6 text-ink animate-in zoom-in-95 duration-200">
              <h3 className="font-bold text-[16px] text-ink flex items-center gap-2 mb-3">
                 <AlertTriangle size={20} className="text-amber-500" />
                 Duplikasi Data Saat Import
              </h3>
              <p className="text-[13px] text-ink-mute mb-2">
                 Ditemukan <span className="font-bold text-amber-600">{bulkDuplicates.length}</span> data duplikat dalam file Excel. Terdapat <span className="font-bold text-primary">{bulkNewRecords.length}</span> data baru yang siap diimpor.
              </p>
              <p className="text-[13px] text-ink-mute mb-5">
                 Apakah Anda ingin menimpa data yang sudah ada dengan data dari Excel, atau melewati data duplikat tersebut?
              </p>
              <div className="flex flex-col gap-2">
                 <button 
                    onClick={handleBulkDuplicateTimpa}
                    className="w-full text-left px-4 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xs text-primary font-semibold text-[13px] transition-colors"
                 >
                    Timpa Duplikat & Simpan Data Baru
                 </button>
                 <button 
                    onClick={handleBulkDuplicateLewati}
                    className="w-full text-left px-4 py-3 bg-canvas-soft hover:bg-hairline-cool border border-hairline rounded-xs text-ink font-semibold text-[13px] transition-colors"
                 >
                    Lewati Duplikat (Hanya Simpan Data Baru)
                 </button>
                 <button 
                    onClick={handleBulkDuplicateBatal}
                    className="w-full mt-2 text-center px-4 py-2 text-ink-mute hover:text-ink text-[13px] transition-colors"
                 >
                    Batalkan Seluruh Proses Import
                 </button>
              </div>
           </div>
        </div>
     );
  };

  // 4. VIEW: DAFTAR ARSIP GENERAL PAGE
  return (
    <div className="flex flex-col h-full w-full">
      
      {/* HEADER SECTION */}
      <div className="flex-none flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
           <h2 className="text-[18px] md:text-[24px] font-medium tracking-tight text-ink shrink-0">
              Daftar Berkas Arsip
           </h2>
           
           <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 w-full md:w-auto">
              {role !== 'user' && (
                 <>
                    <button 
                       onClick={handleExportExcel}
                       className="w-full md:w-auto border border-hairline-strong bg-canvas hover:bg-canvas-soft text-ink text-[14px] font-medium flex items-center justify-center gap-2 py-2 px-4 rounded-sm transition-colors"
                    >
                       <Download size={16} /> Export
                    </button>
                    
                    <label className="w-full md:w-auto border border-hairline-strong bg-canvas hover:bg-canvas-soft text-ink text-[14px] font-medium flex items-center justify-center gap-2 py-2 px-4 rounded-sm transition-colors cursor-pointer">
                       <Upload size={16} /> Import
                       <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
                    </label>
                 </>
              )}

              {(role === 'superadmin' || role === 'pic_gedung' || role === 'admin_dept') && (
                 <button 
                    onClick={() => setIsRecycleBin(!isRecycleBin)}
                    className={`col-span-2 md:col-span-1 w-full md:w-auto flex items-center justify-center gap-2 py-2 px-4 text-[14px] font-medium rounded-sm transition-colors ${isRecycleBin ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}
                 >
                    <Trash2 size={16} /> {isRecycleBin ? 'Kembali' : 'Sampah'}
                 </button>
              )}

              {role !== 'user' && (
                <button 
                   onClick={() => { setIsCustomDept(false); setShowAddForm(true); }}
                   className="col-span-2 md:col-span-1 w-full md:w-auto bg-primary hover:bg-primary-deep text-on-primary text-[14px] font-medium flex items-center justify-center gap-2 py-2 px-4 rounded-sm transition-colors"
                >
                   <Plus size={16} /> Tambah Berkas
                </button>
              )}
           </div>
        </div>
        
        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 w-full mt-2 md:mt-0 relative z-30">
           <div className="col-span-2 relative w-full md:flex-1 shrink-0">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input 
                 type="text" 
                 placeholder="Cari berkas, kode klasifikasi..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-canvas border border-hairline text-[14px] rounded-sm pl-9 pr-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink" 
              />
           </div>

           <div className="relative w-full md:w-20 shrink-0">
              <input 
                 type="text" 
                 placeholder="Tahun" 
                 value={yearFilter}
                 onChange={(e) => setYearFilter(e.target.value)}
                 className="w-full bg-canvas border border-hairline text-[14px] rounded-sm px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink" 
              />
           </div>
           
           <div className="relative w-full md:w-auto shrink-0 flex items-center gap-1">
              <input 
                 type="text" 
                 placeholder="Gedung" 
                 value={gedungFilter}
                 onChange={(e) => setGedungFilter(e.target.value.toUpperCase())}
                 className="w-1/2 md:w-20 bg-canvas border border-hairline text-[14px] rounded-sm px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink" 
              />
              <span className="text-ink-faint text-[14px] font-medium">-</span>
              <input 
                 type="text" 
                 placeholder="Lorong" 
                 value={lorongFilter}
                 onChange={(e) => setLorongFilter(e.target.value.toUpperCase())}
                 className="w-1/2 md:w-20 bg-canvas border border-hairline text-[14px] rounded-sm px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink" 
              />
           </div>

           <div className="col-span-2 md:col-span-1 relative w-full md:w-auto shrink-0 flex items-center justify-between md:justify-start gap-2 border border-hairline rounded-sm px-3 py-2 bg-canvas hover:border-hairline-strong transition-colors cursor-pointer" onClick={() => setShowDeptFilter(!showDeptFilter)}>
              <div className="flex items-center gap-2">
                 <Filter size={16} className="text-ink-mute" />
                 <span className="text-[14px] text-ink font-medium select-none">
                    Departemen {departemenFilter.length > 0 ? `(${departemenFilter.length})` : ''}
                 </span>
              </div>
                 
                 {showDeptFilter && (
                    <div 
                       className="absolute top-full mt-2 right-0 w-56 bg-canvas border border-hairline rounded-sm shadow-lg z-50 max-h-64 overflow-y-auto"
                       onClick={(e) => e.stopPropagation()}
                    >
                       {uniqueDepartments.length === 0 ? (
                          <div className="p-3 text-[14px] text-ink-mute text-center">Belum ada departemen</div>
                       ) : (
                          uniqueDepartments.map(dept => (
                             <label key={dept as string} className="flex items-center gap-3 px-3 py-2.5 hover:bg-canvas-soft cursor-pointer text-[14px] text-ink border-b border-hairline/50 last:border-0">
                                <input 
                                   type="checkbox"
                                   className="rounded-xs border-hairline text-primary focus:ring-primary w-4 h-4"
                                   checked={departemenFilter.includes(dept as string)}
                                   onChange={(e) => {
                                      if (e.target.checked) {
                                         setDepartemenFilter(prev => [...prev, dept as string]);
                                      } else {
                                         setDepartemenFilter(prev => prev.filter(d => d !== dept));
                                      }
                                   }}
                                />
                                {dept as string}
                             </label>
                          ))
                       )}
                    </div>
                 )}
              </div>
        </div>
      </div>

      {successMessage && (
         <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm p-4 flex items-center gap-3 mb-4">
            <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0">
               <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-[14px] font-medium leading-relaxed">{successMessage}</span>
         </div>
      )}

      {isRecycleBin && (
         <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-sm text-red-800 text-[14px] flex items-center gap-2">
            <Trash2 size={18} /> 
            <strong>Mode Tempat Sampah:</strong> Anda sedang melihat arsip yang telah dihapus.
         </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:flex flex-col flex-1 border border-hairline bg-canvas rounded-xs overflow-hidden min-h-0 mb-4">
         <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-[12px] border-collapse min-w-[1250px]">
               <thead className="sticky top-0 z-10 bg-canvas-soft border-b border-hairline shadow-sm">
               <tr className="text-ink font-semibold">
                  <th className="p-3 w-12 text-center whitespace-nowrap bg-canvas-soft border-b border-hairline">No</th>
                  <th className="p-3 text-center whitespace-nowrap bg-canvas-soft border-b border-hairline">Kode Klas.</th>
                  <th className="p-3 cursor-pointer select-none group hover:text-ink-strong whitespace-nowrap bg-canvas-soft border-b border-hairline" onClick={() => handleSort('jenisBerkas')}>
                     <div className="flex items-center justify-center gap-1">Jenis {sortConfig?.key === 'jenisBerkas' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : <span className="opacity-0 group-hover:opacity-50">↕</span>}</div>
                  </th>
                  <th className="p-3 cursor-pointer select-none group hover:text-ink-strong whitespace-nowrap bg-canvas-soft border-b border-hairline" onClick={() => handleSort('judulBerkas')}>
                     <div className="flex items-center justify-center gap-1">Judul {sortConfig?.key === 'judulBerkas' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : <span className="opacity-0 group-hover:opacity-50">↕</span>}</div>
                  </th>
                  <th className="p-3 text-center whitespace-nowrap bg-canvas-soft border-b border-hairline">Departemen</th>
                  <th className="p-3 text-center whitespace-nowrap bg-canvas-soft border-b border-hairline">Keterangan</th>
                  <th className="p-3 text-center whitespace-nowrap bg-canvas-soft border-b border-hairline">Isi Bundel</th>
                  <th className="p-3 cursor-pointer select-none group hover:text-ink-strong whitespace-nowrap bg-canvas-soft border-b border-hairline" onClick={() => handleSort('tahun')}>
                     <div className="flex items-center justify-center gap-1">Tahun {sortConfig?.key === 'tahun' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : <span className="opacity-0 group-hover:opacity-50">↕</span>}</div>
                  </th>
                  <th className="p-3 text-center whitespace-nowrap bg-canvas-soft border-b border-hairline">Tgl Terima</th>
                  <th className="p-3 text-center whitespace-nowrap bg-canvas-soft border-b border-hairline">Masa Aktif</th>
                  <th className="p-3 cursor-pointer select-none group hover:text-ink-strong whitespace-nowrap bg-canvas-soft border-b border-hairline" onClick={() => handleSort('gedung')}>
                     <div className="flex items-center justify-center gap-1">Gedung {sortConfig?.key === 'gedung' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : <span className="opacity-0 group-hover:opacity-50">↕</span>}</div>
                  </th>
                  <th className="p-3 cursor-pointer select-none group hover:text-ink-strong whitespace-nowrap bg-canvas-soft border-b border-hairline" onClick={() => handleSort('lorong')}>
                     <div className="flex items-center justify-center gap-1">Lorong {sortConfig?.key === 'lorong' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : <span className="opacity-0 group-hover:opacity-50">↕</span>}</div>
                  </th>
                  <th className="p-3 cursor-pointer select-none group hover:text-ink-strong whitespace-nowrap bg-canvas-soft border-b border-hairline" onClick={() => handleSort('rak')}>
                     <div className="flex items-center justify-center gap-1">Rak {sortConfig?.key === 'rak' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : <span className="opacity-0 group-hover:opacity-50">↕</span>}</div>
                  </th>
                  <th className="p-3 cursor-pointer select-none group hover:text-ink-strong whitespace-nowrap bg-canvas-soft border-b border-hairline" onClick={() => handleSort('baris')}>
                     <div className="flex items-center justify-center gap-1">Baris {sortConfig?.key === 'baris' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : <span className="opacity-0 group-hover:opacity-50">↕</span>}</div>
                  </th>
                  <th className="p-3 text-center whitespace-nowrap bg-canvas-soft border-b border-hairline">File Digital</th>
                  <th className="p-3 cursor-pointer select-none group hover:text-ink-strong whitespace-nowrap bg-canvas-soft border-b border-hairline" onClick={() => handleSort('status')}>
                     <div className="flex items-center justify-center gap-1">Status {sortConfig?.key === 'status' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : <span className="opacity-0 group-hover:opacity-50">↕</span>}</div>
                  </th>
                  <th className="p-3 text-center whitespace-nowrap bg-canvas-soft border-b border-hairline">Aksi</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
               {paginatedArchives.length > 0 ? (
                  paginatedArchives.map((archive, index) => (
                     <tr 
                        key={archive.no} 
                        onClick={(e) => {
                           if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
                           setSelectedDetailItem(archive);
                           setDetailType("archive");
                        }}
                        className="hover:bg-canvas-soft/50 transition-colors text-ink cursor-pointer"
                     >
                        <td className="p-3 text-center font-mono text-ink-mute">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="p-3 text-center font-medium">{archive.kodeKlasifikasi}</td>
                        <td className="p-3 text-center text-ink-mute uppercase">{archive.jenisBerkas}</td>
                        <td className="p-3 text-center font-medium text-ink">{archive.judulBerkas}</td>
                        <td className="p-3 text-center"><span className="font-mono text-xs bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink">{archive.departemen}</span></td>
                        <td className="p-3 text-center text-ink-mute text-[11px] max-w-[150px] truncate" title={archive.keterangan}>{archive.keterangan || "-"}</td>
                        <td className="p-3 text-center">
                           <span className="bg-canvas-soft border border-hairline px-2 py-0.5 rounded-md text-[10px] max-w-[200px] truncate inline-block" title={archive.isiBundel?.join(', ')}>
                              {archive.isiBundel?.join(', ') || '-'}
                           </span>
                        </td>
                        <td className="p-3 text-center font-mono">{archive.tahun}</td>
                        <td className="p-3 text-center font-mono whitespace-nowrap">{formatDate(archive.tanggalTerima)}</td>
                        <td className="p-3 text-center text-ink-mute">{archive.jangkaWaktu}</td>
                        <td className="p-3 text-center font-mono font-medium">{archive.gedung || "-"}</td>
                        <td className="p-3 text-center font-mono">{archive.lorong || "-"}</td>
                        <td className="p-3 text-[11px] font-medium whitespace-nowrap text-center">{archive.rak || "-"}</td>
                        <td className="p-3 text-[11px] font-medium whitespace-nowrap text-center">{archive.baris || "-"}</td>
                        <td className="p-3 text-center">
                           {archive.linkBerkas && archive.linkBerkas !== '-' ? (
                              <a 
                                 href={archive.linkBerkas} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="inline-flex items-center gap-1 text-primary hover:underline hover:text-primary-deep font-semibold"
                              >
                                 <ExternalLink size={13} /> Buka
                              </a>
                           ) : (
                              <span className="inline-flex items-center gap-1 text-ink-mute/50 cursor-not-allowed font-semibold">
                                 <ExternalLink size={13} /> Buka
                              </span>
                           )}
                        </td>
                        <td className="p-3 text-center">
                           <StatusBadge status={archive.status} alasanPenolakan={archive.alasanPenolakan} />
                        </td>
                        <td className="p-3">
                           <div className="flex items-center justify-center gap-2">
                              {role === 'user' ? (
                                 (archive.status !== 'Menunggu ACC' && archive.status !== 'Ditolak') ? (
                                    <button 
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          handlePinjamClick(archive);
                                       }}
                                       className="bg-primary hover:bg-primary-deep text-on-primary text-[11px] font-semibold px-2.5 py-1 rounded-sm transition-colors"
                                    >
                                       Pinjam
                                    </button>
                                 ) : (
                                    <span className="text-[11px] text-ink-mute font-mono">-</span>
                                 )
                              ) : (
                                 <>
                                    {isRecycleBin ? (
                                       <>
                                          <button 
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                handleRestoreArchive(archive.no || archive.id);
                                             }}
                                             className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-sm transition-colors"
                                             title="Pulihkan"
                                          >
                                             <RefreshCw size={14} />
                                          </button>
                                          <button 
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                handleHardDeleteArchive(archive.no || archive.id);
                                             }}
                                             className="p-1 text-ink-mute hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                                             title="Hapus Permanen"
                                          >
                                             <Trash2 size={14} className="text-rose-600 hover:text-rose-700" />
                                          </button>
                                       </>
                                    ) : (
                                       <>
                                          <button 
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(archive);
                                             }}
                                             className="p-1 text-ink-mute hover:text-ink hover:bg-canvas-soft rounded-sm transition-colors"
                                             title="Edit"
                                          >
                                             <Edit3 size={14} />
                                          </button>
                                          <button 
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                confirmDeleteArchive(archive.no);
                                             }}
                                             className="p-1 text-ink-mute hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                                             title="Hapus"
                                          >
                                             <Trash2 size={14} className="text-rose-600 hover:text-rose-700" />
                                          </button>
                                       </>
                                    )}
                                 </>
                              )}
                           </div>
                        </td>
                     </tr>
                  ))
               ) : (
                  <tr>
                     <td colSpan={16} className="p-8 text-center text-ink-mute text-[14px]">
                        Tidak ada arsip berkas yang cocok dengan filter atau kata kunci pencarian.
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
         </div>
      </div>

      {/* Mobile Card List View (Mobile First Design) */}
      <div className="block md:hidden space-y-3">
         {paginatedArchives.length > 0 ? (
            paginatedArchives.map((archive, index) => (
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
                     <StatusBadge status={archive.status} alasanPenolakan={archive.alasanPenolakan} isSmall={true} />
                  </div>
                  <div className="text-[12px] text-ink border-t border-hairline pt-2.5 grid grid-cols-2 gap-2">
                     <div>
                        <p className="text-ink-mute text-[9px] uppercase">Departemen</p>
                        <p className="font-medium text-[11px] mt-0.5">{archive.departemen}</p>
                     </div>
                     <div>
                        <p className="text-ink-mute text-[9px] uppercase">Tanggal Terima</p>
                        <p className="font-mono text-[11px] mt-0.5">{formatDate(archive.tanggalTerima)}</p>
                     </div>
                     <div className="col-span-2">
                        <p className="text-ink-mute text-[9px] uppercase">Letak Fisik Penyimpanan</p>
                        <p className="font-medium text-[11px] mt-0.5">Gedung {archive.gedung || "-"} / Lorong {archive.lorong || "-"} / Rak {archive.rak || "-"} / Baris {archive.baris || "-"}</p>
                     </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-hairline">
                     {archive.linkBerkas && archive.linkBerkas !== '-' ? (
                        <a 
                           href={archive.linkBerkas} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           onClick={(e) => e.stopPropagation()}
                           className="text-primary hover:underline font-semibold text-[11px] flex items-center gap-1"
                        >
                           <ExternalLink size={12} /> Buka Berkas
                        </a>
                     ) : (
                        <span 
                           onClick={(e) => e.stopPropagation()}
                           className="text-ink-mute/50 cursor-not-allowed font-semibold text-[11px] flex items-center gap-1"
                        >
                           <ExternalLink size={12} /> Buka Berkas
                        </span>
                     )}
                     {role === 'user' ? (
                        (archive.status !== 'Menunggu ACC' && archive.status !== 'Ditolak') && (
                           <button 
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handlePinjamClick(archive);
                              }}
                              className="bg-primary hover:bg-primary-deep text-on-primary font-semibold px-2 py-1 rounded-sm text-[10px] transition-colors"
                           >
                              Pinjam Berkas
                           </button>
                        )
                     ) : (
                        <div className="flex gap-2">
                           {isRecycleBin ? (
                              <>
                                 <button 
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       handleRestoreArchive(archive.no || archive.id);
                                    }}
                                    className="flex items-center gap-1 border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-sm text-[10px] font-medium transition-colors"
                                 >
                                    <RefreshCw size={10} /> Pulihkan
                                 </button>
                                 <button 
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       handleHardDeleteArchive(archive.no || archive.id);
                                    }}
                                    className="flex items-center gap-1 border border-transparent bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded-sm text-[10px] font-medium transition-colors"
                                 >
                                    <Trash2 size={10} /> Hapus Permanen
                                 </button>
                              </>
                           ) : (
                              <>
                                 <button 
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       handleEditClick(archive);
                                    }}
                                    className="flex items-center gap-1 border border-hairline hover:bg-canvas-soft px-2 py-1 rounded-sm text-[10px] text-ink font-medium transition-colors"
                                 >
                                    <Edit3 size={10} /> Edit
                                 </button>
                                 <button 
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       confirmDeleteArchive(archive.no);
                                    }}
                                    className="flex items-center gap-1 border border-transparent bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded-sm text-[10px] font-medium transition-colors"
                                 >
                                    <Trash2 size={10} /> Hapus
                                 </button>
                              </>
                           )}
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
      <div className="flex-none flex flex-col md:flex-row md:justify-between items-center gap-4 md:gap-0 text-ink-mute text-[12px] pt-3 border-t border-hairline mt-auto">
         <span>
            Menampilkan {paginatedArchives.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
            {Math.min(currentPage * itemsPerPage, filteredArchives.length)} dari {filteredArchives.length}
         </span>
         <div className="flex flex-wrap justify-center gap-1">
            <button 
               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
               disabled={currentPage === 1}
               className="px-2 py-1 bg-canvas border border-hairline rounded-sm text-ink hover:bg-canvas-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
               Sebelumnya
            </button>
            {renderPageNumbers()}
            <button 
               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
               disabled={currentPage === totalPages}
               className="px-2 py-1 bg-canvas border border-hairline rounded-sm text-ink hover:bg-canvas-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
               Selanjutnya
            </button>
         </div>
      </div>
      {/* MODAL DIALOG DETAIL DENGAN BACKDROP BLUR (BACKDROP-BLUR OVERLAY) */}
      {renderDuplicateAlertModal()}
      {renderBulkDuplicateAlertModal()}
      {renderDetailModal()}
      {renderDeleteModal()}
      {renderRejectModal()}
      {renderAddUserModal()}
    </div>
  );
}
