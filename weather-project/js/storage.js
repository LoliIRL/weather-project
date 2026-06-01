import { FavoriteCity } from './models.js';

const STORAGE_KEYS = {
    FAVORITES: 'weather_favorites',
    USER_NAME: 'weather_username'
};

export function saveFavorites(favorites) {
    const data = favorites.map(fav => ({ name: fav.name, country: fav.country, addedAt: fav.addedAt }));
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data));
}

export function loadFavorites() {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if(!data) return [];
    try {
        const parsed = JSON.parse(data);
        return parsed.map(item => new FavoriteCity(item.name, item.country));
    } catch {
        return [];
    }
}

export function addToFavorites(favorites, cityName, country = '') {
    const exists = favorites.some(fav => fav.name.toLowerCase() === cityName.toLowerCase());
    if(exists) return favorites;
    const newFavorite = new FavoriteCity(cityName, country);
    const newFavorites = [...favorites, newFavorite];
    saveFavorites(newFavorites);
    return newFavorites;
}

export function removeFromFavorites(favorites, cityName) {
    const newFavorites = favorites.filter(fav => fav.name.toLowerCase() !== cityName.toLowerCase());
    saveFavorites(newFavorites);
    return newFavorites;
}

export function clearFavorites() {
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    return [];
}

export function saveUserName(name) {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
}

export function loadUserName() {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
}

export function clearUserData() {
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.USER_NAME);
}