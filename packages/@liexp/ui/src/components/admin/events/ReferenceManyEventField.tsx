import * as React from "react";
import {
  BooleanField,
  Datagrid,
  DateField,
  FunctionField,
  ReferenceManyField,
  type RaRecord,
  type ReferenceManyFieldProps,
} from "react-admin";
import { EventIcon } from "../../Common/Icons/index.js";
import { Box } from "../../mui/index.js";
import { EventTitle } from "./titles/EventTitle.js";

const ReferenceManyEventField: React.FC<
  Omit<ReferenceManyFieldProps<RaRecord<string>>, "reference" | "children">
> = ({ queryOptions: _queryOptions, ...props }) => {
  return (
    <ReferenceManyField
      {...props}
      reference="events"
      filter={props.filter ? { ...props.filter } : undefined}
    >
      <Datagrid rowClick="edit" isRowSelectable={() => false}>
        <BooleanField source="draft" />
        <FunctionField
          label="title"
          render={(r) => {
            return (
              <Box>
                <EventIcon type={r.type} style={{ marginRight: 10 }} />
                <EventTitle record={r} source="payload.title" />
              </Box>
            );
          }}
        />
        <DateField source="date" />
      </Datagrid>
    </ReferenceManyField>
  );
};

export default ReferenceManyEventField;
