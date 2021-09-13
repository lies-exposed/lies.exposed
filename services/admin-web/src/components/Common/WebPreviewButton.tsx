import { Button } from "@material-ui/core";
import { get, has } from "lodash";
import { FieldProps } from "ra-ui-materialui";
import React from "react";

interface WebPreviewButtonProps extends FieldProps {
  resource: string;
}

export const WebPreviewButton: React.FC<WebPreviewButtonProps> = (props) => {
  const { resource, source, record } = props;
  // console.log({ resource, source, record });
  const id =
    source && record && has(record, source) ? get(record, source) : undefined;

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={() => {
        window.open(`http://localhost:4000/${resource}${id ? `/${id}` : ""}`);
      }}
    >
      Go to {resource}/{id}
    </Button>
  );
};
