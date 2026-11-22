
// =========================================
// UROLOGY LAB - CATATAN BERKEMIH
// =========================================


// 1. PENYIMPANAN DATA

const DIARY_KEY = "urologyUrinaryDiary";

let diaryLogs = [];

try {
  const savedData = JSON.parse(
    localStorage.getItem(DIARY_KEY) || "[]"
  );

  diaryLogs = Array.isArray(savedData) ? savedData : [];
} catch (error) {
  diaryLogs = [];
}


// 2. FUNGSI BANTU

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatVolume(volume) {
  return Number(volume).toLocaleString("id-ID") + " mL";
}

function saveDiary() {
  localStorage.setItem(
    DIARY_KEY,
    JSON.stringify(diaryLogs)
  );
}

function getLogsByDate(date) {
  return diaryLogs.filter(log => log.date === date);
}

function isMeasured(log) {
  return log.volume !== null &&
    log.volume !== undefined &&
    Number.isFinite(Number(log.volume));
}


// 3. INISIALISASI FORM

const today = getLocalDate();

document.getElementById("voidDate").value = today;
document.getElementById("filterDate").value = today;

document.getElementById("voidTime").value =
  new Date().toTimeString().slice(0, 5);


// 4. MENAMBAHKAN CATATAN BERKEMIH

const diaryForm = document.getElementById("diaryForm");

diaryForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const date = document.getElementById("voidDate").value;
  const time = document.getElementById("voidTime").value;

  const volumeInput =
    document.getElementById("urineVolume").value;

  const volume = volumeInput === ""
    ? null
    : Number(volumeInput);

  const color =
    document.getElementById("urineColor").value;

  const urgency =
    document.getElementById("urgency").value;

  const dysuria =
    document.getElementById("dysuria").checked;

  const leakage =
    document.getElementById("leakage").checked;

  const nocturia =
    document.getElementById("nocturia").checked;

  const notes =
    document.getElementById("notes").value.trim();

  if (!date || !time) {
    alert("Silakan isi tanggal dan waktu berkemih.");
    return;
  }

  const currentDate = getLocalDate();
  const currentTime = new Date().toTimeString().slice(0, 5);

  if (
    date > currentDate ||
    (date === currentDate && time > currentTime)
  ) {
    alert("Tanggal dan waktu pencatatan tidak boleh di masa depan.");
    return;
  }

  if (
    volume !== null &&
    (!Number.isFinite(volume) || volume < 1 || volume > 2000)
  ) {
    alert("Volume urine harus antara 1 hingga 2.000 mL.");
    return;
  }

  const newRecord = {
    id: (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random(),

    date: date,
    time: time,
    volume: volume,
    color: color,
    urgency: urgency,
    dysuria: dysuria,
    leakage: leakage,
    nocturia: nocturia,
    notes: notes
  };

  diaryLogs.push(newRecord);

  saveDiary();

  document.getElementById("filterDate").value = date;

  diaryForm.reset();

  document.getElementById("voidDate").value = currentDate;

  document.getElementById("voidTime").value =
    new Date().toTimeString().slice(0, 5);

  updateAll();

  alert("Catatan berkemih berhasil disimpan!");
});


// 5. RINGKASAN HARIAN

function updateDailyOverview() {
  const logs = getLogsByDate(today);

  const measuredLogs = logs.filter(isMeasured);

  const totalVolume = measuredLogs.reduce(
    (sum, log) => sum + Number(log.volume),
    0
  );

  const averageVolume = measuredLogs.length > 0
    ? Math.round(totalVolume / measuredLogs.length)
    : null;

  const nocturiaEvents = logs.filter(
    log => log.nocturia === true
  ).length;

  document.getElementById("todayCount").textContent =
    logs.length;

  document.getElementById("averageVolume").textContent =
    averageVolume === null
      ? "—"
      : formatVolume(averageVolume);

  document.getElementById("nocturiaCount").textContent =
    nocturiaEvents;
}


// 6. MENAMPILKAN RIWAYAT BERKEMIH

document.getElementById("filterDate")
  .addEventListener("change", renderDailyLog);

function renderDailyLog() {
  const selectedDate =
    document.getElementById("filterDate").value;

  const container =
    document.getElementById("dailyLog");

  const logs = getLogsByDate(selectedDate).sort(
    (a, b) => b.time.localeCompare(a.time)
  );

  container.innerHTML = "";

  if (logs.length === 0) {
    const empty = document.createElement("p");

    empty.className = "muted";
    empty.textContent =
      "Belum ada catatan berkemih pada tanggal ini.";

    container.appendChild(empty);
    return;
  }

  logs.forEach(log => {
    const item = document.createElement("div");
    item.className = "log-item";

    const main = document.createElement("div");
    main.className = "log-main";

    const title = document.createElement("strong");
    title.textContent = log.time + " — " + log.color;

    const detail = document.createElement("p");

    detail.textContent =
      (isMeasured(log)
        ? formatVolume(log.volume)
        : "Volume tidak diukur") +
      " | Urgensi: " + (log.urgency || "Tidak dicatat");

    const tags = document.createElement("div");
    tags.className = "log-tags";

    const tagLabels = [];

    if (log.dysuria) tagLabels.push("Disuria");
    if (log.leakage) tagLabels.push("Inkontinensia");
    if (log.nocturia) tagLabels.push("Nokturia");

    tagLabels.forEach(label => {
      const tag = document.createElement("span");

      tag.className = "log-tag";
      tag.textContent = label;

      tags.appendChild(tag);
    });

    main.appendChild(title);
    main.appendChild(detail);

    if (tagLabels.length > 0) {
      main.appendChild(tags);
    }

    if (log.notes) {
      const note = document.createElement("p");
      note.textContent = "Catatan: " + log.notes;
      main.appendChild(note);
    }

    const side = document.createElement("div");
    side.className = "log-side";

    const volume = document.createElement("strong");

    volume.textContent = isMeasured(log)
      ? formatVolume(log.volume)
      : "—";

    const deleteButton = document.createElement("button");

    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Hapus";

    deleteButton.addEventListener("click", function() {
      deleteRecord(log.id);
    });

    side.appendChild(volume);
    side.appendChild(deleteButton);

    item.appendChild(main);
    item.appendChild(side);

    container.appendChild(item);
  });
}


