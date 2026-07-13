import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. Update the table headers
content = content.replace(
"""                       <th className="p-3">Departemen</th>
                       <th className="p-3 text-center">Tahun</th>""",
"""                       <th className="p-3">Departemen</th>
                       <th className="p-3">Keterangan</th>
                       <th className="p-3 text-center">Isi Bundel</th>
                       <th className="p-3 text-center">Tahun</th>"""
)
content = content.replace(
"""                  <th className="p-3">Departemen</th>
                  <th className="p-3 text-center">Tahun</th>""",
"""                  <th className="p-3">Departemen</th>
                  <th className="p-3">Keterangan</th>
                  <th className="p-3 text-center">Isi Bundel</th>
                  <th className="p-3 text-center">Tahun</th>"""
)

# 2. Update the table bodies
content = content.replace(
"""                             <td className="p-3"><span className="font-mono text-xs bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink">{archive.departemen}</span></td>
                             <td className="p-3 text-center font-mono">{archive.tahun}</td>""",
"""                             <td className="p-3"><span className="font-mono text-xs bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink">{archive.departemen}</span></td>
                             <td className="p-3 text-ink-mute text-[11px] max-w-[150px] truncate" title={archive.keterangan}>{archive.keterangan || "-"}</td>
                             <td className="p-3 text-center"><span className="bg-canvas-soft border border-hairline px-2 py-0.5 rounded-full text-[10px]">{archive.isiBundel?.length || 0} Item</span></td>
                             <td className="p-3 text-center font-mono">{archive.tahun}</td>"""
)

content = content.replace(
"""                        <td className="p-3"><span className="font-mono text-xs bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink">{archive.departemen}</span></td>
                        <td className="p-3 text-center font-mono">{archive.tahun}</td>""",
"""                        <td className="p-3"><span className="font-mono text-xs bg-hairline-cool px-1.5 py-0.5 rounded-xs text-ink">{archive.departemen}</span></td>
                        <td className="p-3 text-ink-mute text-[11px] max-w-[150px] truncate" title={archive.keterangan}>{archive.keterangan || "-"}</td>
                        <td className="p-3 text-center"><span className="bg-canvas-soft border border-hairline px-2 py-0.5 rounded-full text-[10px]">{archive.isiBundel?.length || 0} Item</span></td>
                        <td className="p-3 text-center font-mono">{archive.tahun}</td>"""
)

content = content.replace(
"""                          <td colSpan={10} className="p-8 text-center text-ink-mute text-[14px]">""",
"""                          <td colSpan={12} className="p-8 text-center text-ink-mute text-[14px]">"""
)

content = content.replace(
"""                     <td colSpan={14} className="p-8 text-center text-ink-mute text-[14px]">""",
"""                     <td colSpan={16} className="p-8 text-center text-ink-mute text-[14px]">"""
)

# 3. Update Detail Modal
modal_old = """                           <div>
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Status Berkas</p>
                              <span className={`inline-block border text-[11px] px-2 py-0.5 rounded-full font-medium mt-1 ${"""
modal_new = """                           <div className="col-span-2">
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold">Keterangan</p>
                              <p className="font-medium text-ink mt-0.5">{selectedDetailItem.keterangan || "-"}</p>
                           </div>
                           <div className="col-span-2">
                              <p className="text-ink-mute text-[11px] uppercase tracking-wider font-semibold mb-1">Isi Bundel / Anak-anakan</p>
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
                              <span className={`inline-block border text-[11px] px-2 py-0.5 rounded-full font-medium mt-1 ${"""

content = content.replace(modal_old, modal_new)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)

with open("SUPABASE_SETUP.md", "r") as f:
    supabase_content = f.read()

supabase_content = supabase_content.replace(
"""  gedung text, -- Kosong jika belum di-ACC
  lorong text, -- Kosong jika belum di-ACC
  rak text,    -- Kosong jika belum di-ACC
  status text not null check (status in ('Aktif', 'Inaktif', 'Permanen', 'Dinilai Kembali', 'Ditinjau Kembali', 'Upaya Pemusnahan', 'Dimusnahkan', 'Menunggu ACC', 'Ditolak')),""",
"""  gedung text, -- Kosong jika belum di-ACC
  lorong text, -- Kosong jika belum di-ACC
  rak text,    -- Kosong jika belum di-ACC
  keterangan text,
  isi_bundel text, -- Disimpan sebagai JSON array string
  status text not null check (status in ('Aktif', 'Inaktif', 'Permanen', 'Dinilai Kembali', 'Ditinjau Kembali', 'Upaya Pemusnahan', 'Dimusnahkan', 'Menunggu ACC', 'Ditolak')),"""
)

with open("SUPABASE_SETUP.md", "w") as f:
    f.write(supabase_content)

print("Patch applied to page.tsx and SUPABASE_SETUP.md")
