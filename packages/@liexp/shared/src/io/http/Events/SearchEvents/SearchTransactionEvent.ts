import type * as t from "io-ts";
import { BySubject } from "../../Common/BySubject.js";
import * as Transaction from "../Transaction.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchTransactionEvent = SearchEventCodec(
  Transaction.Transaction,
  {
    from: BySubject,
    to: BySubject,
  },
);

export type SearchTransactionEvent = t.TypeOf<typeof SearchTransactionEvent>;
