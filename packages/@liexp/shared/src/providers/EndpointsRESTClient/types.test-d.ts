import { assertType, test } from "vitest";
import { type Endpoints } from "../../endpoints/index.js";
import { type UUID } from "../../io/http/Common/index.js";
import { generateRandomColor } from "../../utils/colors.js";
import {
  type EndpointOutputType,
  type EndpointDataOutputType,
} from "./types.js";

test("Should return proper types for EndpointDataOutputType", () => {
  const encodedActor = {
    id: "1" as UUID,
    username: "johndoe",
    avatar: undefined,
    fullName: "John Doe",
    excerpt: null,
    body: null,
    memberIn: [],
    color: generateRandomColor(),
    bornOn: undefined,
    diedOn: undefined,
    death: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
  assertType<EndpointOutputType<typeof Endpoints.Actor.Get>>({
    data: encodedActor,
  });

  assertType<EndpointDataOutputType<typeof Endpoints.Actor.List>>([
    encodedActor,
  ]);
});
