import * as React from "react"
import FlexView from "react-flexview"
import Slider from "react-slick"
import { UnsplashCredit } from "./Common/UnspashCredit"

interface Slide {
  imageURL: string
  authorName: string
  info: string
}

interface HomeSliderProps {
  height: number | string
  slides: Slide[]
}

export const HomeSlider: React.FC<HomeSliderProps> = props => {
  return (
    <Slider
      autoplay={true}
      autoplaySpeed={3000}
      arrows={false}
      infinite={true}
    >
      {props.slides.map(s => (
        <div key={s.imageURL}>
          <FlexView
            style={{
              background: `url(${s.imageURL})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              height: props.height,
            }}
            vAlignContent="bottom"
            hAlignContent="right"
          >
            <div style={{ padding: 10 }}>
              <UnsplashCredit authorName={s.authorName} />
            </div>
          </FlexView>
        </div>
      ))}
    </Slider>
  )
}
