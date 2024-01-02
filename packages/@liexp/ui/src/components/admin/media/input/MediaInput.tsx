import { MediaType } from "@liexp/shared/lib/io/http/Media";
import { get } from "lodash";
import * as React from "react";
import { Box, Stack } from "../../../mui";
import {
  FileInput,
  FormDataConsumer,
  SelectInput,
  TextInput,
  type InputProps,
  Button,
} from "../../react-admin";
import { MediaField } from "../MediaField";

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
  const types = supportedTypes ?? MediaType.types.map((a) => a.value);
  const [editMode, setEditMode] = React.useState(showInputOnClick);

  const handleClickOnField = showInputOnClick
    ? (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditMode(!editMode);
      }
    : undefined;

  // console.log({ type, sourceType, sourceLocation });
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
        {({ formData, scopedFormData, getSource, ...rest }) => {
          const mediaType = formData[sourceLocation]?.rawFile?.type;
          const typeSource = get(formData, getSource?.(_type) ?? _type);
          const showInput = showInputOnClick ? editMode : false;

          const mediaSrc = get(formData, sourceLocation)?.src;

          if (typeSource === "fromFile") {
            return (
              <Box>
                <FileInput
                  {...props}
                  source={sourceLocation}
                  accept={types.map((a) => `.${a.split("/")[1]}`).join(",")}
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
                  choices={MediaType.types.map((v) => ({
                    id: v.value,
                    name: v.value,
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
