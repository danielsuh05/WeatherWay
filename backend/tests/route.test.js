const { describe, test, expect } = require("@jest/globals");
const route = require("../utils/route");

describe("getRoute", () => {
  test("getRoute() random route", async () => {
    const r = await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155
    );

    expect(r).toBeDefined();
  });

  test("getRoute() impossible route", async () => {
    const r = async () => await route.getRoute(-74.864549, 42.632477, 74.551546, 40.329155);

    expect(r).rejects.toThrowError();
  });

  test("getTimeAlongPath() early point", async() => {
    const r = await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155
    );

    const t = route.getTimeOffsetAlongPath(-74.556541, 40.35287, JSON.stringify(r.path));
    expect(t).toBeDefined();
  })

  test("getTimeAlongPath() later point", async() => {
    const r = await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155
    );

    const t1 = route.getTimeOffsetAlongPath(-74.55828, 40.332149, JSON.stringify(r.path));
    const t2 = route.getTimeOffsetAlongPath(-74.556541, 40.35287, JSON.stringify(r.path));
    expect(t1).toBeGreaterThan(t2);
  })

  test("getTimeAlongPath() point not on path", async() => {
    // TODO: SERVER CRASHES BECAUSE IT THROWS ERROR
    const r = await route.getRoute(
      -74.864549,
      42.632477,
      -74.551546,
      40.329155
    );

    const t = () => route.getTimeOffsetAlongPath(74.55828, 40.332149, JSON.stringify(r.path));
    expect(t).toThrowError();
  })
});
