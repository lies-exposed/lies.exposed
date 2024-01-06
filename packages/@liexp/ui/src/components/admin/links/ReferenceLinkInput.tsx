import { type Link } from "@liexp/shared/lib/io/http";
import { type Media } from "@liexp/shared/lib/io/http/Media";
import get from "lodash/get";
import React from "react";
import {
  AutocompleteInput,
  ReferenceInput,
  useRecordContext,
  type ReferenceInputProps,
  Button,
  useRedirect,
} from "react-admin";
import { Box, Typography } from "../../mui";

export const matchLinkSuggestions = (
  filterValue: string,
  choice: Media,
): boolean => {
  return (choice?.label ?? choice?.description ?? "No description")
    ?.toLowerCase()
    .includes(filterValue.toLowerCase());
};

export const LinkAutocompleteOptionText: React.FC = () => {
  const record = useRecordContext<Link.Link>();
  return record?.id ? (
    <div style={{ display: "flex" }}>
      <img
        src={record.image?.thumbnail}
        style={{ marginRight: 10, width: 100, height: 100 }}
      />
      <Typography>{record.title}</Typography>
    </div>
  ) : (
    <span>No link</span>
  );
};

const ReferenceLinkInput: React.FC<
  Omit<ReferenceInputProps, "children"> & {
    source: string;
    fullWidth?: boolean;
  }
> = ({ ...props }) => {
  const redirect = useRedirect();
  const record = useRecordContext();
  const value = get(record, props.source);

  return (
    <Box style={{ display: "flex" }}>
      <ReferenceInput {...props} reference="links">
        <AutocompleteInput
          fullWidth
          source="id"
          optionText={<LinkAutocompleteOptionText />}
          matchSuggestion={matchLinkSuggestions}
          inputText={(r) => r.title}
          filterToQuery={(q) => ({ q })}
        />
      </ReferenceInput>
      <Button
        label="Open URL"
        disabled={value?.length < 5}
        onClick={() => {
          redirect("edit", "links", value);
        }}
      />
    </Box>
  );
};

export default ReferenceLinkInput;
