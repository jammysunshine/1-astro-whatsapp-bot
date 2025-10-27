require('dotenv').config();
const { Client } = require('@googlemaps/google-maps-services-js');

const client = new Client({});
const API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyAe_4l1iSivi3EN2RA6LzdKn_Uc_w2zT8Q';

async function testGoogleMapsAPI() {
  try {
    const response = await client.geocode({
      params: {
        address: 'Delhi, India',
        key: API_KEY
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      console.log('Google Maps API Test Successful:', response.data.results[0].formatted_address);
    } else {
      console.log('API Test Failed: No results');
    }
  } catch (error) {
    console.error('API Test Failed:', error.response ? error.response.data : error.message);
  }
}

testGoogleMapsAPI();