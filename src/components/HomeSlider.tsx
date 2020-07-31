import * as React from "react"
import Slider from "react-slick"
import { UnsplashCredit } from "./UnspashCredit"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"

interface Slide {
  imageURL: string
  authorName: string
  info: string
}

interface HomeSliderProps {
  height: number
  slides: Slide[]
}

export const HomeSlider: React.FC<HomeSliderProps> = (props) => {
  const height = `${props.height}px`;
  return (
    <Slider autoplay={true} autoplaySpeed={3000} arrows={false} infinite={true}>
      {props.slides.map((s) => (
        <FlexGrid
          key={s.imageURL}
          overrides={{
            Block: {
              style: {
                height,
              },
            },
          }}
        >
          <FlexGridItem
            overrides={{
              Block: {
                style: {
                  backgroundImage: `url(${s.imageURL})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  height,
                },
              },
            }}
          >
            <div style={{ padding: 10 }}>
              <UnsplashCredit authorName={s.authorName} />
            </div>
          </FlexGridItem>
        </FlexGrid>
      ))}
    </Slider>
  )
}
