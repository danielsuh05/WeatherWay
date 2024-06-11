const supertest = require("supertest");
const { test, describe } = require("@jest/globals");
const app = require("../app");

const api = supertest(app);

describe("route API", () => {
  test("location is returned", async () => {
    await api
      .get("/api/geocode/-74.864549&42.632477")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
});
