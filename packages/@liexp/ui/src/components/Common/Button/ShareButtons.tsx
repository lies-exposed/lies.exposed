import * as React from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  TelegramIcon,
  TelegramShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { useConfiguration } from "../../../context/ConfigurationContext.js";
import { Box } from "../../mui/index.js";

interface ShareButtonsProps {
  urlPath: string;
  title: string;
  message: string;
  keywords: string[];
  style?: React.CSSProperties;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  urlPath,
  title,
  message,
  keywords,
  style,
}) => {
  const conf = useConfiguration();
  const iconProps = {
    round: true,
    size: 24,
  };

  const buttonProps = {
    url: `${conf.publicUrl}${urlPath}`,
    style: {
      marginRight: 10,
    },
  };
  return (
    <Box style={style}>
      <FacebookShareButton
        {...buttonProps}
        title={title}
        content={message}
        hashtag={keywords.map((k) => `#${k}`).join(" ")}
      >
        <FacebookIcon {...iconProps} />
      </FacebookShareButton>
      <WhatsappShareButton {...buttonProps} title={title}>
        <WhatsappIcon {...iconProps} />
      </WhatsappShareButton>
      <TelegramShareButton {...buttonProps} title={title}>
        <TelegramIcon {...iconProps} />
      </TelegramShareButton>
      <EmailShareButton {...buttonProps} title={title}>
        <EmailIcon {...iconProps} />
      </EmailShareButton>
    </Box>
  );
};
