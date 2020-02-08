import React from "react"
import FlexView from "react-flexview"
import { Container, Section, Columns } from "../components/Common"
import { UnsplashCredit } from "../components/Common/UnspashCredit"
import { CountdownTimer } from "../components/CountdownTimer"
import Layout from "../components/Layout"
import SEO from "../components/SEO"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mainImage: string = require("../images/mika-baumeister-3R0MnV-2WqE-unsplash.jpg")

const IndexPage: React.FC = () => {
  return (
    <Layout>
      <SEO title="Home" />
      <FlexView
        grow={true}
        style={{
          backgroundImage: `url(${mainImage})`,
          backgroundSize: "100% auto",
          backgroundOrigin: "0 0",
          backgroundPosition: "cover",
        }}
      >
        <Container style={{ color: "white" }}>
          <Section>
            <Columns>
              <Columns.Column style={{ textAlign: "center" }}>
                <CountdownTimer />
                <div>{`* Secondi che ci rimangono per poter mantenere l'innalzamento della temperatura globale entro il 1.5ºC`}</div>
              </Columns.Column>
              <Columns.Column className="is-offset-10 is-two">
                <UnsplashCredit authorName="Mika Baumeister" />
              </Columns.Column>
            </Columns>
          </Section>
        </Container>
      </FlexView>
    </Layout>
  )
}

export default IndexPage
