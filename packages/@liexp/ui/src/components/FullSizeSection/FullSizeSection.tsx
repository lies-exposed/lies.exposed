import { isServer } from "@liexp/shared/lib/utils/isServer.js";
import * as React from "react";
import { throttle } from "throttle-debounce";
import { MainContent } from "../MainContent.js";

interface Viewport {
  width: number | string;
  height: number;
}

export interface FullSizeViewportProps {
  id: string;
  backgroundColor?: string;
  backgroundImage?: string;
  children: (viewport: Viewport) => React.ReactElement;
}

export const FullSizeViewport: React.FC<
  FullSizeViewportProps & { children: () => React.ReactElement }
> = (props) => {
  const { id, backgroundColor, backgroundImage, children } = props;
  const [{ width, height }, setPageSize] = React.useState({
    height: isServer() ? 800 : window.innerHeight,
    width: isServer() ? "100%" : window.innerWidth,
  });

  function updatePageSize(): void {
    setPageSize({
      height: window.innerHeight,
      width: window.innerWidth,
    });
  }

  React.useEffect(() => {
    updatePageSize();

    const resizeListener = throttle(100, updatePageSize);

    window.addEventListener("resize", resizeListener);

    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, [children?.toString()]);

  const bgColor = backgroundColor ?? "transparent";

  const bgImage =
    backgroundImage !== undefined ? `url(${backgroundImage})` : undefined;

  return (
    <div
      id={id}
      className="FullSizeSection"
      style={{
        width: "100%",
        height: "auto",
        minHeight: height,
        minWidth: "100%",
        backgroundColor: bgColor,
        backgroundImage: bgImage,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {children({ height, width })}
    </div>
  );
};

export const FullSizeSection: React.FC<
  Omit<React.PropsWithChildren<FullSizeViewportProps>, "contentWrapper">
> = ({ children, ...props }) => (
  <FullSizeViewport {...props}>
    {() => (
      <MainContent
        style={{
          backgroundColor:
            props.backgroundImage !== undefined
              ? "rgba(255, 255, 255, 0.8)"
              : "trasparent",
          width: "100%",
          paddingLeft: "30px",
          paddingRight: "30px",
        }}
      >
        {children}
      </MainContent>
    )}
  </FullSizeViewport>
);
