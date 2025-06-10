const apiKey = '1fe933f5a61a36de2d237bb0d8fb3a74';

const locationInput = document.getElementById('locationInput');
const locationDisplay = document.getElementById('location');
const tempDisplay = document.getElementById('temperature');
const descDisplay = document.getElementById('description');
const iconDisplay = document.getElementById('icon');
const forecastCards = document.getElementById('forecastCards');
const background = document.getElementById('background');
const localTimeDisplay = document.getElementById('localTime');
const liveConditions = document.getElementById('liveConditions');

locationInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    fetchWeather(locationInput.value);
  }
});

function fetchWeather(city) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  fetch(weatherUrl)
    .then(res => res.json())
    .then(data => {
      const timezoneOffset = data.timezone;
      const localDate = getLocalDateTime(data.dt, timezoneOffset);

      localTimeDisplay.textContent = `${localDate.day}, ${localDate.date} ${localDate.month} ${localDate.year} — ${localDate.timeOfDay}\nLocal Time: ${localDate.formattedTime}`;

      locationDisplay.textContent = data.name;
      tempDisplay.textContent = `${Math.round(data.main.temp)}°C`;
      descDisplay.textContent = data.weather[0].description;
      iconDisplay.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

      liveConditions.innerHTML = `
        <div class="condition">
          <img src="gifs/feels.png" class="condition-icon" alt="Feels Like" />
          <strong>Feels Like</strong><br>${Math.round(data.main.feels_like)}°C
        </div>
        <div class="condition">
          <img src="gifs/humidity.png" class="condition-icon" alt="Humidity" />
          <strong>Humidity</strong><br>${data.main.humidity}%
        </div>
        <div class="condition">
          <img src="gifs/wind.png" class="condition-icon" alt="Wind" />
          <strong>Wind Speed</strong><br>${data.wind.speed} m/s
        </div>
        <div class="condition">
          <img src="gifs/Cloudiness.png" class="condition-icon" alt="Cloudiness" />
          <strong>Cloudiness</strong><br>${data.clouds.all}%
        </div>
        <div class="condition">
          <img src="gifs/pressure.png" class="condition-icon" alt="Pressure" />
          <strong>Pressure</strong><br>${data.main.pressure} hPa
        </div>
        <div class="condition">
          <img src="gifs/visibility.png" class="condition-icon" alt="Visibility" />
          <strong>Visibility</strong><br>${(data.visibility / 1000).toFixed(1)} km
        </div>
      `;
      updateBackground(data.weather[0].main, data.weather[0].description.toLowerCase(), data.dt, data.sys.sunrise, data.sys.sunset, timezoneOffset);
    });

  fetch(forecastUrl)
    .then(res => res.json())
    .then(data => {
      forecastCards.innerHTML = '';
      const days = {};

      data.list.forEach(entry => {
        const date = new Date(entry.dt_txt);
        const day = date.toDateString();

        if (!days[day] && Object.keys(days).length < 5) {
          days[day] = entry;
          const icon = entry.weather[0].icon;
          forecastCards.innerHTML += `
            <div class="card">
              <h4>${day.split(' ')[0]}</h4>
              <img class="forecast-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" />
              <p>${Math.round(entry.main.temp)}°C</p>
            </div>
          `;
        }
      });
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
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'Morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'Afternoon';
  } else if (hour >= 17 && hour < 20) {
    timeOfDay = 'Evening';
  } else {
    timeOfDay = 'Night';
  }

  return { day, date, month, year, timeOfDay, formattedTime };
}

function updateBackground(main, description, currentUnix, sunrise, sunset, offset) {
  const hour = new Date((currentUnix + offset) * 1000).getUTCHours();
  const isNight = hour < 6 || hour > 18;

  let bg = 'default.jpg';
  if (isNight && main.toLowerCase() === 'clear') {
    bg = 'moon.gif';
  } else if (main.toLowerCase().includes('rain')) {
    bg = 'rainy.gif';
  } else if (main.toLowerCase().includes('cloud')) {
    bg = 'cloudy.gif';
  } else if (main.toLowerCase().includes('snow')) {
    bg = 'snowfall.gif';
  } else if (main.toLowerCase().includes('thunder')) {
    bg = 'thunder.gif';
  } else if (main.toLowerCase().includes('haze') || description.includes('fog')) {
    bg = 'haze.gif';
  } else if (main.toLowerCase().includes('clear')) {
    bg = 'sunny.gif';
  }
  background.style.backgroundImage = `url('gifs/${bg}')`;
}

document.body.classList.add('loading');

window.addEventListener('load', () => {
  const mercury = document.getElementById('mercury');
  const tempValue = document.getElementById('tempValue');
  const degreeLabel = document.getElementById("degreeLabel");

  let temp = 0;
  const interval = setInterval(() => {
    if (temp >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        document.getElementById("splash").style.display = "none";
        document.querySelector(".container").style.display = "flex";
        document.querySelector("footer").style.display = "block";
        document.body.classList.remove('loading');
      }, 1000);
    } else {
      temp++;
      mercury.style.height = `${temp * 2}px`;
      tempValue.textContent = `${temp}°C`;
    }
  }, 30);
});