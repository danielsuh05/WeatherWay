const { describe, test, expect } = require("@jest/globals");
const route = require("../utils/route");

describe("getRoute", () => {
  test.only("random route", async () => {
    const r = await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155
    );

    expect(r).toBeDefined();
  });

  test("impossible route", async () => {
    const r = await route.getRoute(-74.864549, 42.632477, 74.551546, 40.329155);

    expect(r).toBeUndefined();
  });

  test.only("get time along path normal", async() => {
    const r = await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155
    );

    const t = route.getTimeAlongPath(-74.867341, 42.635203, JSON.stringify(r.path));
    expect(t).toBeDefined();
  })
});
