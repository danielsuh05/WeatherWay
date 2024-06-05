const { describe, expect, test } = require("@jest/globals");
const { MILLISECOND_EPSILON } = require("../utils/test_utils");
const { getDiffHourly, getHourlyJSONTime } = require("../utils/weather");
const dayjs = require("dayjs");

describe("ensure api's hourly value is correct", () => {
  test("today + 0 hours", () => {
    const diff = getDiffHourly(dayjs());
    
    expect(diff).toBeCloseTo(0, MILLISECOND_EPSILON);
  });
  
  test("today + 12 hours", () => {
    const date = dayjs(new Date()).add(12, 'hours');
    const diff = getDiffHourly(date);
    
    expect(diff).toBeCloseTo(12 * 60 * 60 * 1000, MILLISECOND_EPSILON);
  });

  test("getHourlyJSON current time", () => {
    getHourlyJSONTime(dayjs().unix());
  })
});
