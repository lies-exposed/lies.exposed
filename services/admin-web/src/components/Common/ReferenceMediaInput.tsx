import { Media, MediaType } from "@liexp/shared/io/http/Media";
import { Avatar } from "@liexp/ui/components/Common/Avatar";
import { Typography } from "@mui/material";
import React from "react";
import {
  AutocompleteInput,
  ReferenceInput,
  ReferenceInputProps,
  useRecordContext,
} from "react-admin";

export const matchMediaSuggestions = (
  filterValue: string,
  choice: Media
): boolean =>
  choice.description.includes(filterValue);

export const MediaAutocompleteOptionText: React.FC = () => {
  const record = useRecordContext();
  return record?.id ? (
    <>
      <Avatar src={record.thumbnail} style={{ marginRight: 10 }} />
      <Typography>{record.description}</Typography>
    </>
  ) : (
    <span>No media</span>
  );
};

const ReferenceMediaInput: React.FC<
  Omit<ReferenceInputProps, "children"> & {
    source: string;
    allowedTypes?: MediaType[];
  }
> = ({ allowedTypes, ...props }) => {
  return (
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
        inputText={(r) => r.description}
        filterToQuery={(name) => ({ name })}
      />
    </ReferenceInput>
  );
};

export default ReferenceMediaInput;
