/* ================= NOTIFICATION PERMISSION ================= */
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

/* ================= STORAGE ================= */
const STORAGE_KEY = "students";
let editIndex = null;

/* ================= ELEMENTS ================= */
const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const saveBtn = document.getElementById("saveBtn");
const closeBtn = document.getElementById("closeBtn");

const nameEl = document.getElementById("name");
const courseEl = document.getElementById("course");
const feeEl = document.getElementById("fee");
const admissionEl = document.getElementById("admission");
const phoneEl = document.getElementById("phone");
const addressEl = document.getElementById("address");
const idEl = document.getElementById("idnum");
const daysEl = document.getElementById("days");
const paidEl = document.getElementById("paid");
const searchEl = document.getElementById("searchBox");
const cardsEl = document.getElementById("cards");

/* ================= HELPERS ================= */
function getStudents() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveStudents(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

/* ================= DUE CHECK (CORRECT MONTHLY LOGIC) ================= */
function isOverdue(student) {
  if (!student.admission) return false;

  const today = new Date();
  const admissionDate = new Date(student.admission);

  const dueThisMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    admissionDate.getDate()
  );

  const thisMonth = currentMonthKey();

  return (
    today >= dueThisMonth &&
    student.lastPaidMonth !== thisMonth
  );
}

/* ================= AUTO RESET + NOTIFICATION ================= */
function monthlyCheckAndNotify() {
  const students = getStudents();
  const thisMonth = currentMonthKey();
  let changed = false;

  students.forEach(s => {
    if (!s.admission) return;

    if (isOverdue(s)) {
      if (s.paid !== false) {
        s.paid = false;
        changed = true;
      }

      if (Notification.permission === "granted") {
        new Notification("Fee Due Reminder", {
          body: `${s.name} student has due his fees`,
          icon: "icon-192.png"
        });
      }
    }
  });

  if (changed) saveStudents(students);
}

/* ================= RENDER ================= */
function renderStudents() {
  cardsEl.innerHTML = "";
  const students = getStudents();

  students.forEach((s, i) => {
    if (!s.name) return;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <strong>${s.name}</strong><br>
      ID: ${s.id}<br>
      ${s.course}<br>
      Fee: ₹${s.fee}<br>
      Due Day: ${new Date(s.admission).getDate()}
    `;

    if (isOverdue(s)) {
      card.style.backgroundColor = "#d32f2f";
      card.style.color = "white";
    }

    card.onclick = () => openEdit(i);
    cardsEl.appendChild(card);
  });
}

/* ================= SEARCH (NAME + ID + COURSE) ================= */
searchEl.addEventListener("input", () => {
  const q = searchEl.value.toLowerCase();
  document.querySelectorAll(".card").forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(q)
      ? "block"
      : "none";
  });
});

/* ================= MODAL ================= */
addBtn.onclick = () => {
  editIndex = null;
  modal.classList.remove("hidden");
};

closeBtn.onclick = () => modal.classList.add("hidden");

/* ================= SAVE ================= */
saveBtn.onclick = () => {
  const selectedDays = Array.from(daysEl.selectedOptions).map(o => o.value);
  const thisMonth = currentMonthKey();

  const student = {
    name: nameEl.value,
    course: courseEl.value,
    fee: feeEl.value,
    admission: admissionEl.value,
    phone: phoneEl.value,
    address: addressEl.value,
    id: idEl.value,
    days: selectedDays,
    paid: paidEl.checked,
    lastPaidMonth: paidEl.checked ? thisMonth : null
  };

  const students = getStudents();

  if (editIndex !== null) {
    students[editIndex] = student;
  } else {
    students.push(student);
  }

  saveStudents(students);
  modal.classList.add("hidden");
  renderStudents();
};

/* ================= EDIT ================= */
function openEdit(index) {
  const s = getStudents()[index];
  editIndex = index;

  nameEl.value = s.name || "";
  courseEl.value = s.course || "";
  feeEl.value = s.fee || "";
  admissionEl.value = s.admission || "";
  phoneEl.value = s.phone || "";
  addressEl.value = s.address || "";
  idEl.value = s.id || "";
  paidEl.checked = s.paid || false;

  Array.from(daysEl.options).forEach(opt => {
    opt.selected = s.days && s.days.includes(opt.value);
  });

  modal.classList.remove("hidden");
}

/* ================= INIT ================= */
monthlyCheckAndNotify();
renderStudents();
