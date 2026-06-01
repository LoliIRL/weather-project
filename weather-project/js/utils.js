export function validateUserName(name) {
    if(!name || name.trim().length === 0) {
        return { valid: false, message: 'Имя не может быть пустым' };
    }
    if(name.length > 30) {
        return { valid: false, message: 'Имя не должно превышать 30 символов' };
    }
    if(/[<>'"/\\]/.test(name)) {
        return { valid: false, message: 'Имя содержит недопустимые символы' };
    }
    return { valid: true, message: '' };
}

export function validateCityName(city) {
    if(!city || city.trim().length === 0) {
        return { valid: false, message: 'Введите название города' };
    }
    return { valid: true, message: '' };
}