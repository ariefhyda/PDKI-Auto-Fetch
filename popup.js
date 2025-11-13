let dataCache = [];

/************* ✅ Helper: Tampilkan Status *************/
function showStatus(message, type = 'success') {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = type;
  statusEl.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }
}

/************* ✅ START AUTO BUTTON *************/
document.getElementById("run").onclick = async () => {
  const codes = document.getElementById("codes").value
    .split("\n")
    .map(x => x.trim())
    .filter(x => x.length > 0);

  if (!codes.length) {
    showStatus("Silakan masukkan kode terlebih dahulu!", 'error');
    return;
  }

  showStatus(`Memproses ${codes.length} kode...`, 'success');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (codes) => window.startAuto(codes),
    args: [codes]
  });
};


/************* ✅ EXPORT JSON *************/
document.getElementById("exportJson").onclick = async () => {
  // Ambil data dari storage
  const { pdkiData } = await chrome.storage.local.get(["pdkiData"]);
  
  // Jika storage kosong, coba ambil dari content script
  let dataToExport = pdkiData;
  
  if (!dataToExport?.length) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.__PDKI_DATA || []
      });
      dataToExport = result[0]?.result || [];
    } catch (e) {
      console.error("Error mengambil data:", e);
    }
  }
  
  if (!dataToExport?.length) {
    showStatus("Belum ada data untuk diekspor!", 'error');
    return;
  }

  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url,
    filename: "pdki.json",
    saveAs: true
  });

  showStatus(`Berhasil mengekspor ${dataToExport.length} data ke JSON!`, 'success');
};


/************* ✅ EXPORT CSV (FIXED) *************/
document.getElementById("exportCsv").onclick = async () => {
  // Ambil data dari storage
  const { pdkiData } = await chrome.storage.local.get(["pdkiData"]);
  
  // Jika storage kosong, coba ambil dari content script
  let dataToExport = pdkiData;
  
  if (!dataToExport?.length) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.__PDKI_DATA || []
      });
      dataToExport = result[0]?.result || [];
    } catch (e) {
      console.error("Error mengambil data:", e);
    }
  }
  
  const data = dataToExport ?? [];
  if (!data.length) {
    showStatus("Belum ada data untuk diekspor!", 'error');
    return;
  }

  // ===== Normalisasi sebelum export =====
  const normalized = data.map(row => {
    const fixed = { ...row };

    // Pemegang & pencipta: array of object
    ["pemegang", "pencipta"].forEach(key => {
      if (Array.isArray(fixed[key])) {
        fixed[key] = fixed[key]
          .map(item => `${item.nama ?? ""} (${item.kewarganegaraan ?? ""})`)
          .join("; ");
      }
    });

    // Konsultan: array string
    if (Array.isArray(fixed.konsultan)) {
      fixed.konsultan = fixed.konsultan.join("; ");
    }

    return fixed;
  });

  const keys = Object.keys(normalized[0]);

  // escape quotes
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  let csv = keys.join(",") + "\n";

  normalized.forEach(row => {
    csv += keys.map(k => esc(row[k])).join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url,
    filename: "pdki.csv",
    saveAs: true
  });

  showStatus(`Berhasil mengekspor ${data.length} data ke CSV!`, 'success');
};


/************* helper download *************/
function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
