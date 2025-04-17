// filter-airports.js
const fs = require('fs');
const csv = require('csv-parse/sync');

const csvData = fs.readFileSync('airports.csv', 'utf8');
const airports = csv.parse(csvData, { columns: true, skip_empty_lines: true });

// Filter for large and medium airports with IATA codes
const filteredAirports = airports
  .filter(airport => 
    ['large_airport', 'medium_airport'].includes(airport.type) && 
    airport.iata_code && 
    airport.iata_code.length === 3 // Ensure valid IATA code
  )
  .map(airport => ({
    ident: airport.ident,
    type: airport.type,
    name: airport.name,
    latitude_deg: airport.latitude_deg,
    longitude_deg: airport.longitude_deg,
    elevation_ft: airport.elevation_ft,
    continent: airport.continent,
    iso_country: airport.iso_country,
    municipality: airport.municipality,
    iata_code: airport.iata_code
  }));

// Write to airports.json
fs.writeFileSync('airports.json', JSON.stringify(filteredAirports, null, 2));
console.log(`Filtered to ${filteredAirports.length} airports.`);