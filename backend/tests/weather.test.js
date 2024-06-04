const { describe, expect, test } = require("@jest/globals");
const { EPSILON } = require("../utils/test_utils");
const { getDiffHourly } = require("../utils/weather");

describe("ensure api's hourly value is correct", () => {
  test("today + 0 hours", () => {
    const date = new Date(Date.now());
    const diff = getDiffHourly(date);
    
    expect(diff).toBeCloseTo(0, EPSILON);
  });
  
  test("today + 12 hours", () => {
    const date = new Date(Date.now());
    const diff = getDiffHourly(date) + 12 * 60 * 60 * 1000;
    
    expect(diff).toBeCloseTo(12 * 60 * 60 * 1000, EPSILON);
  });

  test("out of bounds back", () => {
    const date = new Date(Date.now());
    const diff = getDiffHourly(date);

    const maxDate = date.getTime() + 
    
    expect(diff).toBeCloseTo(0, EPSILON);
  });

  test("out of bounds forward", () => {
    const date = new Date(Date.now());
    const diff = getDiffHourly(date);
    
    expect(diff).toBeCloseTo(0, EPSILON);
  });
});
