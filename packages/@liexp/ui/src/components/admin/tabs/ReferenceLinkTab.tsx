import * as React from "react";
import {
  Datagrid,
  DateField,
  type RaRecord,
  ReferenceArrayField,
  type ReferenceFieldProps,
  TextField,
} from "react-admin";
import { Box } from "../../mui/index.js";
import { LinkArrayInput } from "../links/LinkArrayInput.js";
import ReferenceArrayLinkInput from "../links/ReferenceArrayLinkInput.js";
import { MediaField } from "../media/MediaField.js";

export const ReferenceLinkTab: React.FC<
  Omit<ReferenceFieldProps<RaRecord<string>>, "reference" | "render">
> = ({ queryOptions, ...props }) => {
  const source = props.source ?? "links";
  const newLinksSource =
    props.source?.split(".").slice(0, -1).concat("newLinks").join(".") ??
    "newLinks";

  return (
    <Box width={"100%"}>
      <ReferenceArrayLinkInput label="links" source={source} />

      <LinkArrayInput
        label="new links"
        source={newLinksSource}
        fullWidth={true}
        defaultValue={[]}
      />

      <ReferenceArrayField {...props} reference="links">
        <Datagrid rowClick="edit" isRowSelectable={() => false}>
          <TextField source="id" />
          <MediaField
            source="image.thumbnail"
            type="image/jpeg"
            controls={false}
          />
          <TextField source="title" />
          <DateField source="publishDate" />
          <TextField source="url" />
        </Datagrid>
      </ReferenceArrayField>
    </Box>
  );
};
