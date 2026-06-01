import { fetchCurrentWeather, fetchForecast } from './api.js';
import { 
    loadFavorites, addToFavorites, removeFromFavorites, 
    clearFavorites, loadUserName, saveUserName, clearUserData 
} from './storage.js';
import { 
    displayCurrentWeather, displayForecast, displayStats, 
    displayFavorites, showError, updateWelcomeMessage, clearAllData 
} from './ui.js';
import { WeatherStats } from './models.js';
import { validateUserName, validateCityName } from './utils.js';

let currentCity = null;
let currentWeather = null;
let currentForecast = [];
let currentFavorites = [];
let currentFilterWarm = false;
let currentSortBy = 'date';

async function loadWeatherData(city) {
    if(!city) return;
    
    const searchBtn = document.getElementById('searchBtn');
    const originalBtnText = searchBtn?.innerHTML;
    if(searchBtn) searchBtn.innerHTML = '<div class="loading"></div>';
    
    try {
        const [weather, forecast] = await Promise.all([
            fetchCurrentWeather(city),
            fetchForecast(city, 7)
        ]);
        
        currentCity = city;
        currentWeather = weather;
        currentForecast = forecast;
        
        displayCurrentWeather(weather);
        displayForecast(forecast, currentFilterWarm, currentSortBy);
        
        const stats = new WeatherStats(forecast);
        displayStats(stats);
        
    } catch(error) {
        showError(`Ошибка: ${error.message}`);
    } finally {
        if(searchBtn) searchBtn.innerHTML = originalBtnText;
    }
}

function updateFavoritesUI() {
    displayFavorites(
        currentFavorites,
        (cityName) => {
            document.getElementById('cityInput').value = cityName;
            loadWeatherData(cityName);
        },
        (cityName) => {
            currentFavorites = removeFromFavorites(currentFavorites, cityName);
            updateFavoritesUI();
            showError(`Город "${cityName}" удалён из избранного`);
        }
    );
}

function addCurrentCityToFavorites() {
    if(!currentWeather) {
        showError('Сначала найдите погоду в городе');
        return;
    }
    currentFavorites = addToFavorites(currentFavorites, currentWeather.city, currentWeather.country);
    updateFavoritesUI();
    showError(`Город "${currentWeather.city}" добавлен в избранное ⭐`);
}

function clearAllFavorites() {
    if(confirm('Вы уверены?')) {
        currentFavorites = clearFavorites();
        updateFavoritesUI();
        showError('Все избранные города удалены');
    }
}

function toggleWarmFilter() {
    const checkbox = document.getElementById('tempFilterCheckbox');
    currentFilterWarm = checkbox.checked;
    displayForecast(currentForecast, currentFilterWarm, currentSortBy);
    
    if(currentForecast.length > 0) {
        let filteredForecast = currentFilterWarm 
            ? currentForecast.filter(day => day.isWarm()) 
            : currentForecast;
        const stats = new WeatherStats(filteredForecast);
        displayStats(stats);
    }
}

function sortByDate() {
    currentSortBy = 'date';
    displayForecast(currentForecast, currentFilterWarm, currentSortBy);
    
    document.getElementById('sortByDateBtn').style.background = '#667eea';
    document.getElementById('sortByDateBtn').style.color = 'white';
    document.getElementById('sortByTempBtn').style.background = '#f0f0f0';
    document.getElementById('sortByTempBtn').style.color = '#333';
}

function sortByTemp() {
    currentSortBy = 'temp';
    displayForecast(currentForecast, currentFilterWarm, currentSortBy);
    
    document.getElementById('sortByTempBtn').style.background = '#667eea';
    document.getElementById('sortByTempBtn').style.color = 'white';
    document.getElementById('sortByDateBtn').style.background = '#f0f0f0';
    document.getElementById('sortByDateBtn').style.color = '#333';
}

function showMainScreen(userName) {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainScreen = document.getElementById('mainScreen');
    
    welcomeScreen.style.display = 'none';
    mainScreen.style.display = 'flex';
    
    updateWelcomeMessage(userName);
    currentFavorites = loadFavorites();
    updateFavoritesUI();
}

function logout() {
    if(confirm('Вы уверены?')) {
        clearUserData();
        
        document.getElementById('welcomeScreen').style.display = 'flex';
        document.getElementById('mainScreen').style.display = 'none';
        document.getElementById('userNameInput').value = '';
        
        clearAllData();
        currentCity = null;
        currentWeather = null;
        currentForecast = [];
        currentFavorites = [];
        currentFilterWarm = false;
        currentSortBy = 'date';
    }
}

function initEventListeners() {
    const startBtn = document.getElementById('startBtn');
    const userNameInput = document.getElementById('userNameInput');
    
    if(startBtn) {
        startBtn.addEventListener('click', () => {
            const name = userNameInput.value.trim();
            const validation = validateUserName(name);
            if(!validation.valid) {
                showError(validation.message);
                return;
            }
            saveUserName(name);
            showMainScreen(name);
        });
    }
    
    if(userNameInput) {
        userNameInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') startBtn.click();
        });
    }
    
    const searchBtn = document.getElementById('searchBtn');
    const cityInput = document.getElementById('cityInput');
    
    if(searchBtn) {
        searchBtn.addEventListener('click', () => {
            const city = cityInput.value.trim();
            const validation = validateCityName(city);
            if(!validation.valid) {
                showError(validation.message);
                return;
            }
            loadWeatherData(city);
        });
    }
    
    if(cityInput) {
        cityInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') searchBtn.click();
        });
    }
    
    document.querySelectorAll('.quick-city').forEach(btn => {
        btn.addEventListener('click', () => {
            const city = btn.dataset.city;
            cityInput.value = city;
            loadWeatherData(city);
        });
    });
    
    const addToFavoritesBtn = document.getElementById('addToFavoritesBtn');
    if(addToFavoritesBtn) {
        addToFavoritesBtn.addEventListener('click', addCurrentCityToFavorites);
    }
    
    const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
    if(clearFavoritesBtn) {
        clearFavoritesBtn.addEventListener('click', clearAllFavorites);
    }
    
    const tempFilterCheckbox = document.getElementById('tempFilterCheckbox');
    if(tempFilterCheckbox) {
        tempFilterCheckbox.addEventListener('change', toggleWarmFilter);
    }
    
    const sortByDateBtn = document.getElementById('sortByDateBtn');
    const sortByTempBtn = document.getElementById('sortByTempBtn');
    
    if(sortByDateBtn) sortByDateBtn.addEventListener('click', sortByDate);
    if(sortByTempBtn) sortByTempBtn.addEventListener('click', sortByTemp);
    
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    document.addEventListener('keydown', (e) => {
        if(e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            cityInput?.focus();
        }
        if(e.key === 'Escape') {
            if(cityInput) cityInput.value = '';
        }
    });
}

function init() {
    const savedName = loadUserName();
    if(savedName) {
        showMainScreen(savedName);
    }
    initEventListeners();
    
    const cityInput = document.getElementById('cityInput');
    if(cityInput && savedName) {
        cityInput.value = 'Moscow';
        loadWeatherData('Moscow');
    }
    
    console.log('Приложение запущено');
}

document.addEventListener('DOMContentLoaded', init);