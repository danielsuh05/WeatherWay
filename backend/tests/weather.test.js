const { describe, test, expect } = require("@jest/globals");
const { getWeatherAtPointTime } = require("../utils/weather");
const { DateTime } = require("luxon");

describe("getWeatherAtPointTime", () => {
  test("getWeatherAtPointTime test 00:00", async () => {
    const date = DateTime.now().toFormat("yyyy-MM-dd'T'HH:'00'");
    const weather = await getWeatherAtPointTime(-74.0060, 40.7128, date);

    expect(weather).toBeDefined();
  });
  
  test("getWeatherAtPointTime test 97:00", async () => {
    const date = DateTime.now().toFormat("yyyy-MM-dd'T''97':'00'");
    const weather = await getWeatherAtPointTime(-74.0060, 40.7128, date);

    expect(weather).toBeUndefined();
  });
  
  test("getWeatherAtPointTime test 23:00", async () => {
    const date = DateTime.now().toFormat("yyyy-MM-dd'T''23':'00'");
    const weather = await getWeatherAtPointTime(-74.0060, 40.7128, date);

    expect(weather).toBeDefined();
  });
});
