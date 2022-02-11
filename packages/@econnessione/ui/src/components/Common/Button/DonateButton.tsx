import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton, Typography } from "@material-ui/core";
import * as React from "react";

const DonateButton: React.FC = () => {
  return (
    <form action="https://www.paypal.com/donate" method="post" target="_top">
      <input type="hidden" name="hosted_button_id" value="BNAGL4D89LJDE" />
      <IconButton
        type="submit"
        disableFocusRipple={true}
        disableRipple={true}
        focusRipple={false}
      >
        <FontAwesomeIcon
          icon={"circle-dollar-to-slot"}
          style={{ marginRight: 10, color: "white" }}
        />
        <Typography
          display="inline"
          variant="subtitle2"
          style={{
            color: "white",
            fontWeight: 600,
          }}
        >
          Donate
        </Typography>
      </IconButton>
    </form>
  );
};

export default DonateButton;
