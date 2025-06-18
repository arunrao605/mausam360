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
const weatherChart = document.getElementById('weatherChart');
const background = document.getElementById('background');

// Global variables
let currentLocation = 'London';
let chart = null;
let blinkInterval = null;

// Event Listeners
locationInput.addEventListener('keydown', function(e) {
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
  if (window.particlesJS) {
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
        events: { 
          onhover: { enable: true, mode: "grab" }, 
          onclick: { enable: true, mode: "push" }, 
          resize: true 
        },
        modes: { 
          grab: { distance: 140, line_linked: { opacity: 1 } }, 
          push: { particles_nb: 4 } 
        }
      },
      retina_detect: true
    });
  }
});

function setWeatherBackground(weatherData) {
  if (!weatherData?.weather?.[0]?.main) return;

  const weatherMain = weatherData.weather[0].main.toLowerCase();
  const isNight = isNightTime(weatherData);
  
  // Clear weather class first
  background.className = '';
  background.classList.add('weather-bg-default');
  
  const weatherCard = document.querySelector('.weather-card');
  if (weatherCard) {
    weatherCard.className = 'weather-card animate__animated animate__fadeIn';
    
    if (weatherMain.includes('clear')) {
      if (isNight) {
        background.classList.add('weather-bg-clear-night');
        weatherCard.classList.add('weather-card-clear-night');
      } else {
        background.classList.add('weather-bg-clear-day');
        weatherCard.classList.add('weather-card-clear-day');
      }
    } else if (weatherMain.includes('cloud')) {
      background.classList.add('weather-bg-clouds');
      weatherCard.classList.add('weather-card-clouds');
    } else if (weatherMain.includes('rain')) {
      background.classList.add('weather-bg-rain');
      weatherCard.classList.add('weather-card-rain');
    } else if (weatherMain.includes('thunderstorm')) {
      background.classList.add('weather-bg-thunderstorm');
      weatherCard.classList.add('weather-card-thunderstorm');
    } else if (weatherMain.includes('snow')) {
      background.classList.add('weather-bg-snow');
      weatherCard.classList.add('weather-card-snow');
    } else if (weatherMain.includes('mist') || weatherMain.includes('fog') || weatherMain.includes('haze')) {
      background.classList.add('weather-bg-mist');
      weatherCard.classList.add('weather-card-mist');
    } else {
      weatherCard.classList.add('weather-card-default');
    }
  }
}

function isNightTime(weatherData) {
  try {
    const now = new Date();
    const localTime = new Date((now.getTime() + now.getTimezoneOffset() * 60000) + (weatherData.timezone * 1000));
    const hours = localTime.getHours();
    return hours < 6 || hours >= 18;
  } catch (e) {
    console.error("Error determining night time:", e);
    return false;
  }
}

