import { MediaType } from "@liexp/shared/lib/io/http/Media/index.js";
import get from "lodash/get.js";
import * as React from "react";
import {
  type FieldProps,
  ImageField,
  UrlField,
  useRecordContext,
} from "react-admin";
import _ReactAudioPlayer from "react-audio-player";

const ReactAudioPlayer: any = _ReactAudioPlayer;

interface MediaFieldProps extends FieldProps {
  type?: string;
  source: string;
  sourceType?: MediaType;
  controls: boolean;
}

export const MediaField: React.FC<MediaFieldProps> = ({
  sourceType,
  controls,
  type: _type = "type",
  ...props
}) => {
  const record = useRecordContext(props);
  const src = get(record, props.source);
  const type = get(record, _type);

  if (src === undefined) {
    return null;
  }

  const mediaType =
    record?.rawFile?.type ??
    sourceType ??
    type ??
    (src?.includes(".png")
      ? MediaType.types[2].value
      : (record?.type ?? MediaType.types[0].value));

  switch (mediaType) {
    case MediaType.types[7].value:
      return <iframe src={src} style={{ maxWidth: 500, height: 300 }} />;
    case MediaType.types[6].value:
      return <UrlField {...props} target="_blank" />;
    case MediaType.types[5].value:
      return (
        <video
          controls={controls}
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
