import React from "react";
import {
  BooleanField,
  Datagrid,
  FunctionField,
  ReferenceManyField,
  type RaRecord,
  type ReferenceManyFieldProps,
} from "react-admin";
import { EventIcon } from "../../Common/Icons";
import { Box } from "../../mui";
import { EventTitle } from "./titles/EventTitle";

const ReferenceManyEventField: React.FC<
  Omit<ReferenceManyFieldProps<RaRecord<string>>, "reference" | "children">
> = (props) => {
  return (
    <ReferenceManyField
      {...props}
      reference="events"
      filter={{ ...props.filter }}
    >
      <Datagrid rowClick="edit">
        <BooleanField source="draft" />
        <FunctionField
          render={(r: any) => {
            return (
              <Box>
                <EventIcon type={r.type} style={{ marginRight: 10 }} />
                <EventTitle record={r} />
              </Box>
            );
          }}
        />
      </Datagrid>
    </ReferenceManyField>
  );
};

export default ReferenceManyEventField;
