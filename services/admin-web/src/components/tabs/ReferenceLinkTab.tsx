import { Box } from "@mui/material";
import * as React from "react";
import {
  Datagrid,
  DateField,
  FieldProps,
  ReferenceArrayField,
  TextField,
  useRecordContext,
} from "react-admin";
import { LinkArrayInput } from "../Common/LinkArrayInput";

export const ReferenceLinkTab: React.FC<FieldProps> = (props) => {
  const record = useRecordContext();
  const newLinksSource = props.source
    .split(".")
    .slice(0, -1)
    .concat("newLinks")
    .join(".");

  return (
    <Box>
      <LinkArrayInput
        {...{ record }}
        label="new links"
        source={newLinksSource}
        fullWidth={true}
        defaultValue={[]}
      />

      <ReferenceArrayField {...props} reference="links" fullWidth>
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="title" />
          <DateField source="publishDate" />
          <TextField source="url" />
        </Datagrid>
      </ReferenceArrayField>
    </Box>
  );
};
