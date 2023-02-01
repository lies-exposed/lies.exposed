import * as io from "@liexp/shared/io";
import React from "react";
import {
  BooleanField,
  Datagrid,
  FunctionField, ReferenceArrayField, type ReferenceArrayFieldProps,
} from "react-admin";

const ReferenceArrayEventField: React.FC<
  Omit<ReferenceArrayFieldProps, 'reference'| "children"> & { source: string }
> = (props) => (
  <ReferenceArrayField
    {...props}
    reference="events"
    filter={{ withDrafts: true }}
  >
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <FunctionField
        render={(r: any) => {
          switch (r.type) {
            case io.http.Events.Death.DEATH.value:
              return `${r.type}: ${r.payload.victim}`;
            default:
              return `${r.type}: ${r.payload.title}`;
          }
        } } />
    </Datagrid>
  </ReferenceArrayField>
);

export default ReferenceArrayEventField;
