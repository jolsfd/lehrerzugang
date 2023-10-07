import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.js";
import { fetchWeek, getTeachers, getDaysByTeacherID, clearCache } from "./stundenplan.js";

// document.querySelector("#app").innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//     </a>
//     <h1>Hello Vite!</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite logo to learn more
//     </p>
//   </div>
// `;

// setupCounter(document.querySelector("#counter"));

var data = null;

function setupSelectTeacher(dataObj) {
  let optionsHtml = "";

  for (const teacher of dataObj.teachers) {
    optionsHtml += `<option "value"=${teacher}>${teacher}</option>`;
  }

  const select = `
  <select
    id="form-select-teacher"
    class="form-select"
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
    const selectedTeacher = document.getElementById("form-select-teacher").value;

    setupTimetable(data, selectedTeacher);
  });
}

// input wert ist eine list mit index als stunde und stundenobjekt als element
// TODO: sicherstellen, dass lessons immer liste ist wenn die leer ist, ist auch okay
function getDayHtml(day) {
  if (day.lessons.length == 0){
    return `
    <div>
      <p>${day.date}</p>
      <p>${day.zusatz}</p>
      <p>kein Unterricht<\p>
    </div>
    `
  }

  let lessonsHtml = "";

  for (const lesson of day.lessons) {
    lessonsHtml += `
    <p>${lesson.stunde}: ${lesson.raum}; ${lesson.fach}; ${lesson.klasse}; ${lesson.info}<\p>`;
  }

  const dayHtml = `
  <div>
    <p>${day.date}</p>
    <p>${day.zusatz}</p>
    ${lessonsHtml}
  </div>
  `;

  return dayHtml;
}

// get timetable by a teacher id
function setupTimetable(dataObj, teacherID) {
  if (!teacherID) {
    return;
  }

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
  console.log("reloaded")
  document.getElementById("timetable").innerHTML = ""
  document.getElementById("select-teacher").innerHTML = ""
  await clearCache()
  await setup()
}

// await loadData();
//setupSelectTeacher(data);
// setupTimetable(data, "Fkt");

// console.log(data)a
async function init(){
  document.getElementById("reload-btn").addEventListener("click", (event) => {reloadData()})
  await setup()
}

async function setup() {
  await loadData()
  setupSelectTeacher(data);
  console.log(import.meta.env.VITE_CF_WORKER)
}

await init()