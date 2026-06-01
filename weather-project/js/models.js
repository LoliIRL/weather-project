export class WeatherData {
    constructor(data) {
        this.city = data.location?.name || 'Unknown';
        this.country = data.location?.country || 'Unknown';
        this.temperature = data.current?.temp_c || 0;
        this.condition = data.current?.condition?.text || 'Unknown';
        this.icon = data.current?.condition?.icon || '';
        this.humidity = data.current?.humidity || 0;
        this.windKph = data.current?.wind_kph || 0;
        this.pressureMb = data.current?.pressure_mb || 1013;
        this.visibilityKm = data.current?.vis_km || 10;
        this.lastUpdated = data.current?.last_updated || new Date().toLocaleString();
        this.feelsLike = data.current?.feelslike_c || this.temperature;
    }
    
    getFormattedWind() {
        return `${this.windKph} км/ч`;
    }
}

export class ForecastDay {
    constructor(dayData) {
        this.date = dayData.date || '';
        this.maxTemp = dayData.day?.maxtemp_c || 0;
        this.minTemp = dayData.day?.mintemp_c || 0;
        this.avgTemp = (this.maxTemp + this.minTemp) / 2;
        this.condition = dayData.day?.condition?.text || 'Unknown';
        this.icon = dayData.day?.condition?.icon || '';
        this.chanceOfRain = dayData.day?.daily_chance_of_rain || 0;
    }
    
    getFormattedDate() {
        const date = new Date(this.date);
        return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
    }
    
    isWarm() {
        return this.avgTemp > 15;
    }
}

export class FavoriteCity {
    constructor(name, country = '') {
        this.name = name;
        this.country = country;
        this.addedAt = new Date().toISOString();
    }
    
    getDisplayName() {
        return this.country ? `${this.name}, ${this.country}` : this.name;
    }
}

export class WeatherStats {
    constructor(forecastDays) {
        this.forecastDays = forecastDays;
    }
    
    getAverageTemp() {
        if(this.forecastDays.length === 0) return 0;
        const sum = this.forecastDays.reduce((acc, day) => acc + day.avgTemp, 0);
        return Math.round(sum / this.forecastDays.length);
    }
    
    getMaxTemp() {
        if(this.forecastDays.length === 0) return 0;
        return Math.max(...this.forecastDays.map(day => day.maxTemp));
    }
    
    getMinTemp() {
        if(this.forecastDays.length === 0) return 0;
        return Math.min(...this.forecastDays.map(day => day.minTemp));
    }
    
    getWarmDaysCount() {
        return this.forecastDays.filter(day => day.isWarm()).length;
    }
    
    getRainyDaysCount() {
        return this.forecastDays.filter(day => day.chanceOfRain > 50).length;
    }
}