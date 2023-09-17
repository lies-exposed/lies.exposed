import React from "react";
import {
  BooleanField,
  Datagrid,
  FunctionField,
  ReferenceArrayField,
  type ReferenceArrayFieldProps,
} from "react-admin";
import { EventIcon } from '../../Common/Icons';
import { Box } from '../../mui';
import { EventTitle } from './titles/EventTitle';

const ReferenceArrayEventField: React.FC<
  Omit<ReferenceArrayFieldProps, "reference" | "children"> & { source: string }
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
          return (
            <Box>
              <EventIcon type={r.type} style={{ marginRight: 10 }} />
              <EventTitle record={r} />
            </Box>
          );
        }}
      />
    </Datagrid>
  </ReferenceArrayField>
);

export default ReferenceArrayEventField;
