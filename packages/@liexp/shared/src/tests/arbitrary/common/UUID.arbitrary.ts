import { fc } from "@liexp/test";
import { type UUID } from "../../../io/http/Common/UUID.js";

export const UUIDArb: fc.Arbitrary<UUID> = fc.uuidV(4) as fc.Arbitrary<UUID>;
