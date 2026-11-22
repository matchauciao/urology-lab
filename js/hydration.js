
// =====================================
// UROLOGY LAB - HYDRATION TRACKER
// =====================================

// 1. STORAGE CONFIGURATION

const PROFILE_KEY = "urologyHydrationProfile";
const DRINK_KEY = "urologyHydrationLogs";

let profile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;
let drinkLogs = JSON.parse(localStorage.getItem(DRINK_KEY)) || [];


// 2. HELPER FUNCTIONS

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  const date = new Date(dateString + "T12:00:00");

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function saveData() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(DRINK_KEY, JSON.stringify(drinkLogs));
}

function formatVolume(volume) {
  return Number(volume).toLocaleString("id-ID") + " mL";
}

function getTodayLogs() {
  const today = getLocalDate();

  return drinkLogs.filter(log => log.date === today);
}

function getTodayTotal() {
  return getTodayLogs().reduce(
    (total, log) => total + Number(log.volume),
    0
  );
}


// 3. PROFILE AND TARGET CALCULATION

function calculateTarget(sex) {
  // EFSA adult total-water AI:
  // Female = 2000 mL/day
  // Male = 2500 mL/day
  //
  // Approximate beverage target:
  // 80% of total water AI.
  // This is an educational estimate, not an individual prescription.

  if (sex === "female") {
    return 1600;
  }

  if (sex === "male") {
    return 2000;
  }

  return null;
}

const profileForm = document.getElementById("profileForm");

profileForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const age = Number(document.getElementById("age").value);
  const sex = document.getElementById("sex").value;
  const condition = document.getElementById("specialCondition").value;

  if (!Number.isInteger(age) || age < 18 || age > 120) {
    alert("Masukkan usia antara 18 hingga 120 tahun.");
    return;
  }

  if (condition !== "none") {
    alert(
      "Target otomatis belum tersedia untuk kondisi khusus. " +
      "Silakan ikuti rekomendasi tenaga kesehatan."
    );
    return;
  }

  profile = {
    age: age,
    sex: sex,
    condition: condition,
    target: calculateTarget(sex)
  };

  saveData();
  showTracker();
});


// 4. DISPLAY TRACKER

function showTracker() {
  document.getElementById("setupSection").hidden = true;
  document.getElementById("trackerSection").hidden = false;

  document.getElementById("todayDate").textContent =
    formatDate(getLocalDate());

  document.getElementById("targetText").textContent =
    "of " + formatVolume(profile.target);

  document.getElementById("targetNote").textContent =
    "Estimasi target minuman harian. Tidak termasuk air dari makanan.";

  updateDailyProgress();
  renderDrinkLogs();
  renderWeeklySummary();
}


// 5. DAILY PROGRESS

function updateDailyProgress() {
  const total = getTodayTotal();
  const target = profile.target;

  const percentage = Math.min((total / target) * 100, 100);

  document.getElementById("consumedText").textContent =
    formatVolume(total);

  document.getElementById("progressBar").style.width =
    percentage + "%";

  let message = "";

  if (total === 0) {
    message = "Belum ada minuman yang dicatat hari ini.";
  } else if (total < target) {
    message = "Keep going! Catat minumanmu sepanjang hari.";
  } else {
    message = "Target estimasi harian tercapai. Tidak perlu memaksakan minum lebih banyak.";
  }

  document.getElementById("progressMessage").textContent =
    message;
}


// 6. QUICK ADD BUTTONS

document.querySelectorAll(".volume-btn").forEach(button => {
  button.addEventListener("click", function() {
    document.getElementById("customVolume").value =
      this.dataset.volume;
  });
});


// 7. ADD DRINK LOG

const drinkForm = document.getElementById("drinkForm");

drinkForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const drinkType = document.getElementById("drinkType").value;
  const volume = Number(document.getElementById("customVolume").value);
  const time = document.getElementById("drinkTime").value;

  if (!Number.isFinite(volume) || volume < 1 || volume > 3000) {
    alert("Masukkan volume antara 1 hingga 3000 mL.");
    return;
  }

  if (!time) {
    alert("Silakan pilih waktu minum.");
    return;
  }

  const newLog = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random(),
    date: getLocalDate(),
    time: time,
    type: drinkType,
    volume: volume
  };

  drinkLogs.push(newLog);

  saveData();

  drinkForm.reset();
  document.getElementById("drinkTime").value =
    new Date().toTimeString().slice(0, 5);

  updateDailyProgress();
  renderDrinkLogs();
  renderWeeklySummary();
});


