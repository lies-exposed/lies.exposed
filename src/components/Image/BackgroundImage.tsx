import { ImageFileNode } from "@models/Image";
import * as React from "react";

interface BackgroundImageProps {
  image: ImageFileNode;
  style?: React.CSSProperties
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({ image }) => (
  <div
    style={{
      display: "flex",
      backgroundPosition: "center",
      backgroundSize: "cover",
      height: '100%',
      width: "100%",
      backgroundImage: `url(${image.childImageSharp.fluid.src})`
    }}
  />
);
