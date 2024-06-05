const { describe, test, expect } = require("@jest/globals");
const { getWeatherAtPointTime } = require("../utils/weather");
const dayjs = require("dayjs")

describe("getWeatherAtPointTime", () => {
  test("", async () => {
    let weather = await getWeatherAtPointTime(41.4995, -81.6954, dayjs().format("YYYY-MM-DDTHH:[00]"));
    expect(weather).toBeDefined();
  });
});
