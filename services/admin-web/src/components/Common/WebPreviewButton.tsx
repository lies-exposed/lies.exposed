import { Button } from "@mui/material";
import get from "lodash/get";
import has from "lodash/has";
import { FieldProps } from "react-admin";
import * as React from "react";

interface WebPreviewButtonProps extends FieldProps {
  resource: string;
  id?: string;
}

export const WebPreviewButton: React.FC<WebPreviewButtonProps> = (props) => {
  const { resource, source, record } = props;
  // console.log({ resource, source, record });
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
        window.open(`${process.env.WEB_URL}/${resource}${id ? `/${id}` : ""}`);
      }}
    >
      Open {resource}
    </Button>
  );
};
