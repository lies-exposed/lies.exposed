import * as React from "react";
import {
  BooleanField,
  Datagrid,
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
> = ({ queryOptions, ...props }) => {
  return (
    <ReferenceManyField
      {...props}
      reference="events"
      filter={props.filter ? { ...props.filter } : undefined}
    >
      <Datagrid rowClick="edit" isRowSelectable={() => false}>
        <BooleanField source="draft" />
        <FunctionField
          render={(r: any) => {
            return (
              <Box>
                <EventIcon type={r.type} style={{ marginRight: 10 }} />
                <EventTitle record={r} source="payload.title" />
              </Box>
            );
          }}
        />
      </Datagrid>
    </ReferenceManyField>
  );
};

export default ReferenceManyEventField;
