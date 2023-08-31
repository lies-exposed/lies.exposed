import { TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost";
import React from "react";
import {
  Datagrid,
  type DatagridProps,
  DateField,
  FunctionField,
  Link,
  NumberField,
  TextField,
} from "../react-admin";

export const SocialPostDataGrid: React.FC<DatagridProps> = (props) => {
  return (
    <Datagrid
      rowClick="edit"
      rowSx={(record) => ({
        borderLeft: `5px solid ${
          TO_PUBLISH.is(record.status) ? "orange" : "transparent"
        }`,
      })}
      {...props}
    >
      <TextField source="type" />
      <FunctionField
        source="content.title"
        onClick={(e: any) => {
          e.preventDefault();
        }}
        render={(r: any) => (
          <Link to={`/${r.type}/${r.entity}`}>{r.content?.title}</Link>
        )}
      />
      <TextField source="status" />
      <NumberField source="publishCount" />
      <DateField showTime source="scheduledAt" />
      <DateField source="createdAt" />
    </Datagrid>
  );
};