// 8. DISPLAY DAILY LOG

function renderDrinkLogs() {
  const container = document.getElementById("drinkLog");
  const logs = getTodayLogs().sort((a, b) =>
    b.time.localeCompare(a.time)
  );

  container.innerHTML = "";

  if (logs.length === 0) {
    container.innerHTML =
      '<p class="muted">Belum ada minuman yang dicatat.</p>';
    return;
  }

  logs.forEach(log => {
    const item = document.createElement("div");
    item.className = "log-item";

    const info = document.createElement("div");
    info.className = "log-info";

    const name = document.createElement("strong");
    name.textContent = log.type;

    const time = document.createElement("span");
    time.textContent = log.time;

    info.appendChild(name);
    info.appendChild(time);

    const actions = document.createElement("div");
    actions.className = "log-actions";

    const volume = document.createElement("span");
    volume.className = "log-volume";
    volume.textContent = formatVolume(log.volume);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function() {
      deleteDrink(log.id);
    });

    actions.appendChild(volume);
    actions.appendChild(deleteButton);

    item.appendChild(info);
    item.appendChild(actions);

    container.appendChild(item);
  });
}


// 9. DELETE LOG

function deleteDrink(id) {
  const confirmed = confirm("Hapus catatan minuman ini?");

  if (!confirmed) return;

  drinkLogs = drinkLogs.filter(log => log.id !== id);

  saveData();

  updateDailyProgress();
  renderDrinkLogs();
  renderWeeklySummary();
}


// 10. WEEKLY SUMMARY

function getLastSevenDays() {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    days.push(getLocalDate(date));
  }

  return days;
}

function renderWeeklySummary() {
  const days = getLastSevenDays();

  const dailyTotals = days.map(date => {
    const total = drinkLogs
      .filter(log => log.date === date)
      .reduce((sum, log) => sum + Number(log.volume), 0);

    return {
      date: date,
      total: total
    };
  });

  const loggedDays = dailyTotals.filter(day => day.total > 0);

  const weeklyTotal = dailyTotals.reduce(
    (sum, day) => sum + day.total,
    0
  );

  const average = Math.round(weeklyTotal / 7);

  document.getElementById("weeklyAverage").textContent =
    formatVolume(average);

  document.getElementById("daysLogged").textContent =
    loggedDays.length + " / 7";

  if (loggedDays.length === 0) {
    document.getElementById("bestDay").textContent = "-";
  } else {
    const best = [...loggedDays].sort(
      (a, b) => b.total - a.total
    )[0];

    document.getElementById("bestDay").textContent =
      formatDate(best.date);
  }

  renderWeeklyChart(dailyTotals);
}


// 11. WEEKLY CHART

function renderWeeklyChart(dailyTotals) {
  const chart = document.getElementById("weeklyChart");

  chart.innerHTML = "";

  dailyTotals.forEach(day => {
    const dayContainer = document.createElement("div");
    dayContainer.className = "chart-day";

    const value = document.createElement("span");
    value.className = "chart-value";
    value.textContent = day.total > 0
      ? Math.round(day.total / 100) / 10 + " L"
      : "—";

    const barArea = document.createElement("div");
    barArea.className = "chart-bar-area";

    const bar = document.createElement("div");
    bar.className = "chart-bar";

    const height = Math.min(
      (day.total / profile.target) * 100,
      100
    );

    bar.style.height = height + "%";

    const label = document.createElement("span");
    label.className = "chart-label";

    const date = new Date(day.date + "T12:00:00");

    label.textContent = date.toLocaleDateString("id-ID", {
      weekday: "short"
    });

    barArea.appendChild(bar);

    dayContainer.appendChild(value);
    dayContainer.appendChild(barArea);
    dayContainer.appendChild(label);

    chart.appendChild(dayContainer);
  });
}


// 12. EDIT PROFILE

document.getElementById("editProfileBtn")
  .addEventListener("click", function() {

    document.getElementById("age").value = profile.age;
    document.getElementById("sex").value = profile.sex;
    document.getElementById("specialCondition").value =
      profile.condition;

    document.getElementById("trackerSection").hidden = true;
    document.getElementById("setupSection").hidden = false;
  });


// 13. INITIALIZATION

document.getElementById("drinkTime").value =
  new Date().toTimeString().slice(0, 5);

if (profile && profile.condition === "none") {
  showTracker();
}
