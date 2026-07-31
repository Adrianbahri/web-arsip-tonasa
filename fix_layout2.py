import re

with open("/Users/adrian/Documents/IT/WEB ARSIP/src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# We know the block starts with `            {selectedApprovalId && (` and ends with the first `            )}` after it.
# Let's find this specific block.

pattern = re.compile(r'            \{selectedApprovalId && \(\n               <form onSubmit=\{submitApproval\} className="border border-hairline bg-canvas-soft p-5 rounded-xs space-y-4 max-w-\[500px\]">.*?               </form>\n            \)', re.DOTALL)

new_content_block = """            {selectedApprovalId && (
               <form onSubmit={submitApproval} className="border border-hairline bg-canvas-soft p-4 rounded-xs mb-4 w-full">
                  <div className="flex items-center gap-2 text-ink mb-3">
                     <MapPin size={16} className="text-primary" />
                     <h3 className="font-semibold text-[13px]">Tentukan Lokasi Fisik Penyimpanan</h3>
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                     <div className="flex-1 min-w-[200px]">
                        <label className="block text-[11px] font-medium text-ink mb-1">Pilih Lokasi Rak</label>
                        <select 
                           className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-ink text-ink font-mono"
                           value={JSON.stringify({gedung: approvalLocation.gedung, lorong: approvalLocation.lorong, rak: approvalLocation.rak})}
                           onChange={(e) => {
                              try {
                                 const val = JSON.parse(e.target.value);
                                 const master = masterLocations.find(l => l.gedung === val.gedung && l.lorong === val.lorong && l.rak === val.rak);
                                 setApprovalLocation({ 
                                    gedung: val.gedung, 
                                    lorong: val.lorong, 
                                    rak: val.rak, 
                                    baris: master?.baris || "" 
                                 });
                              } catch (err) {}
                           }}
                        >
                           <option value='{"gedung":"","lorong":"","rak":""}' disabled>Pilih Lokasi Rak...</option>
                           {masterLocations.map(l => (
                              <option key={l.id} value={JSON.stringify({gedung: l.gedung, lorong: l.lorong, rak: l.rak})}>
                                 Gedung {l.gedung} {l.lorong ? `- Lorong ${l.lorong} ` : ''}- Rak {l.rak} {l.baris ? `- Baris ${l.baris}` : ''}
                              </option>
                           ))}
                        </select>
                     </div>
                     {approvalLocation.rak && !masterLocations.find(l => l.gedung === approvalLocation.gedung && l.lorong === approvalLocation.lorong && l.rak === approvalLocation.rak)?.baris && (
                        <div className="w-[120px]">
                           <label className="block text-[11px] font-medium text-ink mb-1">Baris (Manual)</label>
                           <input
                              type="text"
                              className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-ink text-ink font-mono"
                              placeholder="Contoh: 1"
                              value={approvalLocation.baris || ""}
                              onChange={(e) => setApprovalLocation({ ...approvalLocation, baris: e.target.value })}
                           />
                        </div>
                     )}
                     <div className="flex gap-2">
                        <button 
                           type="button" 
                           onClick={() => setSelectedApprovalId(null)}
                           className="btn-outline !py-1.5 !px-3 !text-[12px]"
                        >
                           Batal
                        </button>
                        <button 
                           type="submit"
                           className="btn-primary !py-1.5 !px-3 !text-[12px]"
                        >
                           Konfirmasi ACC
                        </button>
                     </div>
                  </div>
               </form>
            )}"""

new_content, count = pattern.subn(new_content_block, content, count=1)

if count > 0:
    with open("/Users/adrian/Documents/IT/WEB ARSIP/src/app/dashboard/page.tsx", "w") as f:
        f.write(new_content)
    print("Replaced layout successfully.")
else:
    print("Failed to find pattern.")
