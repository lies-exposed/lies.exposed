import { MediaType } from "@liexp/shared/lib/io/http/Media/index.js";
import get from "lodash/get";
import * as React from "react";
import { Box, Stack } from "../../../mui/index.js";
import {
  FileInput,
  FormDataConsumer,
  SelectInput,
  TextInput,
  type InputProps,
  Button,
} from "../../react-admin.js";
import { MediaField } from "../MediaField.js";

interface MediaInputProps extends Omit<InputProps, "source"> {
  type?: "fromURL" | "fromFile";
  supportedTypes?: MediaType[];
  source?: string;
  style?: React.CSSProperties;
  sourceType?: string;
  sourceLocation?: string;
  showInputOnClick?: boolean;
}

export const MediaInput: React.FC<MediaInputProps> = ({
  sourceType = "type",
  sourceLocation = "location",
  type: _type = "_type",
  supportedTypes,
  source,
  style,
  showInputOnClick = false,
  ...props
}) => {
  const types = supportedTypes ?? MediaType.members.map((a) => a.literals[0]);
  const [editMode, setEditMode] = React.useState(showInputOnClick);

  const handleClickOnField = showInputOnClick
    ? (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditMode(!editMode);
      }
    : undefined;

  return (
    <Stack spacing={2} marginBottom={2} style={style}>
      <SelectInput
        source={_type}
        defaultValue={"fromURL"}
        choices={[
          { name: "fromURL", id: "fromURL" },
          {
            name: "fromFile",
            id: "fromFile",
          },
        ]}
      />
      <FormDataConsumer>
        {({ formData, scopedFormData, ...rest }) => {
          const mediaType = formData[sourceLocation]?.rawFile?.type;
          const typeSource = get(formData, _type);
          const showInput = showInputOnClick ? editMode : false;

          const mediaSrc = get(formData, sourceLocation)?.src;

          if (typeSource === "fromFile") {
            return (
              <Box>
                <FileInput
                  {...props}
                  source={sourceLocation}
                  accept={types.reduce(
                    (acc, a) => ({
                      ...acc,
                      [a]: `.${a.split("/")[1]}`,
                    }),
                    {},
                  )}
                >
                  <MediaField
                    source={sourceLocation}
                    type={sourceType}
                    controls={true}
                    record={{
                      ...formData,
                      [sourceLocation]: mediaSrc,
                    }}
                  />
                </FileInput>
              </Box>
            );
          }

          if (showInput) {
            return (
              <Box onClick={handleClickOnField}>
                <MediaField
                  source={sourceLocation}
                  type={sourceType}
                  controls={true}
                  {...props}
                />
              </Box>
            );
          }

          return (
            <Box>
              <Stack spacing={2} direction="row" alignItems="center">
                <TextInput source={sourceLocation} style={{ width: "80%" }} />
                <SelectInput
                  {...rest}
                  source={sourceType}
                  choices={MediaType.members.map((v) => ({
                    id: v.literals[0],
                    name: v.literals[0],
                  }))}
                  defaultValue={mediaType}
                />
              </Stack>
              {handleClickOnField ? (
                <Button
                  label="Update"
                  variant="contained"
                  size="small"
                  color="secondary"
                  onClick={handleClickOnField}
                />
              ) : null}
            </Box>
          );
        }}
      </FormDataConsumer>
    </Stack>
  );
};
