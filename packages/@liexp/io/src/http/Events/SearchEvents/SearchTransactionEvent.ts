import { BySubject } from "../../Common/BySubject.js";
import * as Transaction from "../Transaction.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchTransactionEvent = SearchEventCodec(
  Transaction.Transaction.fields,
  {
    from: BySubject,
    to: BySubject,
  },
);

export type SearchTransactionEvent = typeof SearchTransactionEvent.Type;
