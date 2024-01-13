import {
  ByActorId,
  ByGroupId,
} from "@liexp/shared/lib/io/http/Common/index.js";
import _ from "lodash";
import React from "react";
import {
  FormDataConsumer,
  SelectInput,
  TextInput,
  type ReferenceInputProps,
} from "react-admin";
import { Stack } from "../../../../mui/index.js";
import ReferenceActorInput from "../../../actors/ReferenceActorInput.js";
import ReferenceGroupInput from "../../../groups/ReferenceGroupInput.js";

const ReferenceBySubjectInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = ({ source, ...props }) => {
  return (
    <Stack direction={"row"} spacing={2}>
      <SelectInput
        {...props}
        source={`${source}.type`}
        choices={[ByActorId, ByGroupId]
          .map((t) => t.type.props.type.value)
          .map((v) => ({
            id: v,
            name: v,
          }))}
      />

      <FormDataConsumer {...props}>
        {({ formData, scopedFormData, getSource, ...rest }) => {
          const type = _.get(formData, `${source}.type`);
          if (type === "Actor") {
            return (
              <ReferenceActorInput
                {...props}
                {...rest}
                source={`${source}.id`}
              />
            );
          } else if (type === "Group") {
            return (
              <ReferenceGroupInput
                {...props}
                {...rest}
                source={`${source}.id`}
              />
            );
          }
          return (
            <TextInput
              source={source}
              defaultValue={"Select subject type"}
              disabled
            />
          );
        }}
      </FormDataConsumer>
    </Stack>
  );
};

export default ReferenceBySubjectInput;
