import { http } from "@liexp/shared/lib/io";
import * as React from "react";
import { type FieldProps, useRecordContext } from "../../react-admin";
import { BookTitle } from "./BookTitle";
import { DeathEventTitle } from "./DeathEventTitle";
import { DocumentaryReleaseTitle } from "./DocumentaryReleaseTitle";
import { PatentEventTitle } from "./PatentEventTitle";
import { QuoteTitle } from "./QuoteTitle";
import { ScientificStudyEventTitle } from "./ScientificStudyEventTitle";
import { TransactionTitle } from "./TransactionTitle";
import { UncategorizedEventTitle } from "./UncategorizedEventTitle";

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
