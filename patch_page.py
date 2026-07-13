import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. Update form state
content = content.replace(
"""     gedung: "",
     lorong: "",
     rak: "",
     linkBerkas: "",
     status: "Menunggu ACC"
  });""",
"""     gedung: "",
     lorong: "",
     rak: "",
     linkBerkas: "",
     status: "Menunggu ACC",
     keterangan: "",
     isiBundel: [] as string[]
  });
  
  const [newItemText, setNewItemText] = useState("");

  const handleAddIsiBundel = () => {
     if (newItemText.trim()) {
        setFormData(prev => ({
           ...prev,
           isiBundel: [...prev.isiBundel, newItemText.trim()]
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
"""
)

# 2. Update fetchArchives formatting
content = content.replace(
"""                 rak: item.rak || "",
                 status: item.status,
                 linkBerkas: item.link_berkas,""",
"""                 rak: item.rak || "",
                 keterangan: item.keterangan || "",
                 isiBundel: item.isi_bundel ? (typeof item.isi_bundel === 'string' ? JSON.parse(item.isi_bundel) : item.isi_bundel) : [],
                 status: item.status,
                 linkBerkas: item.link_berkas,"""
)

# 3. Update handleSubmit update mode payload
content = content.replace(
"""            lorong: formData.lorong,
            rak: formData.rak,
            status: formData.status,
            link_berkas: formData.linkBerkas
         };""",
"""            lorong: formData.lorong,
            rak: formData.rak,
            status: formData.status,
            keterangan: formData.keterangan,
            isi_bundel: JSON.stringify(formData.isiBundel),
            link_berkas: formData.linkBerkas
         };"""
)

# 4. Update handleSubmit update mode mock
content = content.replace(
"""                     lorong: formData.lorong,
                     rak: formData.rak,
                     status: formData.status,
                     linkBerkas: formData.linkBerkas
                  };""",
"""                     lorong: formData.lorong,
                     rak: formData.rak,
                     status: formData.status,
                     keterangan: formData.keterangan,
                     isiBundel: formData.isiBundel,
                     linkBerkas: formData.linkBerkas
                  };"""
)

# 5. Update handleSubmit insert mode payload
content = content.replace(
"""            lorong: role === 'pic_gedung' ? formData.lorong : null,
            rak: role === 'pic_gedung' ? formData.rak : null,
            status: statusVal,
            link_berkas: formData.linkBerkas
         };""",
"""            lorong: role === 'pic_gedung' ? formData.lorong : null,
            rak: role === 'pic_gedung' ? formData.rak : null,
            status: statusVal,
            keterangan: formData.keterangan,
            isi_bundel: JSON.stringify(formData.isiBundel),
            link_berkas: formData.linkBerkas
         };"""
)

# 6. Update handleSubmit insert mode mock
content = content.replace(
"""               lorong: role === 'pic_gedung' ? formData.lorong : '',
               rak: role === 'pic_gedung' ? formData.rak : '',
               status: statusVal,
               linkBerkas: formData.linkBerkas
            };""",
"""               lorong: role === 'pic_gedung' ? formData.lorong : '',
               rak: role === 'pic_gedung' ? formData.rak : '',
               status: statusVal,
               keterangan: formData.keterangan,
               isiBundel: formData.isiBundel,
               linkBerkas: formData.linkBerkas
            };"""
)

# 7. Update editArchiveItem click
content = content.replace(
"""                           gedung: archive.gedung || '',
                           lorong: archive.lorong || '',
                           rak: archive.rak || '',
                           status: archive.status,
                           linkBerkas: archive.linkBerkas || ''
                        });""",
"""                           gedung: archive.gedung || '',
                           lorong: archive.lorong || '',
                           rak: archive.rak || '',
                           status: archive.status,
                           keterangan: archive.keterangan || '',
                           isiBundel: archive.isiBundel || [],
                           linkBerkas: archive.linkBerkas || ''
                        });"""
)

# 8. Update edit request item modal close (clearing form)
content = content.replace(
"""                        gedung: "",
                        lorong: "",
                        rak: "",
                        linkBerkas: "",
                        status: "Menunggu ACC"
                     });""",
"""                        gedung: "",
                        lorong: "",
                        rak: "",
                        linkBerkas: "",
                        status: "Menunggu ACC",
                        keterangan: "",
                        isiBundel: []
                     });"""
)

# 9. Modify deptVal logic (line ~265)
content = content.replace(
"const deptVal = role === 'admin_dept' ? 'KEUANGAN' : formData.departemen;",
"const deptVal = formData.departemen;"
)

# 10. Update HTML inputs for Keterangan, Isi Bundel and Departemen
departemen_old = """                 <div className="space-y-2">
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
                 </div>"""

departemen_new = """                 <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-ink">Departemen</label>
                    <input 
                       type="text" 
                       name="departemen"
                       value={formData.departemen}
                       onChange={handleInputChange}
                       required
                       placeholder="Contoh: KEUANGAN, LEGAL, UMUM"
                       className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[13px] font-medium text-ink">Keterangan (Singkat)</label>
                    <textarea 
                       name="keterangan"
                       value={formData.keterangan}
                       onChange={(e) => setFormData(prev => ({ ...prev, keterangan: e.target.value }))}
                       rows={2}
                       placeholder="Catatan tambahan terkait berkas..."
                       className="w-full bg-canvas border border-hairline text-[14px] rounded-xs px-3 py-2 focus:outline-none focus:border-ink placeholder:text-ink-faint text-ink"
                    />
                 </div>

                 <div className="space-y-2 md:col-span-2">
                    <label className="block text-[13px] font-medium text-ink mb-2">Anak-anakan / Isi Bundel</label>
                    <div className="flex gap-2 mb-3">
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
                          className="bg-canvas border border-hairline px-4 py-2 text-[13px] font-medium rounded-xs hover:bg-canvas-soft transition-colors flex items-center gap-1 text-ink"
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
                 </div>"""

content = content.replace(departemen_old, departemen_new)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)

print("Patch applied to page.tsx")