function fetchWeather(city) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  const container = document.querySelector('.container');
  if (container) {
    container.classList.add('animate__animated', 'animate__fadeOut');
  }

  setTimeout(() => {
    fetch(weatherUrl)
      .then(res => {
        if (!res.ok) throw new Error('City not found');
        return res.json();
      })
      .then(data => {
        if (!data) throw new Error('No weather data received');
        
        const timezoneOffset = data.timezone || 0;
        const localDate = getLocalDateTime(data.dt, timezoneOffset);

        setWeatherBackground(data);

        if (locationDisplay) locationDisplay.textContent = data.name || '--';
        if (tempDisplay) tempDisplay.textContent = `${Math.round(data.main?.temp || 0)}°C`;
        if (tempMinDisplay) tempMinDisplay.textContent = `↓ ${Math.round(data.main?.temp_min || 0)}°`;
        if (tempMaxDisplay) tempMaxDisplay.textContent = `↑ ${Math.round(data.main?.temp_max || 0)}°`;
        if (descDisplay) {
          descDisplay.textContent = data.weather?.[0]?.description 
            ? data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)
            : '--';
        }
        if (iconDisplay && data.weather?.[0]?.icon) {
          iconDisplay.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
          iconDisplay.alt = data.weather[0].description || 'weather icon';
          iconDisplay.classList.add('animate__animated', 'animate__pulse');
          setTimeout(() => {
            if (iconDisplay) iconDisplay.classList.remove('animate__animated', 'animate__pulse');
          }, 1000);
        }

        if (localTimeDisplay) {
          localTimeDisplay.textContent = `${localDate.day}, ${localDate.date} ${localDate.month} ${localDate.year} — ${localDate.timeOfDay}\nLocal Time: ${localDate.formattedTime}`;
        }

        if (liveConditions) {
          liveConditions.innerHTML = `
            <div class="condition animate__animated animate__fadeInUp animate-delay-1">
              <img src="gifs/feels.png" class="condition-icon" alt="Feels Like" />
              <strong>Feels Like</strong><br>${Math.round(data.main?.feels_like || 0)}°C
            </div>
            <div class="condition animate__animated animate__fadeInUp animate-delay-2">
              <img src="gifs/humidity.png" class="condition-icon" alt="Humidity" />
              <strong>Humidity</strong><br>${data.main?.humidity || 0}%
            </div>
            <div class="condition animate__animated animate__fadeInUp animate-delay-3">
              <img src="gifs/wind.png" class="condition-icon" alt="Wind" />
              <strong>Wind Speed</strong><br>${data.wind?.speed || 0} m/s
            </div>
            <div class="condition animate__animated animate__fadeInUp animate-delay-1">
              <img src="gifs/Cloudiness.png" class="condition-icon" alt="Cloudiness" />
              <strong>Cloudiness</strong><br>${data.clouds?.all || 0}%
            </div>
            <div class="condition animate__animated animate__fadeInUp animate-delay-2">
              <img src="gifs/pressure.png" class="condition-icon" alt="Pressure" />
              <strong>Pressure</strong><br>${data.main?.pressure || 0} hPa
            </div>
            <div class="condition animate__animated animate__fadeInUp animate-delay-3">
              <img src="gifs/visibility.png" class="condition-icon" alt="Visibility" />
              <strong>Visibility</strong><br>${data.visibility ? (data.visibility / 1000).toFixed(1) : 0} km
            </div>
          `;
        }

        if (container) {
          container.classList.remove('animate__fadeOut');
          container.classList.add('animate__animated', 'animate__fadeIn');
        }

        return fetch(forecastUrl);
      })
      .then(res => {
        if (!res.ok) throw new Error('Forecast not available');
        return res.json();
      })
      .then(data => {
        if (!data) throw new Error('No forecast data received');
        
        if (forecastCards) {
          forecastCards.innerHTML = '';
          const days = {};
          let dayCount = 0;

          data.list.forEach(entry => {
            const date = new Date(entry.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });

            if (date.getHours() >= 11 && date.getHours() <= 13 && !days[day] && dayCount < 5) {
              days[day] = entry;
              dayCount++;
              const icon = entry.weather?.[0]?.icon || '';

              forecastCards.innerHTML += `
                <div class="card animate__animated animate__fadeInUp" style="animation-delay: ${dayCount * 0.1}s">
                  <h4>${day}</h4>
                  <img class="forecast-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${entry.weather?.[0]?.description || ''}" />
                  <p>${Math.round(entry.main?.temp || 0)}°C</p>
                  <small>${entry.weather?.[0]?.description || ''}</small>
                </div>
              `;
            }
          });
        }

        if (data.city?.timezone !== undefined && data.list) {
          updateHourlyForecast(data.list, data.city.timezone);
        }
      })
      .catch(err => {
        console.error("Error fetching weather:", err);
        alert(err.message);
        if (container) {
          container.classList.remove('animate__fadeOut');
          container.classList.add('animate__animated', 'animate__fadeIn');
        }
      });
  }, 500);
}

