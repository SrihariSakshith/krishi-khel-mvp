const axios = require('axios');

// In-memory cache with a TTL (Time To Live)
const weatherCache = new Map();
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

const getWeather = async (location) => {
    const now = Date.now();
    const cachedEntry = weatherCache.get(location);

    // If a valid, non-expired entry exists in the cache, return it.
    if (cachedEntry && (now - cachedEntry.timestamp < CACHE_TTL)) {
        console.log(`Returning cached weather for ${location}`);
        return cachedEntry.data;
    }
    
    console.log(`Fetching new weather data for ${location}`);

    if (!process.env.WEATHER_API_KEY || process.env.WEATHER_API_KEY === "your_openweathermap_api_key_here") {
        console.warn('Weather API key not configured. Returning dummy data.');
        const dummyData = { temp: 28, description: 'clear sky', icon: '01d', error: 'API key missing' };
        weatherCache.set(location, { timestamp: now, data: dummyData });
        return dummyData;
    }
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location},IN&appid=${process.env.WEATHER_API_KEY}&units=metric`;
        const response = await axios.get(url);
        const data = {
            temp: response.data.main.temp,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
        };

        // Store the new data in the cache
        weatherCache.set(location, { timestamp: now, data: data });

        return data;
    } catch (error) {
        console.error("Weather API Error:", error.message);
        return { error: 'Could not fetch weather data.' };
    }
};

module.exports = { getWeather };