import { fc } from "@liexp/core/tests";

export const OptionArb = <T>(
  arb: fc.Arbitrary<T>
): fc.Arbitrary<T | undefined> => fc.oneof(fc.constant(undefined), arb);
