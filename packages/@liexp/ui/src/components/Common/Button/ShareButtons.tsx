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
  const iconProps = {
    round: true,
    size: 24,
  };

  const buttonProps = {
    url: `${process.env.PUBLIC_URL}${urlPath}`,
    style: {
      marginRight: 10,
    },
  };
  return (
    <Box style={style}>
      <FacebookShareButton
        {...buttonProps}
        quote={message}
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
