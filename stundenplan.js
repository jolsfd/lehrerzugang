const CACHE_VERSION = 1;
const CURRENT_CACHES = {
  stundenplan24: `stundenplan24-cache-v${CACHE_VERSION}`,
};

const WORKER = import.meta.env.VITE_CF_WORKER;

const dateStringOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

function parseXml(rawXml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawXml, "application/xml");

  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    console.log("error while parsing ❌");
    return null;
  }

  return doc;
}

function currentMonday() {
  const today = new Date();
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - (((today.getDay() + 1) % 7) - 2)
  );
}

async function fetchPlan(dateVpMobil) {
  // cache config
  const cache = await caches.open(CURRENT_CACHES.stundenplan24);

  let url = WORKER;

  if (dateVpMobil) {
    url = WORKER + "?date=" + dateVpMobil;
  }

  //const request = new Request(WORKER + "?date=" + dateVpMobil)
  const request = new Request(url);

  // check cache for response
  const cachedRes = await cache.match(request.clone());

  if (cachedRes) {
    console.log("cached 🚀");
    return await cachedRes.text();
  }

  const res = await fetch(request.clone());
  console.log("request to stundenplan24 🌐");

  if (res.ok) {
    // put response in cache
    await cache.put(request, res.clone());
    console.log("cached response 🗃️");
    return await res.text();
  }

  return "";
}

function toVpMobil(date) {
  return (
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2,"0")
  );
}

export async function fetchWeek() {
  const monday = currentMonday();
  const week = [];

  for (let i = 0; i < 5; i++) {
    const day = new Date(monday.getTime() + i * (24 * 60 * 60 * 1000));

    const xml = await fetchPlan(toVpMobil(day));

    week.push(parseXml(xml));
  }

  return week;
}

function getZusatz(xmlDoc) {
  const zusatzElements = xmlDoc.getElementsByTagName("ZiZeile");

  if (!zusatzElements.length) {
    return "";
  }

  return zusatzElements[0].textContent;
}

function getTimestamp(xmlDoc) {
  const timestampElements = xmlDoc.getElementsByTagName("zeitstempel");

  if (timestampElements.length == 0) {
    return "";
  }

  return timestampElements[0].textContent;
}

function getDateString(dayIndex) {
  const day = new Date(
    currentMonday().getTime() + dayIndex * (24 * 60 * 60 * 1000)
  );
  return day.toLocaleDateString("de-De", dateStringOptions);
}

function getLessons(xmlDoc, teacherID) {
  const cache = {};

  // extract all lessons from xml
  for (const klasseEl of xmlDoc.getElementsByTagName("Kl")) {
    const klasse = klasseEl.getElementsByTagName("Kurz")[0].textContent;

    for (const stundeEL of klasseEl.getElementsByTagName("Std")) {
      const lehrer = stundeEL.getElementsByTagName("Le")[0].textContent;

      // found lesson
      if (lehrer == teacherID) {
        const raum = stundeEL.getElementsByTagName("Ra")[0].textContent;
        const fach = stundeEL.getElementsByTagName("Fa")[0].textContent;
        const stunde = stundeEL.getElementsByTagName("St")[0].textContent;
        const info = stundeEL.getElementsByTagName("If")[0].textContent;

        cache[stunde] = { raum: raum, fach: fach, klasse: klasse, info: info };
      }
    }
  }

  // create array for frontend
  let lessons = [];
  const arr = Object.keys(cache).sort();
  const maxIndex = parseInt(arr[arr.length - 1]);

  for (let i = 1; i <= maxIndex; i++) {
    if (!cache[i]) {
      lessons.push({
        stunde: i,
        raum: "",
        fach: "",
        klasse: "",
        info: "",
      });
      continue;
    }

    const lesson = cache[i];

    lessons.push({
      stunde: i,
      raum: lesson.raum,
      fach: lesson.fach,
      klasse: lesson.klasse,
      info: lesson.info,
    });
  }

  return lessons;
}

function getDayByTeacherID(teacherID, xmlDoc, dayIndex) {
  const date = getDateString(dayIndex);

  // if plan isn't availible
  if (!xmlDoc) {
    console.log("no xml doc");
    return {
      date: date,
      zusatz: "",
      lessons: null,
      timestamp: "",
    };
  }

  const zusatz = getZusatz(xmlDoc);
  const timestamp = getTimestamp(xmlDoc);
  const lessons = getLessons(xmlDoc, teacherID);

  return {
    date: date,
    zusatz: zusatz,
    lessons: lessons,
    timestamp: timestamp,
  };
}

export function getDaysByTeacherID(xmlDocs, teacherID) {
  const days = [];

  for (let i = 0; i < 5; i++) {
    days.push(getDayByTeacherID(teacherID, xmlDocs[i], i));
  }

  // console.log(days);

  return days;
}

export async function getTeachers() {
  const xml = await fetchPlan("");
  const doc = parseXml(xml);

  let cache = {};
  let teachers = [];

  for (const unterricht of doc.getElementsByTagName("UeNr")) {
    const teacher = unterricht.getAttribute("UeLe");

    if (!teacher) {
      continue;
    }

    if (!(teacher in cache)) {
      teachers.push(teacher);
      cache[teacher] = 1;
    }
  }

  // sort alphabetical
  teachers.sort();

  return teachers;
}

export async function clearCache() {
  const cache = await caches.open(CURRENT_CACHES.stundenplan24);

  const keys = await cache.keys();

  for (let i = 0; i < keys.length; i++) {
    if (await cache.delete(keys[i])) {
      console.log("deleted from cache 🗑️");
    }
  }
}
