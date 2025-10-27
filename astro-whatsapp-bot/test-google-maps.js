require('dotenv').config();
const { Client } = require('@googlemaps/google-maps-services-js');

const client = new Client({});
const API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyAe_4l1iSivi3EN2RA6LzdKn_Uc_w2zT8Q';

async function testGoogleMapsAPI() {
  try {
    // Test Geocoding
    console.log('Testing Geocoding API...');
    const geoResponse = await client.geocode({
      params: {
        address: 'Delhi, India',
        key: API_KEY
      }
    });

    if (geoResponse.data.results && geoResponse.data.results.length > 0) {
      console.log('Geocoding API Test Successful:', geoResponse.data.results[0].formatted_address);
      const location = geoResponse.data.results[0].geometry.location;

      // Test Time Zone API
      console.log('Testing Time Zone API...');
      const tzResponse = await client.timezone({
        params: {
          location: { lat: location.lat, lng: location.lng },
          timestamp: Math.floor(Date.now() / 1000),
          key: API_KEY
        }
      });

      console.log('Time Zone API Test Successful:', tzResponse.data);
    } else {
      console.log('Geocoding API Test Failed: No results');
    }
  } catch (error) {
    console.error('API Test Failed:', error.response ? error.response.data : error.message);
  }
}

testGoogleMapsAPI();