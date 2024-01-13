import { useState, useEffect } from "react";

interface WindowsDimensions {
  width: string | number;
  height: number;
}

function getWindowDimensions(): WindowsDimensions {
  if (typeof window !== "undefined") {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }
  return {
    width: "100%",
    height: 1600,
  };
}

export default function useWindowDimensions({
  onResize,
}: {
  onResize?: (dimensions: WindowsDimensions) => void;
}): WindowsDimensions {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize(): void {
      const dimensions = getWindowDimensions();
      setWindowDimensions(dimensions);
      onResize?.(dimensions);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowDimensions;
}
