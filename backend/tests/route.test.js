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

  test.only("getTimeAlongPath early point", async() => {
    const r = await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155
    );

    const t = route.getTimeAlongPath(-74.556541, 40.35287, JSON.stringify(r.path));
    expect(t).toBeDefined();
  })

  test.only("getTimeAlongPath later point", async() => {
    const r = await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155
    );

    const t = route.getTimeAlongPath(-74.55828, 40.332149, JSON.stringify(r.path));
    expect(t).toBeDefined();
  })

  test.only("getTimeAlongPath point not on path", async() => {
    const r = await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155
    );

    const t = () => route.getTimeAlongPath(74.55828, 40.332149, JSON.stringify(r.path));
    expect(t).toThrowError();
  })
});
