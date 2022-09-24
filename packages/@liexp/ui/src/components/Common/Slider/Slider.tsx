import { clsx } from "clsx";
import * as React from "react";
import * as SlickSlider from "react-slick";
import { styled, useTheme } from "../../../theme";

const PREFIX = "Slider";

const classes = {
  mediaSlider: `${PREFIX}-mediaSlider`,
  mediaSliderDownMD: `${PREFIX}-mediaSliderDownMD`,
  item: `${PREFIX}-item`,
};

const StyledSlickSlider = styled(SlickSlider.default)(({ theme }) => ({
  [`.${classes.mediaSlider}`]: {
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

export interface SliderProps extends SlickSlider.Settings {
  maxHeight?: number;
  style?: React.CSSProperties;
}

export const Slider: React.FC<SliderProps> = ({
  maxHeight = 400,
  className,
  children,
  ...props
}) => {
  const theme = useTheme();

  return (
    <StyledSlickSlider
      className={clsx(classes.mediaSlider, className)}
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
            className: clsx(classes.mediaSlider, classes.mediaSliderDownMD),
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
