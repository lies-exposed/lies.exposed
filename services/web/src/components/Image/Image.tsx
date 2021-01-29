import * as io from "@econnessione/shared/lib/io/http";
import * as React from "react";

interface ProjectImageProps {
  alt: string;
  isTablet: boolean;
  style?: React.CSSProperties;
  image: io.Image.ImageFileNode;
}

export const Image: React.FC<ProjectImageProps> = ({ alt, image, style }) => (
  <img style={style} alt={alt} src={image} />
);
