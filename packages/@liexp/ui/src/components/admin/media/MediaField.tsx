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
      ? MediaType.members[2].Type
      : (record?.type ?? MediaType.members[0].Type));

  switch (mediaType) {
    case MediaType.members[7].Type:
      return <iframe src={src} style={{ maxWidth: 500, height: 300 }} />;
    case MediaType.members[6].Type:
      return <UrlField {...props} target="_blank" />;
    case MediaType.members[5].Type:
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
    case MediaType.members[4].Type:
    case MediaType.members[3].Type:
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
