import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type GeocodeProviderContext } from "../../context/index.js";
import { mockedContext } from "../../test/context.js";
import { fetchCoordinates } from "./fetchCoordinates.flow.js";

type FetchCoordinatesContext = GeocodeProviderContext;

describe(fetchCoordinates.name, () => {
  const appTest = {
    ctx: mockedContext<FetchCoordinatesContext>({
      geo: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return Point geometry when geocoding succeeds", async () => {
    const label = "Rome, Italy";
    const geocodeResult = {
      lon: "12.4964",
      lat: "41.9028",
    };

    appTest.ctx.geo.search.mockReturnValueOnce(fp.TE.right([geocodeResult]));

    const result = await pipe(fetchCoordinates(label)(appTest.ctx), throwTE);

    expect(appTest.ctx.geo.search).toHaveBeenCalledWith(label);
    expect(fp.O.isSome(result)).toBe(true);

    if (fp.O.isSome(result)) {
      expect(result.value).toEqual({
        type: "Point",
        coordinates: [12.4964, 41.9028],
      });
    }
  });

  it("should return None when geocoding returns empty results", async () => {
    const label = "Unknown Place XYZ";

    appTest.ctx.geo.search.mockReturnValueOnce(fp.TE.right([]));

    const result = await pipe(fetchCoordinates(label)(appTest.ctx), throwTE);

    expect(appTest.ctx.geo.search).toHaveBeenCalledWith(label);
    expect(fp.O.isNone(result)).toBe(true);
  });

  it("should use the first result when multiple geocode results are returned", async () => {
    const label = "Paris";
    const geocodeResults = [
      { lon: "2.3522", lat: "48.8566" }, // Paris, France
      { lon: "-75.1652", lat: "39.9526" }, // Paris, Texas (hypothetical)
    ];

    appTest.ctx.geo.search.mockReturnValueOnce(fp.TE.right(geocodeResults));

    const result = await pipe(fetchCoordinates(label)(appTest.ctx), throwTE);

    expect(fp.O.isSome(result)).toBe(true);

    if (fp.O.isSome(result)) {
      expect(result.value.coordinates).toEqual([2.3522, 48.8566]);
    }
  });

  it("should convert string coordinates to numbers", async () => {
    const label = "Test Location";
    const geocodeResult = {
      lon: "-122.4194",
      lat: "37.7749",
    };

    appTest.ctx.geo.search.mockReturnValueOnce(fp.TE.right([geocodeResult]));

    const result = await pipe(fetchCoordinates(label)(appTest.ctx), throwTE);

    if (fp.O.isSome(result)) {
      expect(typeof result.value.coordinates[0]).toBe("number");
      expect(typeof result.value.coordinates[1]).toBe("number");
      expect(result.value.coordinates[0]).toBe(-122.4194);
      expect(result.value.coordinates[1]).toBe(37.7749);
    }
  });
});
