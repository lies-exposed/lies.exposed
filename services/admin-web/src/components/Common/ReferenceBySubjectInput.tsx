import { ByActor, ByGroup } from "@liexp/shared/io/http/Common";
import { Box } from "@material-ui/core";
import _ from "lodash";
import { FormDataConsumer } from "ra-core";
import { ReferenceInputProps, SelectInput } from "ra-ui-materialui";
import React from "react";
import ReferenceActorInput from "./ReferenceActorInput";
import ReferenceGroupInput from "./ReferenceGroupInput";

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
