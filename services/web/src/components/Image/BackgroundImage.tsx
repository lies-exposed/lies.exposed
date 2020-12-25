import { Image } from "@econnessione/io";
import * as React from "react";

interface BackgroundImageProps {
  image: Image.ImageFileNode;
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
      backgroundImage: `url(${image})`
    }}
  />
);
