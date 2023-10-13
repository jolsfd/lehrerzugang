import {
  fetchWeek,
  getTeachers,
  getDaysByTeacherID,
  clearCache,
} from "./stundenplan.js";

var data = null;

const spinner = `<div class="spinner-border text-primary" role="status">
<span class="visually-hidden">Loading...</span>
</div>`

function setupSelectTeacher(dataObj) {
  let optionsHtml = "";

  for (const teacher of dataObj.teachers) {
    optionsHtml += `<option "value"=${teacher}>${teacher}</option>`;
  }

  const select = `
  <select
    id="form-select-teacher"
    class="form-select mb-3"
    aria-label="Lehrerkürzel"
    value=""
  >
    <option value="" selected>Open this select menu</option>
    ${optionsHtml}
  </select>
  `; // TODO: add event listener

  document.getElementById("select-teacher").innerHTML = select;

  const selectedTeacherEl = document.getElementById("select-teacher");
  selectedTeacherEl.addEventListener("change", (event) => {
    const selectedTeacher = document.getElementById(
      "form-select-teacher"
    ).value;

    setupTimetable(data, selectedTeacher);
  });
}

function getTableForDayHtml(day) {
  if (!day.lessons){
    return `<b>keine Daten verfügbar</b><hr>`
  }

  if (day.lessons.length == 0){
    return `<p>kein Unterricht</p><hr>`
  }

  let lessonsTableRowsHtml = "";

  for (const lesson of day.lessons) {
    lessonsTableRowsHtml += `
        <tr>
          <td>${lesson.stunde}</td>
          <td>${lesson.raum}</td> 
          <td>${lesson.klasse}</td>
          <td>${
            lesson.info
              ? `${lesson.fach} <span class="text-danger">${lesson.info}</span>`
              : lesson.fach
          }</td>
        </tr>`;
  }

  const tableHtml = `
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Raum</th>
          <th>Klasse</th>
          <th>Fach</th>
        </tr>
      </thead>
      <tbody>
        ${lessonsTableRowsHtml}
      </tbody>
    </table>`;

  return tableHtml;
}

// input wert ist eine list mit index als stunde und stundenobjekt als element
// TODO: sicherstellen, dass lessons immer liste ist wenn die leer ist, ist auch okay
function getDayHtml(day) {
  const dayHtml = `
  <div>
    <p class="fs-4">${day.date}</p>
    <p class="fw-bold text-danger">${day.zusatz}</p>
    ${getTableForDayHtml(day)}
  </div>
  `;

  return dayHtml;
}

// get timetable by a teacher id
function setupTimetable(dataObj, teacherID) {
  if (!teacherID) {
    return;
  }

  document.getElementById(
    "teacher-description"
  ).innerHTML = `<p class="fs-3 text-center">Persönlicher Stundenplan - <span class="fw-bold">${teacherID}</span>
  <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
    teacherID + import.meta.env.VITE_SEED
  )}" alt="avatar" width="64" height="64"/>
  </p>`;

  const days = getDaysByTeacherID(dataObj.docs, teacherID);

  let timetable = "";

  for (const day of days) {
    timetable += getDayHtml(day);
  }

  document.getElementById("timetable").innerHTML = timetable;
}

async function loadData() {
  const docs = await fetchWeek();
  const teachers = await getTeachers();

  console.log("loaded data");

  // manipulate global data object
  data = {
    docs: docs,
    teachers: teachers,
  };
}

async function reloadData() {
  console.log("reloaded");
  document.getElementById("timetable").innerHTML = "";
  document.getElementById("select-teacher").innerHTML = spinner;
  document.getElementById("teacher-description").innerHTML = "";
  await clearCache();
  await setup();
}

async function init() {
  document.getElementById("select-teacher").innerHTML = spinner;
  document.getElementById("reload-btn").addEventListener("click", (event) => {
    reloadData();
  });
  await setup();
}

async function setup() {
  await loadData();
  setupSelectTeacher(data);
  //console.log(import.meta.env.VITE_CF_WORKER);
}

init();