function updateHourlyForecast(forecastList, timezoneOffset = 0) {
  // Clear previous blinking interval
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }

  // Convert timezoneOffset to number (in case it's string)
  timezoneOffset = Number(timezoneOffset) || 0;

  // Get current time in local timezone
  const now = new Date();
  const localNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + timezoneOffset * 1000);
  const currentHour = new Date(localNow);
  currentHour.setMinutes(0, 0, 0);

  // Get data for past 2 hours, current hour, and next 13 hours (16 total)
  const startTime = new Date(currentHour.getTime() - 2 * 60 * 60 * 1000);
  const endTime = new Date(currentHour.getTime() + 14 * 60 * 60 * 1000);

  // Find the forecast point just before our start time
  let baseIndex = 0;
  while (baseIndex < forecastList.length - 1 && 
         new Date(forecastList[baseIndex].dt * 1000) < startTime) {
    baseIndex++;
  }
  baseIndex = Math.max(0, baseIndex - 1);

  // Create hourly data points through interpolation
  const hourlyData = [];
  let currentIndex = baseIndex;
  
  // Generate data for each hour in our range
  for (let hour = 0; hour < 16; hour++) {
    const targetTime = new Date(startTime.getTime() + hour * 60 * 60 * 1000);
    
    // Find the two forecast points that bracket our target time
    while (currentIndex < forecastList.length - 1 && 
           new Date(forecastList[currentIndex + 1].dt * 1000) < targetTime) {
      currentIndex++;
    }
    
    if (currentIndex >= forecastList.length - 1) break;

    const prevPoint = forecastList[currentIndex];
    const nextPoint = forecastList[currentIndex + 1];
    const prevTime = new Date(prevPoint.dt * 1000);
    const nextTime = new Date(nextPoint.dt * 1000);
    
    // Calculate ratio for interpolation
    const timeDiff = nextTime - prevTime;
    const ratio = timeDiff > 0 ? (targetTime - prevTime) / timeDiff : 0;
    
    // Interpolate temperature
    const temp = prevPoint.main.temp + (nextPoint.main.temp - prevPoint.main.temp) * ratio;
    
    // Distribute precipitation evenly across hours
    const prevRain = prevPoint.rain ? (prevPoint.rain['3h'] || 0) / 3 : 0;
    const nextRain = nextPoint.rain ? (nextPoint.rain['3h'] || 0) / 3 : 0;
    const precip = prevRain + (nextRain - prevRain) * ratio;
    
    hourlyData.push({
      time: targetTime,
      temp: temp,
      precip: precip,
      isCurrent: Math.abs(targetTime.getTime() - currentHour.getTime()) < 30 * 60 * 1000 // Within 30 minutes
    });
  }

  // Prepare chart data
  const labels = hourlyData.map(entry => {
    return entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const temperatures = hourlyData.map(entry => entry.temp);
  const precipitations = hourlyData.map(entry => entry.precip);
  const currentIndexInData = hourlyData.findIndex(entry => entry.isCurrent);

  // Destroy previous chart if it exists
  if (chart && typeof chart.destroy === 'function') {
    chart.destroy();
  }

  // Create new chart only if canvas is available
  if (!weatherChart) return;
  
  const ctx = weatherChart.getContext('2d');
  if (!ctx) return;

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temperatures,
          type: 'line',
          borderColor: 'rgba(250, 0, 0, 0.88)',
          backgroundColor: 'rgba(255, 0, 0, 0.64)',
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'y',
          pointBackgroundColor: temperatures.map((_, i) => 
            i === currentIndexInData ? 'rgba(207, 94, 241, 0.86)' : 'rgba(240, 8, 8, 0.62)'
          ),
          pointRadius: temperatures.map((_, i) => 
            i === currentIndexInData ? 6 : 3
          ),
          pointHoverRadius: temperatures.map((_, i) => 
            i === currentIndexInData ? 8 : 5
          )
        },
        {
          label: 'Precipitation (mm)',
          data: precipitations,
          backgroundColor: 'rgba(6, 151, 247, 0.93)',
          borderColor: 'rgba(7, 237, 245, 0.72)',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          font: {
            size: 16
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.datasetIndex === 0) {
                label += context.parsed.y.toFixed(1) + '°C';
              } else {
                label += context.parsed.y.toFixed(1) + ' mm';
              }
              return label;
            },
            afterLabel: function(context) {
              if (context.dataIndex === currentIndexInData) {
                return '(Current Time)';
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'Local Time'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Temperature (°C)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Precipitation (mm)'
          },
          grid: {
            drawOnChartArea: false
          },
          min: 0
        }
      }
    }
  });

  // Add blinking effect to current time point
  if (currentIndexInData >= 0 && chart) {
    blinkInterval = setInterval(() => {
      if (!chart || chart.ctx === null) {
        clearInterval(blinkInterval);
        return;
      }
      
      const meta = chart.getDatasetMeta(0);
      if (meta && meta.data[currentIndexInData]) {
        const currentState = meta.data[currentIndexInData].options.backgroundColor === 'rgba(255, 99, 132, 1)';
        
        meta.data[currentIndexInData].options.backgroundColor = 
          currentState ? 'rgba(255, 255, 255, 1)' : 'rgb(83, 0, 238)';
        meta.data[currentIndexInData].options.borderColor = 
          currentState ? 'rgba(255, 255, 255, 1)' : 'rgb(99, 255, 229)';
        
        chart.update('none');
      }
    }, 800);
  }
}

