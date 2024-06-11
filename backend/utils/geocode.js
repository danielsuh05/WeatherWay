require("dotenv").config();

const baseURL = "https://api.mapbox.com/search/geocode/v6/reverse?types=place&";


/**
 * Gets the name of the city/state/country for a respective (longitude, latitude)
 * @param {number} long longitude to reverse geocode for
 * @param {number} lat latitude to reverse geocode for
 * @returns {string} the name of the location
 */
let reverseGeocode = async (long, lat) => {
  const url = baseURL + `longitude=${long}&latitude=${lat}&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
  const location = await fetch(url)
  .then((response) => {
    if (response.ok) {
      return response.json();
    }
    console.log("Error getting data from weather API");
    return;
  })
  .then((responseJSON) => {
    return responseJSON.features[0].properties.full_address;
  });

  return location;
}

module.exports = {
  reverseGeocode
}