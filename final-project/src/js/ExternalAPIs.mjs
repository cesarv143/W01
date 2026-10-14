// js/ExternalAPIs.mjs

// 1. Weather API (Using a reliable alternative service instead of OpenWeatherMap)
export async function getCampingWeather(city = "Mexico City") {
  try {
    const response = await fetch(`https://wttr.in/${city}?format=j1`);
    if (!response.ok) throw new Error("Failed to fetch weather data");
    const data = await response.json();
    
    const current = data.current_condition[0];
    return {
      tempC: current.temp_C,
      condition: current.weatherDesc[0].value,
      location: city
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}

// 2. Currency Conversion API (Free tier Exchangerate-API)
export async function convertCurrency(amountInUSD, targetCurrency = "MXN") {
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/USD`);
    if (!response.ok) throw new Error("Failed to fetch currency rates");
    const data = await response.json();
    
    const rate = data.rates[targetCurrency];
    if (!rate) return amountInUSD;
    
    return (amountInUSD * rate).toFixed(2);
  } catch (error) {
    console.error("Error converting currency:", error);
    return amountInUSD;
  }
}

// js/ExternalAPIs.mjs

export async function convertCurrency(amountInUSD, targetCurrency = "MXN") {
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/USD`);
    if (!response.ok) throw new Error("Failed to fetch currency rates");
    const data = await response.json();
    
    const rate = data.rates[targetCurrency];
    if (!rate) return amountInUSD;
    
    return (amountInUSD * rate).toFixed(2);
  } catch (error) {
    console.error("Error converting currency:", error);
    return amountInUSD;
  }
}