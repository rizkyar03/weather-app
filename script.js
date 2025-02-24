import { API_KEY } from './config.js'

const cityInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

const notFoundSection = document.querySelector('.city-not-found');
const searchCitySection = document.querySelector('.search-city');
const mainSection = document.querySelector('.main-section');

const cityText = document.querySelector('.city-txt');
const currentDateText = document.querySelector('.date-txt');
const tempText = document.querySelector('.temp-txt');
const summaryText = document.querySelector('.summary-txt');
const humidityValue = document.querySelector('.humidity-value');
const windSpeedValue = document.querySelector('.wind-speed-value');
const weatherSummaryImg = document.querySelector('.weather-summary-img');

const forecastItemContainer = document.querySelector('.weather-forecast-container');

console.log(API_KEY);
const apiKey = API_KEY;

searchBtn.addEventListener('click', () => {
  if (cityInput.value.trim() != '') {
    updateWeatherInfo(cityInput.value);
    cityInput.blur();
  }
});

cityInput.addEventListener('keydown', (event) => {
  if (event.key == 'Enter' && cityInput.value.trim() != '') {
    updateWeatherInfo(cityInput.value);
    cityInput.blur();
  }
});

function getWeatherImg(id) {
  if (id <= 232) return 'thunderstorm.svg';
  if (id <= 321) return 'drizzle.svg';
  if (id <= 531) return 'rain.svg';
  if (id <= 622) return 'snow.svg';
  if (id <= 781) return 'atmosphere.svg';
  if (id == 800) return 'clear.svg';
  if (id <= 804) return 'clouds.svg';
}

function getCurrentDate() {
  const currentDate = new Date();

  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const day = currentDate.getDate();
  const month = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const year = currentDate.getFullYear();

  return `${weekday}, ${month} ${day}${getDaySuffix(day)} ${year}`;
}

function getCountryName(code) {
  const regionName = new Intl.DisplayNames(['en'], { type: 'region' });
  return regionName.of(code);
}

async function fetchData(endPoint, city) {
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

async function updateWeatherInfo(city) {
  const weatherData = await fetchData('weather', city);

  // console.log(weatherData);

  if (!weatherData || weatherData.cod != 200) {
    showDisplaySection(notFoundSection);
    return;
  }

  const {
    name: searchedCity,
    sys: { country },
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed },
  } = weatherData;

  const countryName = getCountryName(country);

  cityText.textContent = `${searchedCity}, ${countryName}`;
  tempText.textContent = Math.round(temp) + ' °C';
  summaryText.textContent = main;
  humidityValue.textContent = humidity + '%';
  windSpeedValue.textContent = speed + ' m/s';

  weatherSummaryImg.src = `assets/images/weather/${getWeatherImg(id)}`;
  currentDateText.textContent = getCurrentDate();

  await updateForecastInfo(city);

  showDisplaySection(mainSection);
}

async function updateForecastInfo(city) {
  const forescastsData = await fetchData('forecast', city);

  if (!forescastsData) return;

  const timeTaken = '12:00:00';
  const todayDate = new Date().toISOString().split('T')[0];

  forecastItemContainer.innerHTML = '';

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
  };

  const forecastDate = dateTaken.toLocaleDateString('en-US', dateOption);

  const forecastItem = `
    <div class="forecast-item">
        <h5 class="forecast-item-date">${forecastDate}</h5>
        <img src="assets/images/weather/${getWeatherImg(id)}" class="forecast-item-img" alt="" />
        <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
    </div>
  `;

  forecastItemContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section) {
  [mainSection, searchCitySection, notFoundSection].forEach((section) => (section.style.display = 'none'));

  section.style.display = 'flex';
}
