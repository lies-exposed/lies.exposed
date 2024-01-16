import { http } from "@liexp/shared/lib/io/index.js";
import * as React from "react";
import { type FieldProps, useRecordContext } from "../../react-admin.js";
import { BookTitle } from "./BookTitle.js";
import { DeathEventTitle } from "./DeathEventTitle.js";
import { DocumentaryReleaseTitle } from "./DocumentaryReleaseTitle.js";
import { PatentEventTitle } from "./PatentEventTitle.js";
import { QuoteTitle } from "./QuoteTitle.js";
import { ScientificStudyEventTitle } from "./ScientificStudyEventTitle.js";
import { TransactionTitle } from "./TransactionTitle.js";
import { UncategorizedEventTitle } from "./UncategorizedEventTitle.js";

export const EventTitle: React.FC<FieldProps<http.Events.Event>> = ({
  record: _record,
}) => {
  const record = _record ?? useRecordContext<http.Events.Event>();
  if (record?.payload) {
    switch (record.type) {
      case http.Events.EventTypes.UNCATEGORIZED.value:
        return <UncategorizedEventTitle record={record} />;
      case http.Events.EventTypes.SCIENTIFIC_STUDY.value:
        return <ScientificStudyEventTitle record={record} />;
      case http.Events.EventTypes.DEATH.value:
        return <DeathEventTitle record={record} />;
      case http.Events.EventTypes.PATENT.value:
        return <PatentEventTitle record={record} />;
      case http.Events.EventTypes.DOCUMENTARY.value:
        return <DocumentaryReleaseTitle record={record} />;
      case http.Events.EventTypes.TRANSACTION.value:
        return <TransactionTitle record={record} />;
      case http.Events.EventTypes.QUOTE.value:
        return <QuoteTitle record={record} />;
      case http.Events.EventTypes.BOOK.value:
        return <BookTitle record={record} />;
    }
  }
  return <span>No record</span>;
};
