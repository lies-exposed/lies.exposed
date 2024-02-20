import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useConfiguration } from "../context/ConfigurationContext";

interface SEOProps {
  description?: string;
  lang?: string;
  meta?: any[];
  title: string;
  image?: string;
  urlPath: string;
}

const SEO: React.FC<SEOProps> = ({
  description,
  lang,
  meta = [],
  title,
  image,
  urlPath,
}) => {
  const { site, ...conf } = useConfiguration();

  const metaDescription = description ?? site.siteMetadata.description;

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
      meta={[
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
      ].concat(meta)}
    />
  );
};

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
};

export default SEO;

export { Helmet, HelmetProvider };
