import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton, Typography } from "@material-ui/core";
import * as React from "react";

const DonateButton: React.FC = () => {
  return (
    <form
      action="https://www.paypal.com/donate"
      method="post"
      target="_top"
      style={{ display: 'flex', flex: "0 0 auto", height: 32 }}
    >
      <input type="hidden" name="hosted_button_id" value="BNAGL4D89LJDE" />
      <input type="hidden" name="no_recurring" value="0" />
      <input type="hidden" name="item_name" value="Support for lies.exposed" />
      <input type="hidden" name="item_number" value="lies.exposed support" />
      <input type="hidden" name="amount" value="5.00" />
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