function getLocalDateTime(unixTime, offset) {
  try {
    const local = new Date((unixTime + offset) * 1000);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = days[local.getUTCDay()] || '--';
    const date = local.getUTCDate() || '--';
    const month = months[local.getUTCMonth()] || '--';
    const year = local.getUTCFullYear() || '--';
    const hour = local.getUTCHours();
    const minute = local.getUTCMinutes().toString().padStart(2, '0');
    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute}`;

    let timeOfDay = '';
    if (hour >= 5 && hour < 12) timeOfDay = 'Morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'Afternoon';
    else if (hour >= 17 && hour < 20) timeOfDay = 'Evening';
    else timeOfDay = 'Night';

    return { day, date, month, year, timeOfDay, formattedTime };
  } catch (e) {
    console.error("Error formatting local time:", e);
    return { 
      day: '--', 
      date: '--', 
      month: '--', 
      year: '--', 
      timeOfDay: '--', 
      formattedTime: '--:--' 
    };
  }
}

// Splash Screen Animation
document.body.classList.add('loading');

window.addEventListener('load', () => {
  const cloud = document.querySelector('.cloud');
  const rain = document.querySelector('.rain');

  if (rain) {
    for (let i = 0; i < 10; i++) {
      const drop = document.createElement('span');
      drop.style.setProperty('--i', i);
      rain.appendChild(drop);
    }
  }

  setTimeout(() => {
    if (cloud) {
      cloud.classList.add('animate__fadeIn');
      cloud.style.opacity = '1';
    }
  }, 500);

  setTimeout(() => {
    if (rain) {
      rain.classList.add('animate__fadeIn');
      rain.style.opacity = '1';
    }
  }, 1000);

  let temp = 0;
  const interval = setInterval(() => {
    if (temp >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        const splash = document.getElementById("splash");
        const container = document.querySelector(".container");
        const footer = document.querySelector("footer");
        
        if (splash) splash.style.display = "none";
        if (container) container.style.display = "flex";
        if (footer) footer.style.display = "block";
        
        document.body.classList.remove('loading');
        fetchWeather(currentLocation);
      }, 1000);
    } else {
      temp++;
    }
  }, 30);
});

// Initialize weather on load
window.addEventListener('load', () => {
  setTimeout(() => {
    fetchWeather(currentLocation);
  }, 3500); // Wait for splash screen to finish
});
