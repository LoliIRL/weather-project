export function displayCurrentWeather(weatherData) {
    const container = document.getElementById('currentWeather');
    const cityNameEl = document.getElementById('cityName');
    const weatherDateEl = document.getElementById('weatherDate');
    const temperatureEl = document.getElementById('temperature');
    const conditionEl = document.getElementById('condition');
    const weatherIcon = document.getElementById('weatherIcon');
    const humidityEl = document.getElementById('humidity');
    const windEl = document.getElementById('wind');
    const pressureEl = document.getElementById('pressure');
    const visibilityEl = document.getElementById('visibility');
    
    if(!weatherData) {
        container.style.display = 'none';
        return;
    }
    
    cityNameEl.textContent = `${weatherData.city}, ${weatherData.country}`;
    weatherDateEl.textContent = `Обновлено: ${weatherData.lastUpdated}`;
    temperatureEl.textContent = weatherData.temperature;
    conditionEl.textContent = weatherData.condition;
    weatherIcon.src = weatherData.icon;
    humidityEl.textContent = `${weatherData.humidity}%`;
    windEl.textContent = weatherData.getFormattedWind();
    pressureEl.textContent = `${weatherData.pressureMb} hPa`;
    visibilityEl.textContent = `${weatherData.visibilityKm} км`;
    
    container.style.display = 'block';
}

export function displayForecast(forecastDays, filterWarm = false, sortBy = 'date') {
    const container = document.getElementById('forecastList');
    const section = document.getElementById('forecastSection');
    
    if(!forecastDays || forecastDays.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    let filteredDays = [...forecastDays];
    if(filterWarm) {
        filteredDays = filteredDays.filter(day => day.isWarm());
    }
    if(sortBy === 'date') {
        filteredDays.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if(sortBy === 'temp') {
        filteredDays.sort((a, b) => b.avgTemp - a.avgTemp);
    }
    
    if(filteredDays.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Нет дней, соответствующих фильтру</div>';
        section.style.display = 'block';
        return;
    }
    
    container.innerHTML = filteredDays.map(day => `
        <div class="forecast-day">
            <div class="forecast-date">${day.getFormattedDate()}</div>
            <img src="${day.icon}" alt="${day.condition}" style="width: 40px; height: 40px;">
            <div class="forecast-temp">${Math.round(day.avgTemp)}°C</div>
            <div class="forecast-condition">${day.condition}</div>
            <div style="font-size: 11px; margin-top: 5px;">${day.chanceOfRain}% дождь</div>
        </div>
    `).join('');
    
    section.style.display = 'block';
}

export function displayStats(stats) {
    const container = document.getElementById('statsGrid');
    const section = document.getElementById('statsSection');
    
    if(!stats) {
        section.style.display = 'none';
        return;
    }
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Средняя температура</div>
            <div class="stat-value">${stats.getAverageTemp()}°C</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Максимальная температура</div>
            <div class="stat-value">${stats.getMaxTemp()}°C</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Минимальная температура</div>
            <div class="stat-value">${stats.getMinTemp()}°C</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Тёплые дни (>15°C)</div>
            <div class="stat-value">${stats.getWarmDaysCount()}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Дождливые дни</div>
            <div class="stat-value">${stats.getRainyDaysCount()}</div>
        </div>
    `;
    
    section.style.display = 'block';
}

export function displayFavorites(favorites, onSelect, onRemove) {
    const container = document.getElementById('favoritesList');
    const section = document.getElementById('favoritesSection');
    
    if(!favorites || favorites.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    container.innerHTML = favorites.map(fav => `
        <div class="favorite-item">
            <span class="favorite-name" data-city="${fav.name}">${fav.getDisplayName()}</span>
            <button class="remove-favorite" data-city="${fav.name}">✖️</button>
        </div>
    `).join('');
    
    container.querySelectorAll('.favorite-name').forEach(el => {
        el.addEventListener('click', () => onSelect(el.dataset.city));
    });
    container.querySelectorAll('.remove-favorite').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            onRemove(el.dataset.city);
        });
    });
    
    section.style.display = 'block';
}

export function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

export function updateWelcomeMessage(userName) {
    const messageEl = document.getElementById('welcomeMessage');
    if(messageEl) {
        messageEl.innerHTML = `👋 Привет, ${userName}!`;
    }
}

export function clearAllData() {
    const currentWeather = document.getElementById('currentWeather');
    const forecastSection = document.getElementById('forecastSection');
    const statsSection = document.getElementById('statsSection');
    const favoritesSection = document.getElementById('favoritesSection');
    
    if(currentWeather) currentWeather.style.display = 'none';
    if(forecastSection) forecastSection.style.display = 'none';
    if(statsSection) statsSection.style.display = 'none';
    if(favoritesSection) favoritesSection.style.display = 'none';
}