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
