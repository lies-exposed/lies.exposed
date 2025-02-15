import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as fc from "fast-check";

export const UUIDArb: fc.Arbitrary<UUID> = fc.uuidV(4) as fc.Arbitrary<UUID>;
