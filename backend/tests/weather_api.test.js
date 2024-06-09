const supertest = require("supertest");
const { test, describe } = require("@jest/globals");
const { DateTime } = require("luxon");
const app = require("../app");

const api = supertest(app);

describe("weather API", () => {
  test("00:00", async () => {
    const date = DateTime.now().toFormat("yyyy-MM-dd'T'HH:'00'");

    await api
      .get(`/api/weather/-74.0060&40.7128&${date}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("97:00 throws 202", async () => {
    const date = DateTime.now().toFormat("yyyy-MM-dd'T''97:00'");

    await api
      .get(`/api/weather/-74.0060&40.7128&${date}`)
      .expect(202);
  });

  test("00:00", async () => {
    const date = DateTime.now().toFormat("yyyy-MM-dd'T'HH:'00'");

    await api
      .get(`/api/weather/-74.0060&40.7128&${date}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
});
