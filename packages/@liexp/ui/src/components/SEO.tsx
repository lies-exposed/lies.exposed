import { importDefault } from "@liexp/core/lib/esm/import-default.js";
import * as React from "react";
import * as HelmetAsync from "react-helmet-async";
import { useConfiguration } from "../context/ConfigurationContext.js";

// TODO: avoid using importDefault
// console.log({ HelmetAsync });
const { Helmet, HelmetProvider } = importDefault<any>(HelmetAsync).default ?? {
  Helmet: () => <div />,
  HelmetProvider: ({ children }: any) => <>{children}</>,
};

// console.log({ Helmet, HelmetProvider });

interface SEOProps {
  description?: string;
  lang?: string;
  meta?: any[];
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

export default SEO;

export { Helmet, HelmetProvider };
