const countdownEl = document.getElementById("coundown");
let targetDate; // this is to store the countdown target

// ---- API ---- //
async function fetchPrayerTimes() {
  const currentYear = new Date().getFullYear();

  // check if user has data and if it matches the current year
  if (localStorage.getItem("prayerTimeTable")) {
    const storedData = JSON.parse(localStorage.getItem("prayerTimeTable"));
    if (storedData.query.year == currentYear) {
      console.log("Using stored data");
      return findTodaysTimes(storedData);
    }
  }

  // If there is no data, fetch it!
  console.log("Fetching new data...");
  const apiUrl = `https://moonsighting.ahmedbukhamsin.sa/time_json.php?year=${currentYear}&tz=Europe/London&lat=52.4731&lon=-1.8510&method=2&both=0&time=0`;
  // alternative url if needed: `https://www.moonsighting.com/time_json.php?year=${currentYear}&tz=Europe/London&lat=52.4731&lon=-1.8510&method=2&both=0&time=0`

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    localStorage.setItem("prayerTimeTable", JSON.stringify(data));
    return findTodaysTimes(data);
  } catch (error) {
    console.error("API Error:", error);
    countdownEl.textContent = "Error loading times.";
  }
}

function findTodaysTimes(data) {
  const today = new Date();
  const month = today.toLocaleDateString(undefined, { month: "short" });
  const day = today.toLocaleDateString(undefined, { day: "2-digit" });
  const weekday = today.toLocaleDateString(undefined, {
    weekday: "short",
  });
  const year = today.toLocaleDateString(undefined, { year: "numeric" });

  const searchString = `${month} ${day} ${weekday}`;

  //find the object in the array that 'day' matches to
  const todaysData = data.times.find((timeEntry) => {
    const isExactMatch = timeEntry.day === searchString;

    const isPartialMatch = timeEntry.day.includes(searchString);

    if (isExactMatch || isPartialMatch) {
      return true;
    } else {
      return false;
    }
  });
  console.log(todaysData);
  return todaysData ? todaysData : null;
}

//function to convert time string into a date object for today
function createDateObject(timeStr) {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  return date;
}

async function startApp() {
  const prayerData = await fetchPrayerTimes();
}

startApp();
