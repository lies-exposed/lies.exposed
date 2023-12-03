import { type UUID } from "io-ts-types";

interface WithId {
  id: UUID;
}

export const TupleWithId = {
  of: <A extends WithId>(elem: A): [UUID, A] => [elem.id, elem],
};
