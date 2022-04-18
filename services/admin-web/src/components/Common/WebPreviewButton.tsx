import { Button } from "@material-ui/core";
import get from "lodash/get";
import has from "lodash/has";
import { Identifier } from 'ra-core';
import { FieldProps } from "ra-ui-materialui";
import * as React from "react";

interface WebPreviewButtonProps extends FieldProps {
  resource: string;
  id?: Identifier
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
      onClick={() => {
        window.open(
          `${process.env.WEB_URL}/${resource}${
            id ? `/${id}` : ""
          }`
        );
      }}
    >
      Go to {resource}/{id}
    </Button>
  );
};
