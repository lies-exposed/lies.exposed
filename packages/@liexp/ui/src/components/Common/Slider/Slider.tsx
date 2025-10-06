import { importDefault } from "@liexp/core/lib/esm/import-default.js";
import { clsx } from "clsx";
import * as React from "react";
import _SlickSlider, { type Settings } from "react-slick";
import { styled, useTheme } from "../../../theme/index.js";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const PREFIX = "Slider";

const classes = {
  root: `${PREFIX}-root`,
  mediaSliderDownMD: `${PREFIX}-mediaSliderDownMD`,
  item: `${PREFIX}-item`,
};

const SlickSlider = importDefault(_SlickSlider).default;

const StyledSlickSlider = styled(SlickSlider)(({ theme }) => ({
  [`.${classes.root}`]: {
    margin: 0,
    width: "100%",
    maxHeight: "100%",
    [`&.${classes.mediaSliderDownMD}`]: {
      width: "100%",
      "& > .slick-list > .slick-track": {
        margin: 0,
      },
    },
    "& .slick-prev:before": {
      color: theme.palette.common.black,
    },
    "& .slick-next:before": {
      color: theme.palette.common.black,
    },
  },
}));

export interface SliderProps extends Settings {
  maxHeight?: number;
  style?: React.CSSProperties;
}

export const Slider: React.FC<SliderProps> = ({
  maxHeight: _maxHeight = 400,
  className,
  children,
  ...props
}) => {
  const theme = useTheme();

  return (
    <StyledSlickSlider
      className={clsx(classes.root, className)}
      adaptiveHeight={true}
      infinite={false}
      arrows={true}
      draggable={true}
      centerMode={true}
      dots={true}
      centerPadding="20px"
      slidesToShow={1}
      slidesPerRow={1}
      lazyLoad="progressive"
      responsive={[
        {
          breakpoint: theme.breakpoints.values.md,
          settings: {
            ...props,
            className: clsx(classes.root, className, classes.mediaSliderDownMD),
            centerPadding: "0px",
          },
        },
      ]}
      {...props}
    >
      {children}
    </StyledSlickSlider>
  );
};
