import * as React from "react";
import {
  ArrayField,
  type ArrayFieldProps,
  SingleFieldList,
  useRecordContext,
} from "react-admin";
import { ReferenceBySubjectField } from "./ReferenceBySubjectField";

interface ReferenceArrayBySubjectFieldProps extends ArrayFieldProps {
  source: string;
}

const ReferenceBySubjectFieldListItem: React.FC = () => {
  const record = useRecordContext();
  return <ReferenceBySubjectField record={record} />;
};

export const ReferenceArrayBySubjectField: React.FC<
  ReferenceArrayBySubjectFieldProps
> = ({ source, ...props }) => {
  return (
    <ArrayField {...props} source={source}>
      <SingleFieldList linkType={false}>
        <ReferenceBySubjectFieldListItem />
      </SingleFieldList>
    </ArrayField>
  );
};
