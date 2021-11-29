import { MediaType } from "@econnessione/shared/io/http/Media";
import { toUndefined } from "fp-ts/lib/Option";
import get from "lodash/get";
import has from "lodash/has";
import { useRecordContext } from "ra-core";
import { FieldProps, ImageField, UrlField } from "ra-ui-materialui";
import * as React from "react";

interface MediaFieldProps extends FieldProps {
  type?: MediaType;
  source: string;
}

export const MediaField: React.FC<MediaFieldProps> = (props) => {
  const record = useRecordContext(props);
  const mediaType = props.type ?? record?.type ?? MediaType.types[0].value;
  const src = get(record, props.source);

  if (src === undefined) {
    return null;
  }

  switch (mediaType) {
    case MediaType.types[2].value:
      return <video controls={true} autoPlay={false} src={src} />;
    case MediaType.types[3].value:
      return <UrlField {...props} />;
    default:
      return <ImageField {...props} />;
  }
};
