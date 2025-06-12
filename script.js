const apiKey = '1fe933f5a61a36de2d237bb0d8fb3a74';

// DOM Elements
const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const locationDisplay = document.getElementById('location');
const tempDisplay = document.getElementById('temperature');
const descDisplay = document.getElementById('description');
const iconDisplay = document.getElementById('icon');
const forecastCards = document.getElementById('forecastCards');
const localTimeDisplay = document.getElementById('localTime');
const liveConditions = document.getElementById('liveConditions');
const tempMinDisplay = document.getElementById('temp-min');
const tempMaxDisplay = document.getElementById('temp-max');
const hourlyCards = document.getElementById('hourlyCards');
const background = document.getElementById('background');

// Default location
let currentLocation = 'London';

// Event Listeners
locationInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    currentLocation = locationInput.value;
    fetchWeather(currentLocation);
  }
});

searchBtn.addEventListener('click', function() {
  currentLocation = locationInput.value;
  fetchWeather(currentLocation);
});

// Initialize particles.js
document.addEventListener('DOMContentLoaded', function() {
  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: "#4361ee" },
      shape: { type: "circle", stroke: { width: 0 }, polygon: { nb_sides: 5 } },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: "#4361ee", opacity: 0.4, width: 1 },
      move: { enable: true, speed: 2, out_mode: "out" }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" }, resize: true },
      modes: { grab: { distance: 140, line_linked: { opacity: 1 } }, push: { particles_nb: 4 } }
    },
    retina_detect: true
  });
});

// Set background based on weather and time
function setWeatherBackground(weatherData) {
  const weatherMain = weatherData.weather[0].main.toLowerCase();
  const isNight = isNightTime(weatherData);
  
  // Clear weather class first
  background.className = '';
  background.classList.add('weather-bg-default');
  
  if (weatherMain.includes('clear')) {
    if (isNight) {
      background.classList.add('weather-bg-clear-night');
    } else {
      background.classList.add('weather-bg-clear-day');
    }
  } else if (weatherMain.includes('cloud')) {
    background.classList.add('weather-bg-clouds');
  } else if (weatherMain.includes('rain')) {
    background.classList.add('weather-bg-rain');
  } else if (weatherMain.includes('thunderstorm')) {
    background.classList.add('weather-bg-thunderstorm');
  } else if (weatherMain.includes('snow')) {
    background.classList.add('weather-bg-snow');
  } else if (weatherMain.includes('mist') || weatherMain.includes('fog') || weatherMain.includes('haze')) {
    background.classList.add('weather-bg-mist');
  }
}

// Check if it's night time
function isNightTime(weatherData) {
  const now = new Date();
  const localTime = new Date((now.getTime() + now.getTimezoneOffset() * 60000) + (weatherData.timezone * 1000));
  const hours = localTime.getHours();
  return hours < 6 || hours >= 18;
}

