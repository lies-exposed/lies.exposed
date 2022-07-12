import { Media, MediaType } from "@liexp/shared/io/http/Media";
import { Typography } from "@liexp/ui/components/mui";
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
): boolean => choice.description.includes(filterValue);

export const MediaAutocompleteOptionText: React.FC = () => {
  const record = useRecordContext();
  return record?.id ? (
    <div style={{ display: "flex" }}>
      <img
        src={record.thumbnail}
        style={{ marginRight: 10, width: 100, height: 100 }}
      />
      <Typography>{record.description}</Typography>
    </div>
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
