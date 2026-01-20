import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Arbitrary } from "effect";
import type * as fc from "fast-check";

export const UUIDArb: fc.Arbitrary<UUID> = Arbitrary.make(UUID);
