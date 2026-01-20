import { BySubjectId } from "@liexp/io/lib/http/Common/BySubject.js";
import { Arbitrary } from "effect";
import type * as fc from "fast-check";

export const BySubjectIdArb: fc.Arbitrary<BySubjectId> =
  Arbitrary.make(BySubjectId);