// 7. MENGHAPUS CATATAN

function deleteRecord(id) {
  const confirmed = confirm(
    "Apakah kamu yakin ingin menghapus catatan ini?"
  );

  if (!confirmed) return;

  diaryLogs = diaryLogs.filter(
    log => log.id !== id
  );

  saveDiary();
  updateAll();
}


// 8. RINGKASAN MINGGUAN

function getLastSevenDays() {
  const dates = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();

    date.setDate(date.getDate() - i);

    dates.push(getLocalDate(date));
  }

  return dates;
}

function renderWeeklySummary() {
  const dates = getLastSevenDays();

  const dailyData = dates.map(date => {
    const logs = getLogsByDate(date);

    const measuredLogs = logs.filter(isMeasured);

    const totalVolume = measuredLogs.reduce(
      (sum, log) => sum + Number(log.volume),
      0
    );

    return {
      date: date,
      count: logs.length,
      totalVolume: totalVolume
    };
  });

  const totalEvents = dailyData.reduce(
    (sum, day) => sum + day.count,
    0
  );

  const totalVolume = dailyData.reduce(
    (sum, day) => sum + day.totalVolume,
    0
  );

  const daysWithRecords = dailyData.filter(
    day => day.count > 0
  ).length;

  const averageEvents = (totalEvents / 7).toFixed(1);

  document.getElementById("weeklyAverage").textContent =
    averageEvents.replace(".", ",");

  document.getElementById("weeklyVolume").textContent =
    formatVolume(totalVolume);

  document.getElementById("weeklyDays").textContent =
    daysWithRecords + " / 7";

  renderWeeklyChart(dailyData);
}


// 9. GRAFIK MINGGUAN

function renderWeeklyChart(dailyData) {
  const chart = document.getElementById("weeklyChart");

  chart.innerHTML = "";

  const maximum = Math.max(
    ...dailyData.map(day => day.count),
    1
  );

  dailyData.forEach(day => {
    const dayContainer = document.createElement("div");
    dayContainer.className = "chart-day";

    const value = document.createElement("span");
    value.className = "chart-value";
    value.textContent = day.count;

    const barArea = document.createElement("div");
    barArea.className = "chart-bar-area";

    const bar = document.createElement("div");
    bar.className = "chart-bar";

    bar.style.height =
      (day.count / maximum) * 100 + "%";

    const label = document.createElement("span");
    label.className = "chart-label";

    label.textContent = new Date(day.date + "T12:00:00")
      .toLocaleDateString("id-ID", {
        weekday: "short"
      });

    barArea.appendChild(bar);

    dayContainer.appendChild(value);
    dayContainer.appendChild(barArea);
    dayContainer.appendChild(label);

    chart.appendChild(dayContainer);
  });
}


// 10. EKSPOR CATATAN TIGA HARI TERAKHIR

document.getElementById("exportBtn")
  .addEventListener("click", exportThreeDayDiary);

function exportThreeDayDiary() {
  const dates = [];

  for (let i = 2; i >= 0; i--) {
    const date = new Date();

    date.setDate(date.getDate() - i);

    dates.push(getLocalDate(date));
  }

  const records = diaryLogs
    .filter(log => dates.includes(log.date))
    .sort((a, b) =>
      a.date.localeCompare(b.date) ||
      a.time.localeCompare(b.time)
    );

  if (records.length === 0) {
    alert("Belum ada catatan untuk diekspor.");
    return;
  }

  function csvCell(value) {
    let safeValue = String(value ?? "");

    if (/^[=+\-@]/.test(safeValue)) {
      safeValue = "'" + safeValue;
    }

    return '"' + safeValue.replace(/"/g, '""') + '"';
  }

  const headers = [
    "Tanggal",
    "Waktu",
    "Volume urine (mL)",
    "Warna urine",
    "Urgensi",
    "Disuria",
    "Inkontinensia",
    "Nokturia",
    "Catatan tambahan"
  ];

  const rows = records.map(log => [
    log.date,
    log.time,
    isMeasured(log) ? log.volume : "Tidak diukur",
    log.color,
    log.urgency,
    log.dysuria ? "Ya" : "Tidak",
    log.leakage ? "Ya" : "Tidak",
    log.nocturia ? "Ya" : "Tidak",
    log.notes
  ]);

  const csvContent = [
    headers,
    ...rows
  ].map(row => row.map(csvCell).join(",")).join("\n");

  const blob = new Blob(
    ["\uFEFF" + csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download =
    "catatan-berkemih-urology-lab-3-hari.csv";

  document.body.appendChild(link);

  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}


// 11. MEMPERBARUI SELURUH TAMPILAN

function updateAll() {
  updateDailyOverview();
  renderDailyLog();
  renderWeeklySummary();
}


// 12. INISIALISASI HALAMAN

updateAll();
