import { fp } from "@liexp/core/lib/fp/index.js";
import { assertType, describe, expectTypeOf, it } from "vitest";
import { Endpoints } from "../../endpoints/api/index.js";
import { toAPIError } from "../../io/http/Error/APIError.js";
import { toTERequest } from "./api.provider.js";

describe("ApiProvider", () => {
  it("Should have proper types", () => {
    expectTypeOf(toTERequest(Endpoints.Actor.Get)).toMatchObjectType(
      // @ts-expect-error TODO fix this
      (params, query) => {
        assertType<string>(params);
        assertType(query);

        return () =>
          Promise.resolve(fp.E.left(toAPIError(new Error("Not implemented"))));
      },
    );
  });
});
