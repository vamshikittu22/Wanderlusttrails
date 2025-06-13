// path: Wanderlusttrails/Frontend/WanderlustTrails/src/hooks/useCurrencyInfo.js

import { useEffect, useState } from "react";

// Hook to fetch real-time currency exchange data
function useCurrencyInfo(currency){
    const [data, setData] = useState({}); // Store currency conversion rates

    useEffect(() => {
      // Fetch currency conversion data from public API
      fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currency}.json`)
      .then((res) => res.json()) // Parse response as JSON
      .then((res) => setData(res[currency])) // Extract specific currency data
    }, [currency]); // Re-fetch if currency changes

    console.log(data); // For debugging
    return data; // Return currency conversion data
}

export default useCurrencyInfo;
