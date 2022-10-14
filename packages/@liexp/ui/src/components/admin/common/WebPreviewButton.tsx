import get from "lodash/get";
import has from "lodash/has";
import * as React from "react";
import { FieldProps, useRecordContext } from "react-admin";
import { Button } from "../../mui";

interface WebPreviewButtonProps extends FieldProps {
  resource: string;
  id?: string;
}

export const WebPreviewButton: React.FC<WebPreviewButtonProps> = (props) => {
  const { resource, source } = props;
  const record = useRecordContext();
  const id =
    props.id ??
    (source && record && has(record, source) ? get(record, source) : undefined);

  return (
    <Button
      color="secondary"
      variant="contained"
      size="small"
      style={{ marginRight: 10 }}
      onClick={() => {
        window.open(`${process.env.WEB_URL}/${resource}${id ? `/${id}` : ""}`, "_blank");
      }}
    >
      Open {resource}
    </Button>
  );
};
