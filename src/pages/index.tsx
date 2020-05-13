import { TimeToCO2BudgetLevelReach } from "@components/Counters/TimeToCO2BudgetLevelReach"
import { WorldPopulationCounter } from "@components/Counters/WorldPopulationCount"
import { HomeSlider } from "@components/HomeSlider"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { PageContentFileNode } from "@models/page"
import { FlexGridItem, FlexGrid } from "baseui/flex-grid"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"
import Helmet from "react-helmet"

/* eslint-disable @typescript-eslint/no-var-requires */
const firstImage: string = require("../../static/media/img/billy-clouse-781VLZjFR8g-unsplash.jpg")
const secondImage: string = require("../../static/media/img/jordan-beltran-AxdlcxaModc-unsplash.jpg")
const thirdImage: string = require("../../static/media/img/markus-spiske-ur3wTilBmjQ-unsplash.jpg")
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

interface Results {
  pageContent: PageContentFileNode
}

const IndexPage: React.FC = () => {
  const { pageContent }: Results = useStaticQuery(graphql`
    query IndexPage {
      pageContent: file(relativePath: { eq: "pages/index.md" }) {
        ...PageContentFileNode
      }
    }
  `)

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
              <TimeToCO2BudgetLevelReach message="Secondi che ci rimangono per poter mantenere l'innalzamento della temperatura globale entro il 1.5ºC" />
              <WorldPopulationCounter
                count={7000000000}
                label="World population"
              />
            </FlexGridItem>
          </FlexGrid>
        </FlexGridItem>
        <FlexGridItem padding="70px">
          <PageContent {...pageContent.childMarkdownRemark} />
        </FlexGridItem>
      </FlexGrid>
    </Layout>
  )
}

export default IndexPage
