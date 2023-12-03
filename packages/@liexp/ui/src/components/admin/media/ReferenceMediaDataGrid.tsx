import * as React from "react";
import {
  ReferenceArrayField,
  type RaRecord,
  type ReferenceArrayFieldProps,
} from "react-admin";
import { MediaDataGrid } from "./MediaList";

export const ReferenceMediaDataGrid: React.FC<
  Omit<ReferenceArrayFieldProps<RaRecord<string>>, "children" | "reference">
> = (props) => {
  return (
    <ReferenceArrayField<RaRecord<string>>
      {...props}
      source={props.source ?? "media"}
      reference="media"
      sortBy="updatedAt"
      sortByOrder="DESC"
      fullWidth={true}
    >
      <MediaDataGrid />
    </ReferenceArrayField>
  );
};
