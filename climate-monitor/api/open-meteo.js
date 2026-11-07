const climateCache = new Map();
const OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_HISTORY = "https://archive-api.open-meteo.com/v1/archive";
const REPORT_YEAR = 2026;
const GLOBAL_WARMING_PER_DECADE = 0.20;

function average(values) {
    const valid = values.filter(v => Number.isFinite(v));
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
}

async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);
    return response.json();
}

async function fetchClimateData(city) {
    if (climateCache.has(city.id)) return climateCache.get(city.id);

    const today = new Date();
    const safeEnd = new Date(today);
    safeEnd.setDate(safeEnd.getDate() - 5);

    const currentYearEnd = safeEnd.getFullYear() === REPORT_YEAR
        ? safeEnd.toISOString().slice(0, 10)
        : `${REPORT_YEAR}-12-31`;

    const pastYear = REPORT_YEAR - 20;
    const future20Year = REPORT_YEAR + 20;

    const currentParams = new URLSearchParams({
        latitude: city.lat,
        longitude: city.lon,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
        daily: "temperature_2m_max,temperature_2m_min,temperature_2m_mean,weather_code",
        forecast_days: "7",
        timezone: "auto",
        temperature_unit: "celsius",
        wind_speed_unit: "kmh"
    });

    const currentYearParams = new URLSearchParams({
        latitude: city.lat,
        longitude: city.lon,
        start_date: `${REPORT_YEAR}-01-01`,
        end_date: currentYearEnd,
        daily: "temperature_2m_mean",
        timezone: "auto",
        temperature_unit: "celsius"
    });

    const pastParams = new URLSearchParams({
        latitude: city.lat,
        longitude: city.lon,
        start_date: `${pastYear}-01-01`,
        end_date: `${pastYear}-12-31`,
        daily: "temperature_2m_mean",
        timezone: "auto",
        temperature_unit: "celsius"
    });

    const [current, currentYear, past] = await Promise.all([
        fetchJSON(`${OPEN_METEO_FORECAST}?${currentParams}`),
        fetchJSON(`${OPEN_METEO_HISTORY}?${currentYearParams}`),
        fetchJSON(`${OPEN_METEO_HISTORY}?${pastParams}`)
    ]);

    const currentYearMean = average(currentYear.daily?.temperature_2m_mean || []);
    const pastMean = average(past.daily?.temperature_2m_mean || []);
    const future20Mean = Number.isFinite(currentYearMean)
        ? currentYearMean + (GLOBAL_WARMING_PER_DECADE * 2)
        : null;

    const result = {
        current: current.current?.temperature_2m,
        apparent: current.current?.apparent_temperature,
        humidity: current.current?.relative_humidity_2m,
        precipitation: current.current?.precipitation,
        wind: current.current?.wind_speed_10m,
        weatherCode: current.current?.weather_code,
        forecast: {
            time: current.daily?.time || [],
            max: current.daily?.temperature_2m_max || [],
            min: current.daily?.temperature_2m_min || [],
            mean: current.daily?.temperature_2m_mean || [],
            weatherCode: current.daily?.weather_code || []
        },
        currentYearAverage: currentYearMean,
        past: pastMean,
        warmingPerDecade: GLOBAL_WARMING_PER_DECADE,
        future20: future20Mean,
        reportYear: REPORT_YEAR,
        pastYear,
        future20Year,
        updatedAt: current.current?.time
    };

    climateCache.set(city.id, result);
    return result;
}
