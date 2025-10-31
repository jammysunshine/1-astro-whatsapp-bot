const vedicServices = require('./vedic');
const westernServices = require('./western');
const commonServices = require('./common');

module.exports = {
  vedic: vedicServices,
  western: westernServices,
  common: commonServices
};