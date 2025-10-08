import { type Media } from "@liexp/shared/lib/io/http/index.js";
import * as d3 from "d3";
import * as React from "react";
import type WaveformData from "waveform-data";
import { useTheme } from "../../theme/index.js";

interface WaveformThumbnailProps {
  media: Media.Media;
  height: number;
  width: number;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  onLoad?: () => void;
}

export const WaveformThumbnail: React.FC<WaveformThumbnailProps> = ({
  media: { id, location },
  height,
  width,
  onClick,
  style,
  onLoad: _onLoad,
}) => {
  const SVG_ID = `waveform-${id}`;
  const theme = useTheme();
  const [waveform, setWaveformData] = React.useState<WaveformData | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const audioContext = new AudioContext();

    fetch(location)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const options = {
          audio_context: audioContext,
          array_buffer: buffer,
          scale: 128,
        };

        return import("waveform-data").then(
          ({ default: WaveformData }) =>
            new Promise<WaveformData>((resolve, reject) => {
              WaveformData.createFromAudio(options, (err, waveform) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(waveform);
                }
              });
            }),
        );
      })
      .then((d) => {
        setWaveformData(d);
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(`Error while fetching ${location}`, e);
      });
  }, [location]);

  React.useEffect(() => {
    if (width === 0 || height === 0 || !waveform) {
      return;
    }

    const x = d3.scaleLinear();
    const y = d3.scaleLinear();
    const offsetX = height / 2;

    const channel = waveform.channel(0);
    const svg = d3
      .select(`#${SVG_ID}`)
      .html(null)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const min = channel.min_array();
    const max = channel.max_array();

    x.domain([0, waveform.length]).rangeRound([0, width]);
    y.domain([d3.min(min), d3.max(max) as any]).rangeRound([offsetX, -offsetX]);

    const area = d3
      .area()
      .x((d, i) => x(i))
      .y0((d, i) => y(min[i]))
      .y1((d) => y(d as any));

    svg
      .append("path")
      .datum(max)
      .attr("transform", () => `translate(0, ${offsetX})`)
      .attr("d", (d: any) => area(d))
      .attr("stroke", theme.palette.primary.main);
  }, [waveform, width, height]);

  return (
    <div
      id={SVG_ID}
      onClick={onClick}
      style={{
        width,
        height,
        ...style,
      }}
    />
  );
};
