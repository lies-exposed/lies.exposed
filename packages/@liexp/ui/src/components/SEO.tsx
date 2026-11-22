import * as React from "react";
import { HelmetProvider, Helmet, type MetaProps } from "react-helmet-async";
import { useConfiguration } from "../context/ConfigurationContext.js";

interface SEOProps {
  description?: string;
  lang?: string;
  meta?: MetaProps[];
  title: string;
  image?: string;
  urlPath: string;
}

const SEO: React.FC<SEOProps> = ({
  description = "",
  lang = "en",
  meta = [],
  title,
  image,
  urlPath,
}) => {
  const { site, ...conf } = useConfiguration();

  const metaDescription = description ?? site.siteMetadata.description;

  const baseMeta: MetaProps[] = [
    {
      name: `description`,
      content: metaDescription,
    },
    {
      property: "og:url",
      content: `${conf.publicUrl}${urlPath}`,
    },
    {
      property: `og:title`,
      content: title,
    },
    {
      property: `og:description`,
      content: metaDescription,
    },
    {
      property: `og:type`,
      content: `article`,
    },
    {
      property: "og:image",
      content: image ?? conf.platforms.web.defaultImage,
    },
    {
      name: `twitter:card`,
      content: `summary`,
    },
    {
      name: `twitter:creator`,
      content: site.siteMetadata.author,
    },
    {
      name: `twitter:title`,
      content: title,
    },
    {
      name: `twitter:description`,
      content: metaDescription,
    },
  ];

  return (
    <Helmet
      htmlAttributes={
        lang !== undefined
          ? {
              lang,
            }
          : undefined
      }
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      meta={[...baseMeta, ...meta]}
    />
  );
};

export default SEO;

export { Helmet, HelmetProvider };
