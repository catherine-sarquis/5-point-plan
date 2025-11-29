const countdownEl = document.getElementById("countdown");

async function letsStoreTheLatestTimeTable() {
  const apiUrl1 = `https://www.moonsighting.com/time_json.php?year=2025&tz=Europe/London&lat=52.4731&lon=-1.8510&method=2&both=0&time=0`;
  const apiUrl2 = `https://moonsighting.ahmedbukhamsin.sa/time_json.php?year=2025&tz=Europe/London&lat=52.4731&lon=-1.8510&method=2&both=0&time=0`;

  let response;

  try {
    response = await fetch(apiUrl1, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Primary API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data fetched from primary API");
    localStorage.setItem("prayerTimeTable", JSON.stringify(data));
  } catch (error1) {
    console.warn(`Attempt 1 failed: ${error1.message}. Trying second API...`);
  }

  try {
    response = await fetch(apiUrl2, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Second API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data fetched from second API");
    localStorage.setItem("prayerTimeTable", JSON.stringify(data));
  } catch (error2) {
    console.error(`Attempt 2 failed: ${error2.message}`);
    throw new Error("Failed to fetch prayer times from all available sources");
  }
}

function checkLocalStorageIsUpToDate(currentYear) {
  if (localStorage.getItem("prayerTimeTable")) {
    console.log("TimeTable found... checking that it's up to date");
    const storedTimeTable = JSON.parse(localStorage.getItem("prayerTimeTable"));
    if (storedTimeTable.query.year != currentYear) {
      letsStoreTheLatestTimeTable(currentYear);
    } else {
      console.log("TimeTable is up to date");
    }
  } else {
    console.log("There isn't a TimeTable; let's get one!");
    letsStoreTheLatestTimeTable(currentYear);
  }
}

async function fetchTodaysPrayerTimes() {
  const todaysDate = new Date();
  const month = todaysDate.toLocaleDateString(undefined, { month: "short" });
  const date = todaysDate.toLocaleDateString(undefined, { day: "numeric" });
  const weekday = todaysDate.toLocaleDateString(undefined, {
    weekday: "short",
  });
  const year = todaysDate.toLocaleDateString(undefined, { year: "numeric" });

  checkLocalStorageIsUpToDate(year);

  const dateSearchString = `${month} ${date} ${weekday}`;

  const prayerData = JSON.parse(localStorage.getItem("prayerTimeTable"));
  const prayerTimesArr = prayerData.times;

  // find the index of the day object that holds today's prayer times
  const indexOfToday = prayerTimesArr.findIndex(function (todaysData) {
    return todaysData.day == `${dateSearchString}`;
  });

  console.log(prayerTimesArr[indexOfToday]);

  return prayerTimesArr[indexOfToday]; //now I know the index of today's prayer times
}

async function assignPrayerTimes() {
  const todaysPrayers = await fetchTodaysPrayerTimes();

  const timeNow = new Date();
  let currentPrayerTime; //how do i find out the current prayer time?
  let nextPrayerTime; //how do i find out the next prayer time?

  fajr = getDateObject(prayerData.Fajr);
  sunrise = getDateObject(prayerData.Sunrise);
  dhuhr = getDateObject(prayerData.Dhuhr);
  asr = getDateObject(prayerData.Asr);
  maghrib = getDateObject(prayerData.Maghrib);
  isha = getDateObject(prayerData.Isha);
  console.log(prayerData);
  const prayerTimesArray = [fajr, sunrise, dhuhr, asr, maghrib, isha];
  displayCountdown(prayerTimesArray);
}

function getDateObject(prayerTimeStr) {
  const [hour, minute] = prayerTimeStr.split(":");
  const dateObject = new Date();
  dateObject.setHours(hour);
  dateObject.setMinutes(minute);
  return dateObject;
}

function updateCountdownDisplay() {
  const timeNow = new Date();
  let difference = nextPrayerTime.getTime() - timeNow.getTime();

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor(difference / (1000 * 60)) % 60;

  let formattedHours = "";
  let formattedMinutes = "";

  if (hours < 10) {
    formattedHours = hours.toString().padStart(2, "0");
  } else {
    formattedHours = hours.toString();
  }

  if (minutes < 10) {
    formattedMinutes = minutes.toString().padStart(2, "0");
  } else {
    formattedMinutes = minutes.toString();
  }
  console.log(formattedMinutes);
  countdownEl.textContent = `${formattedHours}:${formattedMinutes}`;
}

function displayCountdown(prayerTimesArray) {
  const timeNow = new Date();
  if (timeNow > isha) {
    fajr.setDate(fajr.getDate() + 1); //add a day to get next fajr date object
    console.log(`next prayer is at ${fajr}`);
    nextPrayerTime = fajr;
  } else {
    for (let i = 0; i <= prayerTimesArray.length - 1; i++) {
      if (prayerTimesArray[i] > timeNow) {
        console.log(`next prayer is at ${prayerTimesArray[i]}`);
        nextPrayerTime = prayerTimesArray[i];
        break;
      }
    }
  }
  updateCountdownDisplay();

  setInterval(updateCountdownDisplay, 60000);
}

assignPrayerTimes();
