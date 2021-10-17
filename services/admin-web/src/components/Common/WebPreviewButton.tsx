import { Button } from "@material-ui/core";
import get from "lodash/get";
import has from "lodash/has";
import { FieldProps } from "ra-ui-materialui";
import * as React from "react";

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
        window.open(
          `http://localhost:4000/index.html?path=${resource}${
            id ? `/${id}` : ""
          }`
        );
      }}
    >
      Go to {resource}/{id}
    </Button>
  );
};
