const logger = require('utils/logger');

const NodeGeocoder = require('node-geocoder');
const { Client } = require('@googlemaps/google-maps-services-js');

// Initialize Geocoder (using OpenStreetMap for simplicity, can be configured for Google Maps if API key is available)
const geocoderOptions = {
  provider: 'openstreetmap', // Can be 'google', 'here', etc.
  // apiKey: process.env.GOOGLE_MAPS_API_KEY, // Uncomment if using Google Maps Geocoding
  formatter: null // 'gpx', 'string', ...
};
const geocoder = NodeGeocoder(geocoderOptions);

// Initialize Google Maps Services Client for Time Zone API
const googleMapsClient = new Client({});

// Ensure Google Maps API Key is set for Time Zone API
const { GOOGLE_MAPS_API_KEY } = process.env;
if (!GOOGLE_MAPS_API_KEY) {
  logger.warn('⚠️ GOOGLE_MAPS_API_KEY is not set. Time Zone API functionality may be limited.');
}

/**
 * Geocoding and Timezone Service
 * Handles location coordinates and timezone calculations
 */
class GeocodingService {
  /**
   * Get coordinates for a place using NodeGeocoder
   * @param {string} place - Place name (City, Country)
   * @returns {Promise<Array>} [latitude, longitude]
   */
  async getCoordinatesForPlace(place) {
    // Validate and sanitize input
    if (!place || typeof place !== 'string') {
      logger.warn(`Invalid place input for geocoding: ${place}`);
      return [28.6139, 77.209]; // Default to Delhi, India
    }

    // Limit length to prevent potential abuse
    if (place.length > 200) {
      logger.warn(`Place input too long for geocoding: ${place.substring(0, 50)}...`);
      place = place.substring(0, 200);
    }

    // Basic sanitization to remove potentially harmful characters
    // Allow only alphanumeric characters, spaces, commas, hyphens, and periods
    const sanitizedPlace = place.replace(/[^\w\s\-,.'`]/g, '').trim();
    
    if (!sanitizedPlace) {
      logger.warn(`Empty or invalid place after sanitization: ${place}`);
      return [28.6139, 77.209]; // Default to Delhi, India
    }

    try {
      const res = await geocoder.geocode(sanitizedPlace);
      if (res && res.length > 0) {
        return [res[0].latitude, res[0].longitude];
      }
    } catch (error) {
      logger.error(`❌ Error geocoding place "${sanitizedPlace}":`, error.message);
    }
    // Fallback to default if geocoding fails
    return [28.6139, 77.209]; // Default to Delhi, India
  }

  /**
   * Get timezone for a place using Google Maps Time Zone API
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timestamp - Unix timestamp of the event
   * @returns {Promise<number>} UTC offset in hours
   */
  async getTimezoneForPlace(latitude, longitude, timestamp) {
    if (!GOOGLE_MAPS_API_KEY) {
      logger.warn('GOOGLE_MAPS_API_KEY is not set. Using default timezone offset (IST).');
      return 5.5; // Default to IST offset
    }

    try {
      const response = await googleMapsClient.timezone({
        params: {
          location: { lat: latitude, lng: longitude },
          timestamp: timestamp / 1000, // Google API expects seconds
          key: GOOGLE_MAPS_API_KEY
        },
        timeout: 1000 // milliseconds
      });

      if (response.data.status === 'OK') {
        const { rawOffset } = response.data; // Offset in seconds from UTC
        const { dstOffset } = response.data; // Daylight saving offset in seconds
        return (rawOffset + dstOffset) / 3600; // Convert to hours
      } else {
        logger.error('Google Maps Time Zone API error:', response.data.errorMessage);
      }
    } catch (error) {
      logger.error('❌ Error fetching timezone from Google Maps API:', error.message);
    }
    // Fallback to default if API call fails
    return 5.5; // Default to IST offset
  }

  /**
   * Get location info including coordinates and timezone
   * @param {string} place - Place name
   * @param {number} timestamp - Unix timestamp
   * @returns {Promise<Object>} Location info with lat, lng, timezone
   */
  async getLocationInfo(place, timestamp = Date.now()) {
    const [latitude, longitude] = await this.getCoordinatesForPlace(place);
    const timezone = await this.getTimezoneForPlace(latitude, longitude, timestamp);

    return {
      latitude,
      longitude,
      timezone,
      place
    };
  }
}

module.exports = GeocodingService;
