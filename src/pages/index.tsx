import { FlexGridItem, FlexGrid } from "baseui/flex-grid"
import React from "react"
import Helmet from "react-helmet"
import { CountdownTimer } from "../components/CountdownTimer"
import { HomeSlider } from "../components/HomeSlider"
import Layout from "../components/Layout"
import SEO from "../components/SEO"

/* eslint-disable @typescript-eslint/no-var-requires */
const firstImage: string = require("../images/billy-clouse-781VLZjFR8g-unsplash.jpg")
const secondImage: string = require("../images/jordan-beltran-AxdlcxaModc-unsplash.jpg")
const thirdImage: string = require("../images/markus-spiske-ur3wTilBmjQ-unsplash.jpg")
/* eslint-enable @typescript-eslint/no-var-requires */

const slides = [
  {
    authorName: "Billy Clouse",
    imageURL: firstImage,
    info: "Bingham Canyon Mine, Salt Lake City, Utah, United States",
  },
  {
    authorName: "Jordan Beltran",
    imageURL: secondImage,
    info: "Av Pachacutec, Villa EL Salvador 15816, Peru, Villa EL Salvador",
  },
  {
    authorName: "Markus Spiske",
    imageURL: thirdImage,
    info: "Lorenzer Platz, Nuremberg, Bavaria, Germany",
  },
]

const IndexPage: React.FC = () => {
  return (
    <Layout>
      <Helmet>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
        />
      </Helmet>
      <SEO title="Home" />
      <FlexGrid width="100%" flexGridColumnCount={1}>
        <FlexGridItem position="relative">
          <div>
            <HomeSlider slides={slides} height={600} />
          </div>
          <FlexGrid position={"absolute"} top={0} left={0} right={0} bottom={0}>
            <FlexGridItem
              alignSelf="center"
              justifyContent="center"
              alignContent="center"
              flexDirection="column"
              position="relative"
            >
              <CountdownTimer message="Secondi che ci rimangono per poter mantenere l'innalzamento della temperatura globale entro il 1.5ºC" />
            </FlexGridItem>
          </FlexGrid>
        </FlexGridItem>
      </FlexGrid>
    </Layout>
  )
}

export default IndexPage
