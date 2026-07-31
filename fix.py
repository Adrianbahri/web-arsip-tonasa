import os

filepath = "/Users/adrian/Documents/IT/WEB ARSIP/src/app/dashboard/page.tsx"
with open(filepath, "r") as f:
    lines = f.readlines()

new_content = """                     <select 
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
                     {approvalLocation.rak && !masterLocations.find(l => l.gedung === approvalLocation.gedung && l.lorong === approvalLocation.lorong && l.rak === approvalLocation.rak)?.baris && (
                        <div className="mt-2">
                           <label className="block text-[10px] font-semibold text-ink mb-1">Baris (Opsional / Input Manual)</label>
                           <input
                              type="text"
                              className="w-full bg-canvas border border-hairline text-[12px] rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-ink text-ink font-mono"
                              placeholder="Contoh: 1, 2, Bawah, dll"
                              value={approvalLocation.baris || ""}
                              onChange={(e) => setApprovalLocation({ ...approvalLocation, baris: e.target.value })}
                           />
                        </div>
                     )}
"""

# Replace lines 3291 to 3307 (0-indexed) with new content
start_idx = 3291
end_idx = 3308

# Check if the start of line 3292 matches expected content to be safe
if 'className="w-full bg-canvas border border-hairline text-[12px]' in lines[3292]:
    lines = lines[:start_idx] + [new_content] + lines[end_idx:]
    with open(filepath, "w") as f:
        f.writelines(lines)
    print("Replaced by line index successfully.")
else:
    print(f"Safety check failed. Line {3292 + 1} was:\n{lines[3292]}")
