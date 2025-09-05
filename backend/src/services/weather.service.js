const axios = require('axios');

const getWeather = async (location) => {
    if (!process.env.WEATHER_API_KEY) {
        return { error: 'Weather API key not configured.' };
    }
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location},IN&appid=${process.env.WEATHER_API_KEY}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;
        return {
            temp: data.main.temp,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
        };
    } catch (error) {
        console.error("Weather API Error:", error.message);
        return { error: 'Could not fetch weather data.' };
    }
};

module.exports = { getWeather };