const supertest = require("supertest");
const { test, describe } = require("@jest/globals");
const app = require("../app");

const api = supertest(app);

describe("route API", () => {
  test("route is returned as json", async () => {
    await api
      .get("/api/route/path/-74.864549&42.632477&-74.551546&40.329155&2024-06-17T23:55")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("invalid route returns 400", async () => {
    await api
      .get("/api/route/path/74.864549&42.632477&-74.551546&40.329155&2024-06-17T23:55")
      .expect(400);
  });
  
  test("markers is returned as json", async () => {
    await api
      .get("/api/route/markers")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
  
  test("start time offset works", async () => {
    await api
      .get("/api/route/timeoffset/-74.864549&42.632477")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("destination time offset works", async () => {
    await api
      .get("/api/route/timeoffset/-74.864549&42.632477")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("invalid time offset returns 400", async () => {
    await api
      .get("/api/route/timeoffset/74.864549&42.632477")
      .expect(400);
  });
});