// Fetch Weather Data
function fetchWeather(city) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  document.querySelector('.container').classList.add('animate__animated', 'animate__fadeOut');

  setTimeout(() => {
    fetch(weatherUrl)
      .then(res => {
        if (!res.ok) throw new Error('City not found');
        return res.json();
      })
      .then(data => {
        const timezoneOffset = data.timezone;
        const localDate = getLocalDateTime(data.dt, timezoneOffset);

        // Set background based on weather
        setWeatherBackground(data);

        localTimeDisplay.textContent = `${localDate.day}, ${localDate.date} ${localDate.month} ${localDate.year} — ${localDate.timeOfDay}\nLocal Time: ${localDate.formattedTime}`;
        locationDisplay.textContent = data.name;
        tempDisplay.textContent = `${Math.round(data.main.temp)}°C`;
        tempMinDisplay.textContent = `↓ ${Math.round(data.main.temp_min)}°`;
        tempMaxDisplay.textContent = `↑ ${Math.round(data.main.temp_max)}°`;
        descDisplay.textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
        iconDisplay.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        iconDisplay.alt = data.weather[0].description;

        iconDisplay.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => iconDisplay.classList.remove('animate__animated', 'animate__pulse'), 1000);

        liveConditions.innerHTML = `
          <div class="condition animate__animated animate__fadeInUp animate-delay-1">
            <img src="gifs/feels.png" class="condition-icon" alt="Feels Like" />
            <strong>Feels Like</strong><br>${Math.round(data.main.feels_like)}°C
          </div>
          <div class="condition animate__animated animate__fadeInUp animate-delay-2">
            <img src="gifs/humidity.png" class="condition-icon" alt="Humidity" />
            <strong>Humidity</strong><br>${data.main.humidity}%
          </div>
          <div class="condition animate__animated animate__fadeInUp animate-delay-3">
            <img src="gifs/wind.png" class="condition-icon" alt="Wind" />
            <strong>Wind Speed</strong><br>${data.wind.speed} m/s
          </div>
          <div class="condition animate__animated animate__fadeInUp animate-delay-1">
            <img src="gifs/Cloudiness.png" class="condition-icon" alt="Cloudiness" />
            <strong>Cloudiness</strong><br>${data.clouds.all}%
          </div>
          <div class="condition animate__animated animate__fadeInUp animate-delay-2">
            <img src="gifs/pressure.png" class="condition-icon" alt="Pressure" />
            <strong>Pressure</strong><br>${data.main.pressure} hPa
          </div>
          <div class="condition animate__animated animate__fadeInUp animate-delay-3">
            <img src="gifs/visibility.png" class="condition-icon" alt="Visibility" />
            <strong>Visibility</strong><br>${(data.visibility / 1000).toFixed(1)} km
          </div>
        `;

        document.querySelector('.container').classList.remove('animate__fadeOut');
        document.querySelector('.container').classList.add('animate__animated', 'animate__fadeIn');
      })
      .catch(err => {
        alert(err.message);
        document.querySelector('.container').classList.remove('animate__fadeOut');
        document.querySelector('.container').classList.add('animate__animated', 'animate__fadeIn');
      });

    fetch(forecastUrl)
      .then(res => res.json())
      .then(data => {
        forecastCards.innerHTML = '';
        const days = {};
        let dayCount = 0;

        data.list.forEach(entry => {
          const date = new Date(entry.dt * 1000);
          const day = date.toLocaleDateString('en-US', { weekday: 'short' });

          if (date.getHours() >= 11 && date.getHours() <= 13 && !days[day] && dayCount < 5) {
            days[day] = entry;
            dayCount++;
            const icon = entry.weather[0].icon;

            forecastCards.innerHTML += `
              <div class="card animate__animated animate__fadeInUp" style="animation-delay: ${dayCount * 0.1}s">
                <h4>${day}</h4>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${entry.weather[0].description}" />
                <p>${Math.round(entry.main.temp)}°C</p>
                <small>${entry.weather[0].description}</small>
              </div>
            `;
          }
        });

        updateHourlyForecast(data.list);
      });
  }, 500);
}

function updateHourlyForecast(forecastList) {
  hourlyCards.innerHTML = '';

  const now = new Date();
  const next16Hours = forecastList.filter(entry => {
    const entryTime = new Date(entry.dt * 1000);
    return entryTime > now && entryTime <= new Date(now.getTime() + 16 * 60 * 60 * 1000);
  }).slice(0, 16);

  next16Hours.forEach((entry, index) => {
    const time = new Date(entry.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const icon = entry.weather[0].icon;

    hourlyCards.innerHTML += `
      <div class="hourly-card animate__animated animate__fadeInRight" style="animation-delay: ${index * 0.1}s">
        <div>${time}</div>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${entry.weather[0].description}" />
        <div>${Math.round(entry.main.temp)}°C</div>
      </div>
    `;
  });
}

function getLocalDateTime(unixTime, offset) {
  const local = new Date((unixTime + offset) * 1000);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const day = days[local.getUTCDay()];
  const date = local.getUTCDate();
  const month = months[local.getUTCMonth()];
  const year = local.getUTCFullYear();
  const hour = local.getUTCHours();
  const minute = local.getUTCMinutes().toString().padStart(2, '0');
  const formattedTime = `${hour.toString().padStart(2, '0')}:${minute}`;

  let timeOfDay = '';
  if (hour >= 5 && hour < 12) timeOfDay = 'Morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'Afternoon';
  else if (hour >= 17 && hour < 20) timeOfDay = 'Evening';
  else timeOfDay = 'Night';

  return { day, date, month, year, timeOfDay, formattedTime };
}

// Splash Screen Animation
document.body.classList.add('loading');

window.addEventListener('load', () => {
  const cloud = document.querySelector('.cloud');
  const rain = document.querySelector('.rain');

  for (let i = 0; i < 10; i++) {
    const drop = document.createElement('span');
    drop.style.setProperty('--i', i);
    rain.appendChild(drop);
  }

  setTimeout(() => {
    cloud.classList.add('animate__fadeIn');
    cloud.style.opacity = '1';
  }, 500);

  setTimeout(() => {
    rain.classList.add('animate__fadeIn');
    rain.style.opacity = '1';
  }, 1000);

  let temp = 0;
  const interval = setInterval(() => {
    if (temp >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        document.getElementById("splash").style.display = "none";
        document.querySelector(".container").style.display = "flex";
        document.querySelector("footer").style.display = "block";
        document.body.classList.remove('loading');
        fetchWeather(currentLocation);
      }, 1000);
    } else {
      temp++;
    }
  }, 30);
});
