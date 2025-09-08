const axios = require('axios');
const prisma = require('../prismaClient');

const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

const getWeather = async (location) => {
    const now = new Date();
    
    // 1. Try to get data from the database cache
    const cachedEntry = await prisma.weatherCache.findUnique({
        where: { location },
    });

    // 2. If a valid, non-expired entry exists, return it
    if (cachedEntry && (now.getTime() - cachedEntry.lastFetched.getTime() < CACHE_TTL)) {
        console.log(`CACHE HIT: Returning cached weather for ${location}`);
        return cachedEntry.data;
    }
    
    console.log(`CACHE MISS: Fetching new weather data for ${location}`);

    // 3. If API key is missing, return dummy data and cache it
    if (!process.env.WEATHER_API_KEY || process.env.WEATHER_API_KEY === "your_openweathermap_api_key_here") {
        console.warn('Weather API key not configured. Caching dummy data.');
        const dummyData = { temp: 28, description: 'clear sky', icon: '01d', error: 'API key missing' };
        
        await prisma.weatherCache.upsert({
            where: { location },
            update: { data: dummyData, lastFetched: now },
            create: { location, data: dummyData, lastFetched: now },
        });
        return dummyData;
    }

    // 4. Fetch new data from the API
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location},IN&appid=${process.env.WEATHER_API_KEY}&units=metric`;
        const response = await axios.get(url);
        const data = {
            temp: response.data.main.temp,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
        };

        // 5. Store the new data in the database cache using upsert
        await prisma.weatherCache.upsert({
            where: { location },
            update: { data: data, lastFetched: now },
            create: { location, data: data, lastFetched: now },
        });

        return data;
    } catch (error) {
        console.error("Weather API Error:", error.message);
        // If the API fails, still return the old cached data if it exists, to avoid showing an error to the user
        if (cachedEntry) {
            console.warn(`API failed, returning stale cache for ${location}`);
            return cachedEntry.data;
        }
        return { error: 'Could not fetch weather data.' };
    }
};

module.exports = { getWeather };