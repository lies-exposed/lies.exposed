import { MediaType } from "@econnessione/shared/io/http/Media";
import get from "lodash/get";
import { useRecordContext } from "ra-core";
import { FieldProps, ImageField, UrlField } from "ra-ui-materialui";
import * as React from "react";

interface MediaFieldProps extends FieldProps {
  type?: MediaType;
  source: string;
}

export const MediaField: React.FC<MediaFieldProps> = (props) => {
  const record = useRecordContext(props);
  const mediaType =
    record?.rawFile?.type ??
    record?.type ??
    props.type ??
    MediaType.types[0].value;
  const src = get(record, props.source);

  if (src === undefined) {
    return null;
  }

  switch (mediaType) {
    case MediaType.types[5].value:
      return <iframe src={src} style={{ maxWidth: 500, height: 300 }} />;
    case MediaType.types[4].value:
      return <UrlField {...props} target="_blank" />;
    case MediaType.types[3].value:
      return (
        <video
          controls={true}
          autoPlay={false}
          preload="none"
          style={{ maxWidth: 300 }}
        >
          <source src={src} />
        </video>
      );
    default:
      return <ImageField {...props} />;
  }
};
