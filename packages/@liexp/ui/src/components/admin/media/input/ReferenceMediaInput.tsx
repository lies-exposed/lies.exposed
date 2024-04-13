import { type Media, type MediaType } from "@liexp/shared/lib/io/http/Media.js";
import get from "lodash/get";
import React from "react";
import { Stack, Typography } from "../../../mui/index.js";
import {
  AutocompleteInput,
  FunctionField,
  Link,
  ReferenceInput,
  useRecordContext,
  type ReferenceInputProps,
} from "../../react-admin.js";

export const matchMediaSuggestions = (
  filterValue: string,
  choice: Media,
): boolean => {
  return (
    choice?.label?.toLowerCase().includes(filterValue.toLowerCase()) ??
    choice?.description?.toLowerCase().includes(filterValue.toLowerCase()) ??
    false
  );
};

export const MediaAutocompleteOptionText: React.FC = () => {
  const record = useRecordContext();
  return record?.id ? (
    <div style={{ display: "flex" }}>
      <img
        src={record.thumbnail}
        style={{ marginRight: 10, width: 100, height: 100 }}
      />
      <Typography>{record.label ?? record.description}</Typography>
    </div>
  ) : (
    <span>No media</span>
  );
};

const ReferenceMediaInput: React.FC<
  Omit<ReferenceInputProps, "children"> & {
    source: string;
    allowedTypes?: MediaType[];
    fullWidth?: boolean;
  }
> = ({ allowedTypes, ...props }) => {
  return (
    <Stack spacing={2} direction={"row"} alignItems={"center"}>
      <ReferenceInput
        {...props}
        reference="media"
        filter={{
          type: allowedTypes,
        }}
      >
        <AutocompleteInput
          fullWidth
          source="id"
          optionText={<MediaAutocompleteOptionText />}
          matchSuggestion={matchMediaSuggestions}
          inputText={(r) => r.label ?? r.description}
          filterToQuery={(q) => ({ q })}
        />
      </ReferenceInput>
      <FunctionField
        source={props.source}
        render={(record: any, source: any) => {
          const media = get(record, source);
          return record?.id && <Link to={`/media/${media}`}>Open Media</Link>;
        }}
      />
    </Stack>
  );
};

export default ReferenceMediaInput;
