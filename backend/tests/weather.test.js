const { describe, test, expect } = require("@jest/globals");
const { getWeatherAtPointTime } = require("../utils/weather");
const { DateTime } = require("luxon");

describe("getWeatherAtPointTime", () => {
  test("getWeatherAtPointTime test 00:00", async () => {
    // TODO MAKE THESE DYNAMIC SO THAT IF ROUTE CHANGES I DON'T HAVE TO REDO ALL
    const date = DateTime.now();
    const weather = await getWeatherAtPointTime(-75.143966, 42.260483, date);

    expect(weather).toBeDefined();
  });
  
  test("getWeatherAtPointTime test impossible", async () => {
    const date = DateTime.now().plus({hours: 2349234});
    const weather = await getWeatherAtPointTime(-75.143966, 42.260483, date);

    expect(weather).toBeUndefined();
  });

  test("getWeatherAtPointTime test interpolate", async () => {
    const date = DateTime.now().plus({seconds: 10000});
    const weather = await getWeatherAtPointTime(-75.143966, 42.260483, date);

    expect(weather).toBeDefined();
  });
  
  test("getWeatherAtPointTime test later", async () => {
    const date = DateTime.now().plus({hours: 3});
    const weather = await getWeatherAtPointTime(-75.143966, 42.260483, date);

    expect(weather).toBeDefined();
  });
});
