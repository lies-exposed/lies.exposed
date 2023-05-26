import * as React from "react";
import {
  Datagrid,
  DateField,
  type RaRecord,
  ReferenceArrayField,
  type ReferenceFieldProps,
  TextField,
} from "react-admin";
import { Box } from "../../mui";
import { LinkArrayInput } from "../links/LinkArrayInput";
import { MediaField } from "../media/MediaField";

export const ReferenceLinkTab: React.FC<
  Omit<ReferenceFieldProps<RaRecord<string>>, 'reference'>
> = (props) => {
  const newLinksSource =
    props.source?.split(".").slice(0, -1).concat("newLinks").join(".") ??
    "newLinks";

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
