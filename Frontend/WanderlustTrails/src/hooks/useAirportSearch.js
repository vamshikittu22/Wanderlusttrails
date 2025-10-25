// Path: Frontend/WanderlustTrails/src/hooks/useAirportSearch.js

import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const useAirportSearch = () => {
  const [loading, setLoading] = useState(false);
  const [airportsDatabase, setAirportsDatabase] = useState(null);
  const [loadingDatabase, setLoadingDatabase] = useState(false);
  const [error, setError] = useState(null);

  const loadAirportsDatabase = async () => {
    if (airportsDatabase) return;
    
    setLoadingDatabase(true);
    console.log('📥 Loading OurAirports database...');

    try {
      const response = await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const airportsMap = {};
          const icaoIndex = {};
          const cityIndex = {}; // ✅ NEW: Index by city name
          
          results.data.forEach(airport => {
            if (airport.ident && airport.ident.length === 4) {
              const icao = airport.ident.toUpperCase();
              
              const airportData = {
                icao: icao,
                iata: airport.iata_code || 'N/A',
                name: airport.name || 'Unknown',
                city: airport.municipality || 'Unknown',
                country: airport.iso_country || 'Unknown',
                latitude: parseFloat(airport.latitude_deg) || 0,
                longitude: parseFloat(airport.longitude_deg) || 0,
                elevation: parseInt(airport.elevation_ft) || 0,
                continent: airport.continent || 'Unknown',
                type: airport.type || 'Unknown',
                region: airport.iso_region || 'Unknown'
              };
              
              airportsMap[icao] = airportData;
              
              if (airport.iata_code && airport.iata_code.length === 3) {
                icaoIndex[airport.iata_code.toUpperCase()] = icao;
              }
              
              // ✅ NEW: Index by city name for search
              const cityKey = airportData.city.toLowerCase();
              if (!cityIndex[cityKey]) {
                cityIndex[cityKey] = [];
              }
              cityIndex[cityKey].push(airportData);
            }
          });
          
          setAirportsDatabase({ airportsMap, icaoIndex, cityIndex });
          setLoadingDatabase(false);
          console.log(`✅ Loaded ${Object.keys(airportsMap).length} airports`);
        },
        error: (error) => {
          console.error('❌ Failed to parse CSV:', error);
          setLoadingDatabase(false);
          setError('Failed to load airports database');
        }
      });
    } catch (err) {
      console.error('❌ Failed to fetch airports database:', err);
      setLoadingDatabase(false);
      setError('Failed to download airports database');
    }
  };

  const searchByCode = async (code) => {
    if (!code || (code.length !== 3 && code.length !== 4)) {
      setError('Please enter a valid 3-letter IATA or 4-letter ICAO code');
      return null;
    }

    if (!airportsDatabase) {
      await loadAirportsDatabase();
    }

    let waitCount = 0;
    while (loadingDatabase && waitCount < 100) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitCount++;
    }

    if (!airportsDatabase) {
      setError('Failed to load airports database');
      return null;
    }

    setLoading(true);
    setError(null);

    const upperCode = code.toUpperCase();
    let icaoCode = upperCode;

    if (upperCode.length === 3) {
      icaoCode = airportsDatabase.icaoIndex[upperCode];
      if (!icaoCode) {
        setError(`Airport not found with IATA code: ${upperCode}`);
        setLoading(false);
        return null;
      }
      console.log(`🔄 Converted IATA ${upperCode} to ICAO ${icaoCode}`);
    }

    const airport = airportsDatabase.airportsMap[icaoCode];

    if (airport) {
      setLoading(false);
      return airport;
    } else {
      setError(`Airport not found with ICAO code: ${icaoCode}`);
      setLoading(false);
      return null;
    }
  };

  /**
   * ✅ NEW: Search airports by city name
   * Returns array of matching airports
   * 
   * @param {string} searchTerm - City name to search for
   * @param {number} maxResults - Maximum number of results to return
   * @returns {Promise<Array>} - Array of matching airports
   */
  const searchByCity = async (searchTerm, maxResults = 10) => {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    if (!airportsDatabase) {
      await loadAirportsDatabase();
    }

    let waitCount = 0;
    while (loadingDatabase && waitCount < 100) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitCount++;
    }

    if (!airportsDatabase) {
      return [];
    }

    setLoading(true);

    const searchLower = searchTerm.toLowerCase();
    const results = [];
    const seenCities = new Set();

    // Search through all airports
    for (const icao in airportsDatabase.airportsMap) {
      const airport = airportsDatabase.airportsMap[icao];
      
      // Match by city name or airport name
      const cityMatch = airport.city.toLowerCase().includes(searchLower);
      const nameMatch = airport.name.toLowerCase().includes(searchLower);
      
      if (cityMatch || nameMatch) {
        // Prioritize large and medium airports
        const isPrimaryAirport = ['large_airport', 'medium_airport'].includes(airport.type);
        
        // Avoid duplicate cities (prefer airports with IATA codes)
        const cityKey = `${airport.city}-${airport.country}`;
        if (!seenCities.has(cityKey) || airport.iata !== 'N/A') {
          if (isPrimaryAirport || results.length < maxResults / 2) {
            results.push(airport);
            seenCities.add(cityKey);
          }
        }
        
        if (results.length >= maxResults) break;
      }
    }

    // Sort results: prioritize exact city matches and airports with IATA codes
    results.sort((a, b) => {
      const aExact = a.city.toLowerCase() === searchLower;
      const bExact = b.city.toLowerCase() === searchLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      const aHasIATA = a.iata !== 'N/A';
      const bHasIATA = b.iata !== 'N/A';
      if (aHasIATA && !bHasIATA) return -1;
      if (!aHasIATA && bHasIATA) return 1;
      
      return 0;
    });

    setLoading(false);
    return results.slice(0, maxResults);
  };

  useEffect(() => {
    loadAirportsDatabase();
  }, []);

  return {
    searchByCode,
    searchByCity, // ✅ NEW: Export city search function
    loading,
    loadingDatabase,
    error,
    databaseReady: !!airportsDatabase
  };
};

export default useAirportSearch;
