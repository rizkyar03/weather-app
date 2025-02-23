const cityInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");

const notFoundSection = document.querySelector(".city-not-found");
const searchCitySection = document.querySelector(".search-city");
const mainSection = document.querySelector(".main-section");

const cityText = document.querySelector(".city-txt");
const currentDateText = document.querySelector(".date-txt");
const tempText = document.querySelector(".temp-txt");
const summaryText = document.querySelector(".summary-txt");
const humidityValue = document.querySelector(".humidity-value");
const windSpeedValue = document.querySelector(".wind-speed-value");
const weatherSummaryImg = document.querySelector(".weather-summary-img");

const forecastItemContainer = document.querySelector(".weather-forecast-container");

// Open Weather Map API Key
const apiKey = "6ee722d5c9092065e5173263453a299a";

// Event Listener Functions for Seacrh Bar
searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() != "") {
    updateWeatherInfo(cityInput.value);
    // cityInput.value = '';
    cityInput.blur();
  }
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key == "Enter" && cityInput.value.trim() != "") {
    updateWeatherInfo(cityInput.value);
    // cityInput.value = '';
    cityInput.blur();
  }
});

// for more details, see: https://openweathermap.org/weather-conditions
function getWeatherImg(id) {
  if (id <= 232) return "thunderstorm.svg";
  if (id <= 321) return "drizzle.svg";
  if (id <= 531) return "rain.svg";
  if (id <= 622) return "snow.svg";
  if (id <= 781) return "atmosphere.svg";
  if (id == 800) return "clear.svg";
  if (id <= 804) return "clouds.svg";
}

function getCurrentDate() {
  const currentDate = new Date();
  const options = {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  };

  return currentDate.toLocaleDateString("en-GB", options);
}

// Fetch data from openweathermap.org
async function fetchData(endPoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;

  const response = await fetch(apiUrl);

  return response.json();
}

async function updateWeatherInfo(city) {
  const weatherData = await fetchData("weather", city);

  if (weatherData.cod != 200) {
    showDisplaySection(notFoundSection);
    return;
  }

  console.log(weatherData);

  const {
    name: searchedCity,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed },
  } = weatherData;

  cityText.textContent = searchedCity;
  tempText.textContent = Math.round(temp) + " °C";
  summaryText.textContent = main;
  humidityValue.textContent = humidity + "%";
  windSpeedValue.textContent = speed + " m/s";

  weatherSummaryImg.src = `assets/images/weather/${getWeatherImg(id)}`;
  currentDateText.textContent = getCurrentDate();

  await updateForecastInfo(city);

  showDisplaySection(mainSection);
}

async function updateForecastInfo(city) {
  const forescastsData = await fetchData("forecast", city);

  const timeTaken = "12:00:00";
  const todayDate = new Date().toISOString().split("T")[0];

  forecastItemContainer.innerHTML = "";

  forescastsData.list
    .filter((forecastsWeather) => forecastsWeather.dt_txt.includes(timeTaken) && !forecastsWeather.dt_txt.includes(todayDate))
    .slice(0, 4)
    .forEach((forecastsWeather) => updateForecastsItems(forecastsWeather));
}

function updateForecastsItems(weatherData) {
  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp },
  } = weatherData;

  const dateTaken = new Date(date);
  const dateOption = {
    day: '2-digit',
    month: 'short'
  }

  const forecastDate = dateTaken.toLocaleDateString('en-US', dateOption);

  const forecastItem = `
    <div class="forecast-item">
        <h5 class="forecast-item-date">${forecastDate}</h5>
        <img src="assets/images/weather/${getWeatherImg(id)}" class="forecast-item-img" alt="" />
        <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
    </div>
  `;

  forecastItemContainer.insertAdjacentHTML("beforeend", forecastItem);
}

function showDisplaySection(section) {
  [mainSection, searchCitySection, notFoundSection].forEach((section) => (section.style.display = "none"));

  section.style.display = "flex";
}
