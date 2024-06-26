const { describe, test, expect } = require("@jest/globals");
const route = require("../utils/route");

describe("getRoute", () => {
  test("getRoute() random route", async () => {
    const r = await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155,
      "2024-06-17T23:55"
    );

    expect(r).toBeDefined();
  });

  test("getRoute() impossible route", async () => {
    const r = await route.getRoute(
      -74.864549,
      42.632477,
      74.551546,
      40.329155,
      "2024-06-17T23:55"
    );

    expect(r).toBeUndefined();
  });

  test("getTimeAlongPath() early point", async () => {
    await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155,
      "2024-06-17T23:55"
    );

    const t = route.getTimeOffsetAlongPath(-74.556541, 40.35287);
    expect(t).toBeDefined();
  });

  test("getTimeAlongPath() later point", async () => {
    await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155,
      "2024-06-17T23:55"
    );

    const t1 = route.getTimeOffsetAlongPath(-74.55828, 40.332149);
    const t2 = route.getTimeOffsetAlongPath(-74.556541, 40.35287);
    expect(t1).toBeGreaterThan(t2);
  });

  test("getTimeAlongPath() point not on path", async () => {
    await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155,
      "2024-06-17T23:55"
    );

    const t = route.getTimeOffsetAlongPath(74.55828, 40.332149);
    expect(t).toBeUndefined();
  });
});
