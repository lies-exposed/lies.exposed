import { Box } from "@liexp/ui/components/mui";
import * as React from "react";
import {
  Datagrid,
  DateField,
  FieldProps, ReferenceArrayField,
  TextField,
} from "react-admin";
import { LinkArrayInput } from "../Common/LinkArrayInput";
import { MediaField } from '../Common/MediaField';

export const ReferenceLinkTab: React.FC<FieldProps> = (props) => {
  const newLinksSource = props.source
    .split(".")
    .slice(0, -1)
    .concat("newLinks")
    .join(".");

  return (
    <Box>
      <LinkArrayInput
        label="new links"
        source={newLinksSource}
        fullWidth={true}
        defaultValue={[]}
      />

      <ReferenceArrayField {...props} reference="links" fullWidth>
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <MediaField source="image.thumbnail" type="image/jpeg" />
          <TextField source="title" />
          <DateField source="publishDate" />
          <TextField source="url" />
        </Datagrid>
      </ReferenceArrayField>
    </Box>
  );
};
