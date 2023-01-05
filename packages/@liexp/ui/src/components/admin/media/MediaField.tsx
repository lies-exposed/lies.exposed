import { MediaType } from "@liexp/shared/io/http/Media";
import get from "lodash/get";
import * as React from "react";
import {
  FieldProps,
  ImageField,
  UrlField,
  useRecordContext,
} from "react-admin";
import ReactAudioPlayer from "react-audio-player";

interface MediaFieldProps extends FieldProps {
  type?: string;
  source: string;
  sourceType?: MediaType;
}

export const MediaField: React.FC<MediaFieldProps> = ({
  sourceType,
  ...props
}) => {
  const record = useRecordContext(props);
  const src = get(record, props.source);
  const type = props.type ? get(record, props.type) : undefined;

  if (src === undefined) {
    return null;
  }

  const mediaType =
    record?.rawFile?.type ??
    sourceType ??
    type ??
    (src.includes(".png")
      ? MediaType.types[2].value
      : record?.type ?? MediaType.types[0].value);

  switch (mediaType) {
    case MediaType.types[7].value:
      return <iframe src={src} style={{ maxWidth: 500, height: 300 }} />;
    case MediaType.types[6].value:
      return <UrlField {...props} target="_blank" />;
    case MediaType.types[5].value:
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
    case MediaType.types[4].value:
    case MediaType.types[3].value:
      return <ReactAudioPlayer src={src} />;
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
