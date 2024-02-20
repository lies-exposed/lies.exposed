import get from "lodash/get.js";
import has from "lodash/has.js";
import * as React from "react";
import { type FieldProps, useRecordContext } from "react-admin";
import { useConfiguration } from "../../../context/ConfigurationContext.js";
import { Button } from "../../mui/index.js";

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
  const conf = useConfiguration();

  return (
    <Button
      color="secondary"
      variant="contained"
      size="small"
      style={{ marginRight: 10 }}
      onClick={() => {
        window.open(
          `${conf.platforms.web.url}/${resource}${id ? `/${id}` : ""}`,
          "_blank",
        );
      }}
    >
      Open {resource}
    </Button>
  );
};
