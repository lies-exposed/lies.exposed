import * as React from "react";

interface ProjectImageProps {
  alt: string;
  isTablet: boolean;
  style?: React.CSSProperties;
  image: string;
}

export const Image: React.FC<ProjectImageProps> = ({ alt, image, style }) => (
  <img style={style} alt={alt} src={image} />
);
