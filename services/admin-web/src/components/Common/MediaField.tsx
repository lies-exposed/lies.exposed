import { MediaType } from "@liexp/shared/io/http/Media";
import get from "lodash/get";
import * as React from "react";
import {
  FieldProps,
  ImageField,
  UrlField,
  useRecordContext,
} from "react-admin";

interface MediaFieldProps extends FieldProps {
  type?: MediaType;
  source: string;
}

export const MediaField: React.FC<MediaFieldProps> = (props) => {
  const record = useRecordContext(props);
  console.log(record);
  const src = get(record, props.source);

  if (src === undefined) {
    return null;
  }

  const mediaType =
    record?.rawFile?.type ??
    props.type ??
    (src.includes(".png")
      ? MediaType.types[2].value
      : record?.type ?? MediaType.types[0].value);

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
      return (
        <ImageField
          {...props}
          src={src}
          sx={() => ({
            "& .RaImageField-image": {
              maxWidth: 300,
            },
          })}
        />
      );
  }
};
