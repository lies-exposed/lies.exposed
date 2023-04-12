import { ByActor, ByGroup } from "@liexp/shared/lib/io/http/Common";
import _ from "lodash";
import React from "react";
import { FormDataConsumer, type ReferenceInputProps, SelectInput } from "react-admin";
import { Box } from "../../mui";
import ReferenceActorInput from "../actors/ReferenceActorInput";
import ReferenceGroupInput from "../groups/ReferenceGroupInput";

const ReferenceBySubjectInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = ({ source, ...props }) => {
  return (
    <Box>
      <SelectInput
        {...props}
        source={`${source}.type`}
        choices={[ByActor, ByGroup]
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
          return "Select subject type";
        }}
      </FormDataConsumer>
    </Box>
  );
};

export default ReferenceBySubjectInput;
