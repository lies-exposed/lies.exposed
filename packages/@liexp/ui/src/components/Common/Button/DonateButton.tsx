import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton } from "@mui/material";
import * as React from "react";

const DonateButton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <form
      className={className}
      action="https://www.paypal.com/donate"
      method="post"
      target="_top"
      style={{ display: "flex", flex: "0 0 auto" }}
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
        style={{ padding: 0, marginRight: 10, fontSize: undefined }}
        size="large">
        <FontAwesomeIcon
          icon={"circle-dollar-to-slot"}
          style={{ color: "white" }}
          size="1x"
        />
      </IconButton>
    </form>
  );
};

export default DonateButton;
