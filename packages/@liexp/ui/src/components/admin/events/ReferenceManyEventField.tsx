import * as io from "@liexp/shared/lib/io";
import React from "react";
import {
  BooleanField,
  Datagrid,
  FunctionField,
  type RaRecord,
  ReferenceManyField,
  type ReferenceManyFieldProps,
} from "react-admin";

const ReferenceManyEventField: React.FC<
  Omit<ReferenceManyFieldProps<RaRecord<string>>, "reference" | "children"> & {
    source: string;
  }
> = (props) => (
  <ReferenceManyField
    {...props}
    reference="events"
    filter={{ withDrafts: true }}
  >
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <FunctionField
        render={(r: any) => {
          switch (r.type) {
            case io.http.Events.EventTypes.DEATH.value:
              return `${r.type}: ${r.payload.victim}`;
            default:
              return `${r.type}: ${r.payload.title}`;
          }
        }}
      />
    </Datagrid>
  </ReferenceManyField>
);

export default ReferenceManyEventField;
