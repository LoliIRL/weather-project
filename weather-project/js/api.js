import { WeatherData, ForecastDay } from './models.js';

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

async function getCoordinates(city) {
    const url = `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`;
    const response = await fetch(url);
    if(!response.ok) throw new Error('Ошибка геокодирования');
    const data = await response.json();
    if(!data.results || data.results.length === 0) {
        throw new Error(`Город "${city}" не найден`);
    }
    const result = data.results[0];
    return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: result.name,
        country: result.country
    };
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Ясно', 1: 'Преимущественно ясно', 2: 'Переменная облачность', 3: 'Пасмурно',
        45: 'Туман', 48: 'Туман с изморозью',
        51: 'Морось', 53: 'Морось умеренная', 55: 'Морось сильная',
        61: 'Дождь слабый', 63: 'Дождь умеренный', 65: 'Дождь сильный',
        71: 'Снег слабый', 73: 'Снег умеренный', 75: 'Снег сильный',
        80: 'Ливень слабый', 81: 'Ливень умеренный', 82: 'Ливень сильный',
        95: 'Гроза', 96: 'Гроза с градом', 99: 'Гроза с градом сильным'
    };
    return weatherCodes[code] || 'Неизвестно';
}

function getWeatherIcon(code) {
    if(code === 0) return 'https://cdn.weatherapi.com/weather/64x64/day/113.png';
    if(code === 1 || code === 2) return 'https://cdn.weatherapi.com/weather/64x64/day/116.png';
    if(code === 3) return 'https://cdn.weatherapi.com/weather/64x64/day/119.png';
    if(code >= 45 && code <= 48) return 'https://cdn.weatherapi.com/weather/64x64/day/248.png';
    if(code >= 51 && code <= 57) return 'https://cdn.weatherapi.com/weather/64x64/day/266.png';
    if(code >= 61 && code <= 67) return 'https://cdn.weatherapi.com/weather/64x64/day/296.png';
    if(code >= 71 && code <= 77) return 'https://cdn.weatherapi.com/weather/64x64/day/332.png';
    if(code >= 80 && code <= 82) return 'https://cdn.weatherapi.com/weather/64x64/day/299.png';
    if(code >= 95 && code <= 99) return 'https://cdn.weatherapi.com/weather/64x64/day/200.png';
    return 'https://cdn.weatherapi.com/weather/64x64/day/113.png';
}

export async function fetchCurrentWeather(city) {
    const coords = await getCoordinates(city);
    const url = `${WEATHER_API}?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true&timezone=auto`;
    const response = await fetch(url);
    if(!response.ok) throw new Error('Ошибка получения погоды');
    const data = await response.json();
    const current = data.current_weather;
    
    return new WeatherData({
        location: { name: coords.name, country: coords.country },
        current: {
            temp_c: current.temperature,
            wind_kph: current.windspeed,
            humidity: 65,
            pressure_mb: 1013,
            vis_km: 10,
            condition: { text: getWeatherDescription(current.weathercode), icon: getWeatherIcon(current.weathercode) },
            last_updated: new Date().toLocaleString(),
            feelslike_c: current.temperature - 1
        }
    });
}

export async function fetchForecast(city, days = 7) {
    const coords = await getCoordinates(city);
    const url = `${WEATHER_API}?latitude=${coords.latitude}&longitude=${coords.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=${days}`;
    const response = await fetch(url);
    if(!response.ok) throw new Error('Ошибка получения прогноза');
    const data = await response.json();
    const daily = data.daily;
    
    const forecastDays = [];
    for(let i = 0; i < daily.time.length; i++) {
        forecastDays.push(new ForecastDay({
            date: daily.time[i],
            day: {
                maxtemp_c: daily.temperature_2m_max[i],
                mintemp_c: daily.temperature_2m_min[i],
                condition: { text: getWeatherDescription(daily.weathercode[i]), icon: getWeatherIcon(daily.weathercode[i]) },
                daily_chance_of_rain: daily.precipitation_probability_max[i] || 0
            }
        }));
    }
    return forecastDays;
}