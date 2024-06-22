## Technologies Stack
<strong>Technologies used: </strong>
- <strong>React:</strong> Front-end development
- <strong>JavaScript:</strong> Language for server
- <strong>Express:</strong> Library used to create the server according to the REST API standards
- <strong>Jest:</strong> Framework for unit tests
- <strong>Axios:</strong> Library to call APIs from both the front end and the server
- <strong>MapBox:</strong> Maps API to display the map on the front end and get directions on the server
- <strong>Open-Meteo:</strong> Weather API to get weather data

### Front end:
The front end is a React application that uses `axios` for data retrieval. The core components of this application are the interactive map and the sidebar. Upon receiving user input, a `GET` request is sent to the server to fetch a `GeoJSON` object from the MapBox API. Once the route data is obtained, the application retrieves and displays markers along the route with their corresponding data.

When a user clicks on the route, a `GET` request is made to the backend to fetch weather data for that specific point, which is then displayed in a popup on the map. Similarly, when the user switches between different marker overlay options, a request is sent to retrieve the relevant data, and the markers are re-rendered accordingly.

### Server:
The server contains three main controllers: geocode, route, and weather.

<strong>Geocode controller:</strong> a simple controller that returns the name of a city/location for a given longitude and latitude. It utilizes MapBox's reverse geocoding functionality, which returns information about a certain longitude and latitude.

<strong>Route controller:</strong> a controller that does three things: 

1. Retrieves data for displaying a route using MapBox's directions API.
2. Obtains display markers based on heuristics and assumptions about driving, placing markers roughly every 90 miles with a minimum of 5 markers.
3. Calculates the time it takes to reach a certain point along the route using the `turf` library. By analyzing the geometry line segments returned by MapBox, it computes the total duration to the point of interest.

<strong>Weather controller:</strong>
This controller fetches weather data for a specific time along the route using Open-Meteo's API. To get intra-hour data, it uses linear interpolation between hours. Additionally, it computes a weather score using a normalization algorithm and heuristics to ensure that safe-range values do not impact the score, while dangerous-range values have a significant effect.

## Installation and Usage
1. Clone this repository
2. Install the required dependencies
    - In the root of the repository and `./backend`, run `npm i`
3. In the root of the repository and `./backend`, rename the `.env.example` file to `.env`
4. Change the values inside of the new `.env` file with your API keys and port selection
5. Run `npm run start` or `npm run dev` in the root of the repository and `./backend`
