/* Notification permission */
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

const STORAGE_KEY = "students";
let editIndex = null;

/* Elements */
const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const saveBtn = document.getElementById("saveBtn");
const closeBtn = document.getElementById("closeBtn");

/* Inputs */
const nameEl = document.getElementById("name");
const courseEl = document.getElementById("course");
const feeEl = document.getElementById("fee");
const admissionEl = document.getElementById("admission");
const phoneEl = document.getElementById("phone");
const addressEl = document.getElementById("address");
const idEl = document.getElementById("idnum");
const daysEl = document.getElementById("days");
const paidEl = document.getElementById("paid");

/* Helpers */
function getStudents() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveStudents(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function calculateDueDay(admissionDate) {
  if (!admissionDate) return "";
  return new Date(admissionDate).getDate();
}


/* Render */
function renderStudents() {
  const container = document.getElementById("cards");
  container.innerHTML = "";

  const today = new Date().getDate();
  const students = getStudents();

  students.forEach((s, i) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <strong>${s.name}</strong><br>
      ${s.course}<br>
      Fee: ₹${s.fee}<br>
      Due Day: ${s.dueDay}
    `;

    // 🔴 OVERDUE LOGIC
    if (s.dueDay <= today && s.paid === false) {
      div.style.backgroundColor = "#d32f2f";
      div.style.color = "white";
    }

    div.onclick = () => openEdit(i);
    container.appendChild(div);
  });
}

/* Modal */
addBtn.onclick = () => {
  editIndex = null;
  modal.classList.remove("hidden");
};

closeBtn.onclick = () => modal.classList.add("hidden");

/* Save */
saveBtn.onclick = () => {
  const days = Array.from(document.getElementById("days").selectedOptions)
  .map(option => option.value);


  const student = {
    name: nameEl.value,
    course: courseEl.value,
    fee: feeEl.value,
    admission: admissionEl.value,
    dueDay: calculateDueDay(admissionEl.value),

    phone: phoneEl.value,
    address: addressEl.value,
    id: idEl.value,
    days,
    paid: paidEl.checked
  };

  const students = getStudents();
  if (editIndex !== null) students[editIndex] = student;
  else students.push(student);

  saveStudents(students);
  modal.classList.add("hidden");
  renderStudents();
};

/* Edit */
function openEdit(index) {
  const students = getStudents();
  const s = students[index];

  editIndex = index;

  nameEl.value = s.name || "";
  courseEl.value = s.course || "";
  feeEl.value = s.fee || "";
  admissionEl.value = s.admission || "";
  phoneEl.value = s.phone || "";
  addressEl.value = s.address || "";
  idEl.value = s.id || "";
  paidEl.checked = s.paid || false;

  // MULTI DAY FIX
  Array.from(daysEl.options).forEach(opt => {
    opt.selected = s.days && s.days.includes(opt.value);
  });

  document.getElementById("modal").classList.remove("hidden");
}

// Force close modal
document.getElementById("closeBtn").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

/* Init */
renderStudents();
