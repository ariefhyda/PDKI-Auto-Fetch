/************* ✅ Tunggu sampai elemen muncul *************/
async function waitForSelector(selector, timeout = 8000) {
  return new Promise((resolve) => {
    let total = 0;
    let interval = 200;

    const timer = setInterval(() => {
      total += interval;
      const el = document.querySelector(selector);

      if (el) {
        clearInterval(timer);
        resolve(el);
      }

      if (total >= timeout) {
        clearInterval(timer);
        resolve(null);
      }
    }, interval);
  });
}


/************* ✅ Ambil detail *************/
window.ambilDataDetail = function () {
  const getText = (selector, base = document) =>
    base.querySelector(selector)?.innerText.trim() ?? null;

  const toCamel = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
      .join("");

  const data = {};

  data.nomorPencatatan = getText(".text-gray-800");

  data.tanggalPencatatan = (() => {
    const label = [...document.querySelectorAll("div.text-xs.text-gray-700")].find(el =>
      el.innerText.trim().includes("Tgl. Pencatatan")
    );
    return label?.nextElementSibling?.innerText.trim() ?? null;
  })();

  data.status = getText(".inline-flex");
  data.judul = getText("h1.text-xl");

  const grid = [...document.querySelectorAll(".grid .text-sm.font-semibold")];
  grid.forEach((el) => {
    const label = el.parentElement.querySelector(".text-xs")?.innerText.trim();
    if (label && el.innerText.trim()) {
      const cleanKey = toCamel(label);
      data[cleanKey] = el.innerText.trim();
    }
  });

  data.uraianCiptaan = getText("p.w-full.break-all");

  data.jenisCiptaan = (() => {
    const label = [...document.querySelectorAll("p.font-bold")].find(el =>
      el.innerText.includes("Jenis Ciptaan")
    );
    return label?.nextElementSibling?.innerText.trim();
  })();

  // ------ Tabel Pemegang
  data.pemegang = [];
  const pemegangTable = [...document.querySelectorAll("table")][0];
  if (pemegangTable) {
    [...pemegangTable.querySelectorAll("tbody tr")].forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      data.pemegang.push({
        nama: tds[0]?.innerText.trim(),
        kewarganegaraan: tds[1]?.innerText.trim(),
      });
    });
  }

  // ------ Pencipta
  data.pencipta = [];
  const penciptaTable = [...document.querySelectorAll("table")][1];
  if (penciptaTable) {
    [...penciptaTable.querySelectorAll("tbody tr")].forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      data.pencipta.push({
        nama: tds[0]?.innerText.trim(),
        kewarganegaraan: tds[1]?.innerText.trim(),
      });
    });
  }

  // ------ Konsultan
  data.konsultan = [];
  const konsultanTable = [...document.querySelectorAll("table")][2];
  if (konsultanTable) {
    [...konsultanTable.querySelectorAll("tbody tr")].forEach((tr) => {
      const td = tr.querySelector("td");
      if (td) data.konsultan.push(td.innerText.trim());
    });
  }

  console.log("✅ Data:", data);
  return data;
};


/************* ✅ Set input value *************/
function setInputValue(selector, value) {
  const input = document.querySelector(selector);
  if (!input) return false;

  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));

  return true;
}


/************* ✅ Navigation stabil + RETRY *************/
window.goToPDKI = async function (code, maxRetry = 3) {

  let attempt = 0;

  while (attempt < maxRetry) {
    attempt++;
    console.log(`🔄 attempt ${attempt} untuk ${code}`);

    const ok = setInputValue("form input.w-full.h-12", code);
    if (!ok) return console.log("❌ Input tidak ditemukan");

    const btn = document.querySelector("form button[type='submit']");
    if (!btn) return console.log("❌ Tombol tidak ditemukan");
    btn.click();

    // ✅ tunggu list muncul
    const link = await waitForSelector("div.flex.flex-col.gap-6 a[href]");
    if (!link) {
      console.log("❌ Link hasil tidak ditemukan");
      continue;
    }

    link.click();

    // ✅ tunggu halaman detail selesai render
    await waitForSelector(".text-gray-800");

    let data = ambilDataDetail();

    // ✨ FIX — jika kosong → ulangi
    if (data?.nomorPencatatan && data?.tanggalPencatatan) {
      console.log("✅ Data valid → lanjut");
      return data;
    }

    console.warn("⚠ Data masih NULL → ulangi pencarian");
  }

  console.log("❌ Gagal ambil data setelah retry");
  return null;
};


/************* ✅ Auto mode + simpan notFound *************/
window.startAuto = async function (codes) {
  let results = [];
  let notFound = [];

  for (let code of codes) {
    console.log("▶ Memproses:", code);

    const data = await goToPDKI(code);

    if (!data) {
      notFound.push(code);
      continue;
    }

    data.kode = code;
    results.push(data);

    await new Promise(r => setTimeout(r, 500));
  }

  // ✅ SIMPAN ke window dan storage
  window.__PDKI_DATA = results;
  window.__PDKI_NOT_FOUND = notFound;

  // Simpan ke chrome storage untuk export
  chrome?.storage?.local?.set({
    pdkiData: results,
    pdkiNotFound: notFound,
  });

  console.log("✅ DONE");
  console.log("📌 Data ditemukan:", results);
  console.log("⚠️ Tidak ditemukan:", notFound);

  alert(
    "✅ Selesai!\n\n" +
    "✔ Jumlah data ditemukan: " + results.length + "\n" +
    "⚠ Jumlah gagal: " + notFound.length + "\n\n" +
    "Daftar gagal:\n" + notFound.join("\n")
  );
};
