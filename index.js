// const hourNow = timeNow.getHours();
// const minuteNow = timeNow.getMinutes();
// console.log(hourNow);
// console.log(typeof hourNow);

let fajr = null;
let sunrise = null;
let dhuhr = null;
let asr = null;
let maghrib = null;
let isha = null;
let nextPrayerTime = null;

const countdownEl = document.getElementById("countdown");

async function fetchPrayerTimes() {
  const apiUrl =
    "https://api.aladhan.com/v1/timingsByAddress/25-11-2025?address=birmingham, uk&method=3&shafaq=general&tune=24, 24, 0, 4, -1, 1, 0, -45, 0&timezonestring=UTC&calendarMethod=HJCoSA";

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error, status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.timings;
  } catch (error) {
    console.error("Failed to fetch prayer times", error);
  }
}

async function assignPrayerTimes() {
  const prayerData = await fetchPrayerTimes();
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

  setInterval(function () {
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

    countdownEl.textContent = `${formattedHours}:${formattedMinutes}`;
  }, 60000);
}

assignPrayerTimes();
