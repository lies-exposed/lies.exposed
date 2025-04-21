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
      ? MediaType.members[2].literals[0]
      : (record?.type ?? MediaType.members[0].literals[0]));

  switch (mediaType) {
    case MediaType.members[7].literals[0]:
      return <iframe src={src} style={{ maxWidth: 500, height: 300 }} />;
    case MediaType.members[6].literals[0]:
      return <UrlField {...props} target="_blank" />;
    case MediaType.members[5].literals[0]:
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
    case MediaType.members[4].literals[0]:
    case MediaType.members[3].literals[0]:
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
